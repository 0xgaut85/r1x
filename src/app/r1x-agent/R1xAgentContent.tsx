'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/lib/types/chat';
import { PaymentQuote, PaymentProof } from '@/lib/types/x402';
import { useWallet } from '@/hooks/useWallet';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import { modal } from '@/lib/wallet-provider';

import { getX402ServerUrl } from '@/lib/x402-server-url';
import AgentBackground from '@/components/r1x-agent/AgentBackground';
import AgentHeader from '@/components/r1x-agent/AgentHeader';
import AgentFooter from '@/components/r1x-agent/AgentFooter';
import ChatMessages from '@/components/r1x-agent/ChatMessages';
import ChatInput from '@/components/r1x-agent/ChatInput';
import ChatSuggestions from '@/components/r1x-agent/ChatSuggestions';
import AgentPaymentModal from '@/components/r1x-agent/AgentPaymentModal';
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
  const { address, isConnected, chainId, transferUSDC, formatUSDC } = useWallet();
  const { isConnected: wagmiConnected } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{ quote: PaymentQuote; messages: ChatMessage[] } | null>(null);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'processing' | 'verifying'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
    chainId: base.id,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (receipt && pendingPayment && txHash) {
      // Wait a bit for PayAI facilitator to index the transaction
      const verifyDelay = setTimeout(() => {
        handlePaymentComplete();
      }, 2000); // Wait 2 seconds after receipt for PayAI to index
      
      return () => clearTimeout(verifyDelay);
    }
  }, [receipt, pendingPayment, txHash]);

  const handlePaymentComplete = async () => {
    if (!pendingPayment || !txHash || !address) return;

    try {
      setPaymentStep('verifying');

      // Create payment proof from actual transaction data
      // The 'to' address should be where we actually sent the payment (facilitator or merchant)
      // The amount should match what was sent (from quote, which includes fees)
      const proof: PaymentProof = {
        transactionHash: txHash,
        blockNumber: receipt?.blockNumber ? Number(receipt.blockNumber) : 0,
        from: address,
        // Payment recipient: facilitator if present, otherwise merchant
        // This must match where the USDC was actually sent
        to: pendingPayment.quote.facilitator || pendingPayment.quote.merchant,
        // Amount sent (includes base amount + platform fee)
        amount: pendingPayment.quote.amount,
        token: pendingPayment.quote.token,
        timestamp: Date.now(),
      };

      console.log('[Payment] Payment proof:', proof);
      console.log('[Payment] Quote details:', pendingPayment.quote);

      const x402ServerUrl = getX402ServerUrl();
      const response = await fetch(`${x402ServerUrl}/api/r1x-agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': JSON.stringify(proof),
        },
        body: JSON.stringify({
          messages: pendingPayment.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          proof,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.reason || 'Payment verification failed');
      }

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

      setPendingPayment(null);
      setPaymentStep('idle');
      setTxHash(null);
      setIsLoading(false);
    } catch (err: any) {
      console.error('[Payment] Verification error:', err);
      setError(err.message || 'Payment verification failed');
      setPaymentStep('idle');
      setPendingPayment(null);
      setTxHash(null);
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    if (!pendingPayment || !address || !isConnected) return;

    try {
      setPaymentStep('processing');
      setError(null);

      if (chainId !== base.id) {
        throw new Error('Please switch to Base network');
      }

      // If facilitator address is provided, send to facilitator; otherwise send to merchant
      // PayAI facilitator requires payments to go through their contract
      const recipientAddress = pendingPayment.quote.facilitator || pendingPayment.quote.merchant;
      
      // CRITICAL: Validate that recipient is not the same as payer
      if (recipientAddress.toLowerCase() === address.toLowerCase()) {
        throw new Error('Cannot send payment to yourself. Please check MERCHANT_ADDRESS configuration.');
      }
      
      const amount = formatUSDC(pendingPayment.quote.amount);
      
      console.log('[Payment] Sending payment:', {
        recipientAddress,
        payerAddress: address,
        amount,
        facilitator: pendingPayment.quote.facilitator,
        merchant: pendingPayment.quote.merchant,
        quote: pendingPayment.quote,
      });
      
      const hash = await transferUSDC(recipientAddress, amount);
      setTxHash(hash);
    } catch (err: any) {
      console.error('[Payment] Payment error:', err);
      setError(err.message || 'Payment failed');
      setPaymentStep('idle');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isConnected || !wagmiConnected) {
      modal.open();
      setError('Please connect your wallet to send messages');
      return;
    }

    if (chainId !== base.id) {
      setError('Please switch to Base network');
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
    setPendingPayment(null);

    try {
      const x402ServerUrl = getX402ServerUrl();
      console.log('[Agent] Calling x402 server:', x402ServerUrl);
      console.log('[Agent] Request details:', {
        url: `${x402ServerUrl}/api/r1x-agent/chat`,
        messageCount: updatedMessages.length,
      });

      const response = await fetch(`${x402ServerUrl}/api/r1x-agent/chat`, {
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

      console.log('[Agent] Response status:', response.status);
      console.log('[Agent] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok && response.status !== 402) {
        const errorText = await response.text();
        console.error('[Agent] Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('[Agent] Response data:', data);

      if (response.status === 402) {
        const quote: PaymentQuote = data.payment || data.quote;
        if (quote) {
          setPendingPayment({ quote, messages: updatedMessages });
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'sent' };
            return updated;
          });
          setIsLoading(false);
          return;
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

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
      console.error('[Agent] Full error:', err);
      console.error('[Agent] Error name:', err.name);
      console.error('[Agent] Error message:', err.message);
      console.error('[Agent] Error stack:', err.stack);

      let errorMessage = err.message || 'An error occurred';
      
      // Améliorer le message d'erreur pour "Failed to fetch"
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        const x402ServerUrl = getX402ServerUrl();
        errorMessage = `Cannot connect to x402 server (${x402ServerUrl}). Please check:\n1. Server is running\n2. NEXT_PUBLIC_X402_SERVER_URL is set correctly\n3. CORS is configured\n\nOriginal error: ${err.message}`;
      }

      setError(errorMessage);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], status: 'error' };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleClosePayment = () => {
    setPendingPayment(null);
    setPaymentStep('idle');
    setTxHash(null);
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

          <AnimatePresence>
            {pendingPayment && (
              <AgentPaymentModal
                quote={pendingPayment.quote}
                paymentStep={paymentStep}
                txHash={txHash}
                error={error}
                chainId={chainId}
                isConnected={isConnected}
                onPay={handlePay}
                onClose={handleClosePayment}
              />
            )}
          </AnimatePresence>

          {error && !pendingPayment && (
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

