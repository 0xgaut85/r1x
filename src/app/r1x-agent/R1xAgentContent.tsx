'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage } from '@/lib/types/chat';
import { useWallet } from '@/hooks/useWallet';
import { useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { modal } from '@/lib/wallet-provider';
import { wrapFetchWithPayment } from 'x402-fetch';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout
      
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
      clearTimeout(timeoutId);

      console.log('[Agent] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Agent] Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('[Agent] Response data:', data);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message || data.data?.message,
        status: 'sent',
      };

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'sent' };
        return [...updated, assistantMessage];
      });
    } catch (err: any) {
      // Clear timeout on error
      clearTimeout(timeoutId);
      
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
