'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage } from '@/lib/types/chat';
import { useWallet } from '@/hooks/useWallet';
import { useAccount } from 'wagmi';
import { base } from 'wagmi/chains';
import { modal } from '@/lib/wallet-provider';
import { wrapFetchWithPayment } from 'x402-fetch';

import { getX402ServerUrl } from '@/lib/x402-server-url';
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
  const { address, isConnected, chainId, walletClient } = useWallet();
  const { isConnected: wagmiConnected } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create x402-fetch wrapper - wrapFetchWithPayment accepts walletClient directly
  const fetchWithPayment = useMemo(() => {
    if (!walletClient) return null;
    try {
      return wrapFetchWithPayment(fetch, walletClient);
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

    if (!isConnected || !wagmiConnected) {
      modal.open();
      setError('Please connect your wallet to send messages');
      return;
    }

    if (chainId !== base.id) {
      setError('Please switch to Base network');
      return;
    }

    if (!fetchWithPayment) {
      setError('Wallet not ready. Please try again.');
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
      const x402ServerUrl = getX402ServerUrl();
      console.log('[Agent] Calling x402 server with x402-fetch:', x402ServerUrl);
      console.log('[Agent] Request details:', {
        url: `${x402ServerUrl}/api/r1x-agent/chat`,
        messageCount: updatedMessages.length,
      });

      // x402-fetch handles everything automatically:
      // - Detects 402 responses
      // - Generates payment proof
      // - Signs transaction automatically
      // - Re-sends with X-PAYMENT header
      const response = await fetchWithPayment(`${x402ServerUrl}/api/r1x-agent/chat`, {
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
      console.error('[Agent] Full error:', err);
      console.error('[Agent] Error name:', err.name);
      console.error('[Agent] Error message:', err.message);
      console.error('[Agent] Error stack:', err.stack);

      let errorMessage = err.message || 'An error occurred';
      
      // Improve error message for "Failed to fetch"
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        const x402ServerUrl = getX402ServerUrl();
        errorMessage = `Cannot connect to x402 server (${x402ServerUrl}). Please check:\n1. Server is running\n2. NEXT_PUBLIC_X402_SERVER_URL is set correctly\n3. CORS is configured\n\nOriginal error: ${err.message}`;
      }

      // Handle payment errors from x402-fetch
      if (err.message.includes('payment') || err.message.includes('402')) {
        errorMessage = `Payment required: ${err.message}`;
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
