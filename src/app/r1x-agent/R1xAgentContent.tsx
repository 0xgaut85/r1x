'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/lib/types/chat';
import { PaymentQuote, PaymentProof } from '@/lib/types/x402';
import { useWallet } from '@/hooks/useWallet';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import { modal } from '@/lib/wallet-provider';

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
      handlePaymentComplete();
    }
  }, [receipt, pendingPayment, txHash]);

  const handlePaymentComplete = async () => {
    if (!pendingPayment || !txHash || !address) return;

    try {
      setPaymentStep('verifying');

      const proof: PaymentProof = {
        transactionHash: txHash,
        blockNumber: receipt?.blockNumber ? Number(receipt.blockNumber) : 0,
        from: address,
        to: pendingPayment.quote.merchant,
        amount: pendingPayment.quote.amount,
        token: pendingPayment.quote.token,
        timestamp: Date.now(),
      };

      const response = await fetch('/api/r1x-agent/chat', {
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
        throw new Error(data.error || 'Payment verification failed');
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

      const amount = formatUSDC(pendingPayment.quote.amount);
      const hash = await transferUSDC(pendingPayment.quote.merchant, amount);
      setTxHash(hash);
    } catch (err: any) {
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
      const response = await fetch('/api/r1x-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

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
      setError(err.message || 'An error occurred');
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

