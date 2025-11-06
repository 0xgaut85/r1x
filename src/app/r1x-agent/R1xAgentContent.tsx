'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage } from '@/lib/types/chat';
import { useWallet } from '@/hooks/useWallet';
import { useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { modal } from '@/lib/wallet-provider';
import { wrapFetchWithPayment } from 'x402-fetch';
import { parseIntent, isPurchaseIntent, ServiceCategory } from '@/lib/intent/parseIntent';
import { marketplaceCatalog } from '@/lib/marketplace/catalog';
import { X402Client } from '@/lib/payments/x402Client';
import { MarketplaceService } from '@/lib/types/x402';

// No longer need x402-server-url - using Next.js API routes (same origin)
import AgentBackground from '@/components/r1x-agent/AgentBackground';
import AgentHeader from '@/components/r1x-agent/AgentHeader';
import AgentFooter from '@/components/r1x-agent/AgentFooter';
import ChatMessages from '@/components/r1x-agent/ChatMessages';
import ChatInput from '@/components/r1x-agent/ChatInput';
import ChatSuggestions from '@/components/r1x-agent/ChatSuggestions';
import ErrorBanner from '@/components/r1x-agent/ErrorBanner';

const initialWelcomeMessage: ChatMessage = {
  role: 'assistant',
  content: 'Hello! I\'m r1x Agent, your assistant for the machine economy. I can help you understand how r1x enables autonomous machine-to-machine transactions, answer questions about our infrastructure, and guide you through building on Base. What would you like to know?',
};

const suggestions = [
  'How does r1x enable machine-to-machine payments?',
  'What is the machine economy?',
  'How do I integrate r1x SDK?',
  'Tell me about r1x Marketplace',
];

export default function R1xAgentContent() {
  const { walletClient, address, isConnected } = useWallet();
  const { isConnected: wagmiConnected } = useAccount();
  const chainId = useChainId();
  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize marketplace catalog with 60s refresh
  useEffect(() => {
    marketplaceCatalog.startAutoRefresh();
    return () => {
      marketplaceCatalog.stopAutoRefresh();
    };
  }, []);

  /**
   * Conforme aux docs PayAI officielles : https://docs.payai.network/x402/clients/typescript/fetch
   * 
   * wrapFetchWithPayment(fetch, walletClient, maxValue)
   * - fetch: fonction fetch native
   * - walletClient: Signer compatible (walletClient Wagmi = Client viem avec WalletActions = EvmSigner)
   * - maxValue: montant maximum autorisé en base units (0.25 USDC = 250000 pour USDC avec 6 décimales)
   * 
   * x402-fetch gère automatiquement :
   * 1. Détection des réponses 402 Payment Required
   * 2. Génération du payment proof
   * 3. Signature de la transaction USDC via walletClient
   * 4. Ré-envoi avec header X-PAYMENT
   * 5. Retries en cas d'erreur
   */
  const fetchWithPayment = useMemo(() => {
    if (!walletClient) return null;
    try {
      // Conforme aux docs PayAI officielles
      return wrapFetchWithPayment(
        fetch, 
        walletClient as any, // walletClient Wagmi compatible avec EvmSigner (SignerWallet)
        BigInt(0.25 * 10 ** 6) // max 0.25 USDC (en base units)
      );
    } catch (err) {
      console.error('[x402-fetch] Failed to wrap fetch:', err);
      return null;
    }
  }, [walletClient]);

  // x402 client for autonomous purchases (higher max: 100 USDC)
  const x402Client = useMemo(() => {
    if (!walletClient) return null;
    try {
      return new X402Client({
        walletClient,
        maxValue: BigInt(100 * 10 ** 6), // 100 USDC max for service purchases
      });
    } catch (err) {
      console.error('[X402Client] Failed to initialize:', err);
      return null;
    }
  }, [walletClient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handle autonomous purchase of a marketplace service
   */
  const handleAutopurchase = async (service: MarketplaceService): Promise<boolean> => {
    if (!x402Client) {
      console.error('[Autopurchase] x402Client not initialized');
      setError('Payment client not available. Please ensure your wallet is connected.');
      return false;
    }

    if (!service.endpoint) {
      console.error('[Autopurchase] Service has no endpoint:', service.id);
      setError(`Service "${service.name}" is not available for direct purchase. Please check the marketplace.`);
      return false;
    }

    try {
      // Show in chat that we're purchasing
      const purchaseMessage: ChatMessage = {
        role: 'assistant',
        content: `Purchasing "${service.name}" for ${service.priceWithFee || service.price} USDC...`,
        status: 'sending',
      };
      setMessages(prev => [...prev, purchaseMessage]);

      console.log('[Autopurchase] Purchasing service:', {
        id: service.id,
        name: service.name,
        endpoint: service.endpoint,
        price: service.price,
        priceWithFee: service.priceWithFee,
        isExternal: service.isExternal,
      });

      // Call service endpoint with x402 payment via Next.js proxy
      const response = await x402Client.purchaseService({
        id: service.id,
        name: service.name,
        endpoint: service.endpoint,
        price: service.price,
        priceWithFee: service.priceWithFee,
        isExternal: service.isExternal,
      });

      console.log('[Autopurchase] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        console.error('[Autopurchase] Purchase failed:', {
          status: response.status,
          error: errorData,
        });

        // Handle 402 Payment Required (shouldn't happen with x402-fetch, but handle gracefully)
        if (response.status === 402) {
          throw new Error(
            `Payment required but could not be processed. Please check:\n` +
            `1. Wallet is connected and on Base network\n` +
            `2. You have sufficient USDC balance\n` +
            `3. Transaction was approved in wallet`
          );
        }

        throw new Error(
          `Purchase failed (HTTP ${response.status}): ${errorData.error || errorData.message || errorText}`
        );
      }

      const result = await response.json();
      console.log('[Autopurchase] Purchase successful:', result);
      
      // Update purchase message
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: `✅ Successfully purchased "${service.name}"! ${result.message || result.data?.message || 'Service accessed.'}`,
          status: 'sent',
        };
        return updated;
      });

      return true;
    } catch (error: any) {
      console.error('[Autopurchase] Error:', error);
      console.error('[Autopurchase] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      
      // Provide helpful error message
      let errorMessage = error.message || 'Unknown error';
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        errorMessage = `Cannot connect to payment service. Please check:\n` +
          `1. Network connection is stable\n` +
          `2. Next.js API route is accessible (/api/x402/pay)\n` +
          `3. Express server is running\n` +
          `4. Wallet is properly connected\n\n` +
          `Original error: ${error.message}`;
      } else if (error.message?.includes('exceeds maximum')) {
        errorMessage = error.message;
      } else if (error.message?.includes('not initialized')) {
        errorMessage = `Payment client error: ${error.message}\n\nPlease reconnect your wallet and try again.`;
      }
      
      // Update purchase message with error
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: `❌ Failed to purchase "${service.name}": ${errorMessage}`,
          status: 'error',
        };
        return updated;
      });

      setError(errorMessage);
      return false;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Vérifier que le wallet est connecté et que x402-fetch est disponible
    if (!wagmiConnected || !fetchWithPayment) {
      modal.open();
      setError('Please connect your wallet to send messages');
      setIsLoading(false);
      return;
    }

    if (chainId !== base.id) {
      setError('Please switch to Base network');
      setIsLoading(false);
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      status: 'sending',
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Check if this is a purchase intent
    const intent = parseIntent(input.trim());
    const isPurchase = isPurchaseIntent(input.trim());
    
    // If purchase intent, find and propose services
    if (isPurchase && intent.category !== 'other') {
      const proposals = marketplaceCatalog.findServices(intent.category, 5);
      
      // Filter to only services with endpoints (purchasable)
      const purchasableProposals = proposals.filter(s => s.endpoint);
      
      if (purchasableProposals.length > 0) {
        // Propose services in chat (show top 3)
        const topProposals = purchasableProposals.slice(0, 3);
        const proposalText = topProposals
          .map((s, i) => `${i + 1}. **${s.name}** - ${s.priceWithFee || s.price} USDC\n   ${s.description || ''}`)
          .join('\n\n');
        
        const proposalMessage: ChatMessage = {
          role: 'assistant',
          content: `I found ${purchasableProposals.length} ${intent.category} service(s) for you:\n\n${proposalText}\n\nI'll proceed with the best option: **${topProposals[0].name}**.`,
          status: 'sent',
        };
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'sent' };
          return [...updated, proposalMessage];
        });

        // Automatically purchase the top proposal
        const purchased = await handleAutopurchase(topProposals[0]);
        
        if (!purchased && topProposals.length > 1) {
          // Try next proposal if first failed
          await handleAutopurchase(topProposals[1]);
        }

        setIsLoading(false);
        return;
      } else if (proposals.length > 0) {
        // Services found but none have endpoints
        const infoMessage: ChatMessage = {
          role: 'assistant',
          content: `I found ${proposals.length} ${intent.category} service(s), but they're not yet available for direct purchase. Please check the marketplace for more details.`,
          status: 'sent',
        };
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'sent' };
          return [...updated, infoMessage];
        });

        setIsLoading(false);
        return;
      }
    }

    // Add timeout to prevent infinite loading
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      /**
       * Utilisation conforme aux docs PayAI officielles
       * x402-fetch gère automatiquement tout le flow de paiement :
       * - Si 402 reçu → génère automatiquement le payment proof
       * - Signe la transaction USDC via walletClient
       * - Ré-envoie avec header X-PAYMENT
       * - Retries automatiques en cas d'erreur
       * 
       * L'utilisateur verra uniquement la popup de signature dans son wallet
       * 
       * Using Next.js API route (/api/r1x-agent/chat) which proxies to Express server
       * This eliminates CORS issues since browser calls same origin
       */
      
      timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout
      
      const response = await fetchWithPayment('/api/r1x-agent/chat', {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });
      
      // Clear timeout on success
      if (timeoutId) clearTimeout(timeoutId);

      console.log('[Agent] Response status:', response.status);

      // Handle 402 Payment Required responses
      // x402-fetch should handle 402 automatically, but if we still get 402,
      // it means x402-fetch gave up (user rejected payment, payment failed, or payment proof invalid)
      if (response.status === 402) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        console.error('[Agent] 402 Payment Required after x402-fetch retry:', errorData);
        
        // Check if this is a payment quote format
        if (errorData.accepts && Array.isArray(errorData.accepts)) {
          const quote = errorData.accepts[0];
          throw new Error(
            `Payment required but could not be processed:\n\n` +
            `Amount: ${quote.maxAmountRequired ? (parseInt(quote.maxAmountRequired) / 1e6).toFixed(6) + ' USDC' : 'N/A'}\n` +
            `Recipient: ${quote.payTo || 'N/A'}\n` +
            `Network: ${quote.network || 'N/A'}\n\n` +
            `Possible causes:\n` +
            `1. Payment transaction was rejected or failed\n` +
            `2. Payment proof format invalid\n` +
            `3. Express server not accepting payment proof\n\n` +
            `Please check:\n` +
            `- Wallet transaction status\n` +
            `- Express server logs (Railway → r1x-server → Logs)\n` +
            `- Browser console for detailed errors`
          );
        }
        
        throw new Error(`Payment required (402) but could not be processed. Please check your wallet and try again.`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Agent] Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('[Agent] Response data:', data);

      const responseText = data.message || data.data?.message || '';
      
      // Check if agent wants to trigger a purchase
      const purchaseMatch = responseText.match(/\[PURCHASE:([^\]]+)\]/);
      if (purchaseMatch && x402Client) {
        const serviceId = purchaseMatch[1];
        console.log('[Agent] Purchase trigger detected for service:', serviceId);
        
        // Find the service in the catalog
        const allServices = marketplaceCatalog.getAllServices();
        const service = allServices.find(s => s.id === serviceId);
        
        if (service && service.endpoint) {
          // Remove the purchase marker from the message
          const cleanMessage = responseText.replace(/\[PURCHASE:[^\]]+\]/, '').trim();
          
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: cleanMessage || 'Purchasing service...',
            status: 'sent',
          };

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'sent' };
            return [...updated, assistantMessage];
          });

          // Trigger the purchase
          await handleAutopurchase(service);
          return;
        } else {
          console.warn('[Agent] Service not found or has no endpoint:', serviceId);
        }
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseText,
        status: 'sent',
      };

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'sent' };
        return [...updated, assistantMessage];
      });
    } catch (err: any) {
      // Clear timeout on error
      if (timeoutId) clearTimeout(timeoutId);
      
      console.error('[Agent] Error:', err);
      console.error('[Agent] Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });

      let errorMessage = err.message || 'An error occurred';
      
      // Handle timeout
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        errorMessage = 'Request timed out. This might be due to:\n1. Wallet connection issues (check Reown domain allowlist)\n2. Network issues\n3. Server not responding\n\nPlease try again or check the console for details.';
      } else if (err.message.includes('502') || err.message.includes('not responding') || err.message.includes('Express server')) {
        errorMessage = `Express server error (502):\n\nThe Express x402 server is not responding. Please check:\n\n1. Railway → Express Service → Status (should be "Active")\n2. Railway → Express Service → Logs (check for errors)\n3. Verify X402_SERVER_URL is correct in Railway Next.js service\n4. Test Express server: curl <EXPRESS_URL>/health\n\nIf the service is down, restart it in Railway.`;
      } else if (err.message.includes('402') || err.message.includes('Payment required')) {
        // Already handled above, but catch here to ensure proper formatting
        errorMessage = err.message;
      } else if (err.message.includes('Failed to fetch') || err.name === 'TypeError' || err.message.includes('network')) {
        errorMessage = `Cannot connect to x402 server. Please check:\n1. Next.js API route is accessible (/api/r1x-agent/chat)\n2. X402_SERVER_URL is set in Railway (for server-side proxy)\n3. Express server is running and accessible\n4. Wallet is properly connected (check Reown domain allowlist)\n5. Check browser console and server logs for details\n\nOriginal error: ${err.message}`;
      } else if (err.message.includes('Runtime config')) {
        errorMessage = `Configuration error: ${err.message}\n\nPlease ensure X402_SERVER_URL is set in Railway environment variables.`;
      } else if (err.message.includes('Reown') || err.message.includes('allow list') || err.message.includes('APKT002')) {
        errorMessage = `Wallet connection issue:\n\nThe domain ${typeof window !== 'undefined' ? window.location.origin : 'your domain'} is not in the Reown allowlist.\n\nPlease add it at: https://dashboard.reown.com\n\nProject ID: ac7a5e22564f2698c80f05dbf4811d6a`;
      }

      setError(errorMessage);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'error' };
        return updated;
      });
    } finally {
      setIsLoading(false);
      // Reset loading state even if there's an error
      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.status === 'sending') {
          updated[updated.length - 1] = { ...lastMessage, status: 'sent' };
        }
        return updated;
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#0A0A0A', overflowY: 'hidden' }}>
      <AgentBackground />
      <AgentHeader address={address} isConnected={isConnected} />

      <main className="flex-1 flex flex-col relative z-10">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <ChatMessages 
            messages={messages} 
            isLoading={isLoading} 
            messagesEndRef={messagesEndRef}
          />

          {messages.length === 1 && (
            <ChatSuggestions 
              suggestions={suggestions} 
              onSuggestionClick={handleSuggestionClick}
            />
          )}

          {error && (
            <ErrorBanner error={error} />
          )}

          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
      </main>

      <AgentFooter />
    </div>
  );
}
