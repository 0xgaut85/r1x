'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';
import { ChatMessage } from '@/lib/types/chat';

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

export default function R1xAgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/r1x-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
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
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#0A0A0A', overflowY: 'hidden' }}>
      {/* Premium Background Layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle radial gradients */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(255, 77, 0, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 80% 70%, rgba(255, 77, 0, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(255, 77, 0, 0.06) 0%, transparent 70%)',
              'radial-gradient(circle at 20% 30%, rgba(255, 77, 0, 0.08) 0%, transparent 60%)',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Refined grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Premium Home Button */}
      <motion.div 
        className="fixed top-6 right-6 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.a
          href="/"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 bg-white/95 backdrop-blur-md text-black transition-all duration-300"
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.5px',
            clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          Home
        </motion.a>
      </motion.div>

      {/* Main Chat Container */}
      <main className="flex-1 flex flex-col relative z-10">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto py-12 r1x-agent-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 77, 0, 0.2) transparent' }}>
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ 
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <motion.div 
                        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
                        style={{
                          background: 'linear-gradient(135deg, #FF4D00 0%, #FF6B35 100%)',
                          boxShadow: '0 4px 20px rgba(255, 77, 0, 0.4), 0 0 0 1px rgba(255, 77, 0, 0.2)',
                        }}
                      >
                        <span className="text-white text-[10px] font-bold relative z-10" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', letterSpacing: '0.5px' }}>r1x</span>
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: [
                              '0 0 0 0 rgba(255, 77, 0, 0.4)',
                              '0 0 0 10px rgba(255, 77, 0, 0)',
                              '0 0 0 0 rgba(255, 77, 0, 0)',
                            ],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                          }}
                        />
                      </motion.div>
                    )}
                    <div className={`flex-1 max-w-[78%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <motion.div
                        className={`rounded-2xl px-6 py-4.5 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-[#FF4D00] via-[#FF5A1A] to-[#FF6B35] text-white ml-auto'
                            : 'bg-[#111111] text-[#E5E5E5] border border-[#1A1A1A] backdrop-blur-sm'
                        }`}
                        style={{
                          fontFamily: message.role === 'assistant' ? 'TWKEverettMono-Regular, monospace' : 'TWKEverett-Regular, sans-serif',
                          boxShadow: message.role === 'user' 
                            ? '0 12px 40px rgba(255, 77, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                            : '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03)',
                          fontSize: message.role === 'assistant' ? '14px' : '15px',
                          lineHeight: '1.6',
                          letterSpacing: message.role === 'assistant' ? '-0.2px' : '0',
                        }}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                        {message.status === 'sending' && (
                          <motion.div 
                            className="mt-4 flex items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-white/80 rounded-full"
                                animate={{
                                  y: [0, -10, 0],
                                  opacity: [0.4, 1, 0.4],
                                }}
                                transition={{
                                  duration: 0.7,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: 'easeInOut',
                                }}
                              />
                            ))}
                          </motion.div>
                        )}
                        {message.status === 'error' && (
                          <motion.div 
                            className="mt-4 text-xs text-red-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                          >
                            Error: {error || 'Failed to send message'}
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                    {message.role === 'user' && (
                      <motion.div 
                        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <span className="text-white text-sm font-medium relative z-10" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>U</span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex gap-4 justify-start"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative"
                    style={{
                      background: 'linear-gradient(135deg, #FF4D00 0%, #FF6B35 100%)',
                      boxShadow: '0 4px 20px rgba(255, 77, 0, 0.4), 0 0 0 1px rgba(255, 77, 0, 0.2)',
                    }}
                  >
                    <span className="text-white text-[10px] font-bold" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', letterSpacing: '0.5px' }}>r1x</span>
                  </div>
                  <motion.div 
                    className="bg-[#111111] border border-[#1A1A1A] rounded-2xl px-6 py-4.5 backdrop-blur-sm"
                    style={{
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2.5 h-2.5 bg-[#FF4D00] rounded-full"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Premium Suggestions */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    y: -2,
                    borderColor: '#FF4D00',
                    backgroundColor: '#151515',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left px-5 py-4 bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl transition-all duration-300 group relative overflow-hidden"
                  style={{ 
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    fontSize: '13px',
                    letterSpacing: '-0.2px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF4D00]/0 via-[#FF4D00]/8 to-[#FF4D00]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-[#B0B0B0] relative z-10 group-hover:text-white transition-colors duration-300 leading-relaxed">{suggestion}</span>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Premium Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mb-4"
            >
              <div className="bg-red-950/30 border border-red-500/30 rounded-xl px-5 py-4 backdrop-blur-md" style={{ 
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.1)',
              }}>
                <p className="text-sm text-red-300" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          {/* Premium Input Area */}
          <motion.div 
            className="pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div 
              className="flex gap-3 items-end bg-[#0F0F0F] border border-[#1A1A1A] rounded-2xl p-4 focus-within:border-[#FF4D00]/50 transition-all duration-500 relative"
              style={{ 
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.02)',
              }}
              whileFocus={{
                boxShadow: '0 12px 48px rgba(255, 77, 0, 0.15), 0 0 0 1px rgba(255, 77, 0, 0.3)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF4D00]/0 via-[#FF4D00]/5 to-[#FF4D00]/0 opacity-0 focus-within:opacity-100 transition-opacity duration-500" />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message r1x Agent..."
                className="flex-1 bg-transparent text-[#E5E5E5] placeholder-[#666666] resize-none outline-none text-sm sm:text-base relative z-10 r1x-agent-textarea"
                style={{ 
                  fontFamily: 'TWKEverettMono-Regular, monospace',
                  overflow: 'hidden',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  fontSize: '14px',
                  letterSpacing: '-0.2px',
                  lineHeight: '1.5',
                }}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                  target.style.overflowY = 'hidden';
                }}
              />
              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1, y: input.trim() && !isLoading ? -1 : 0 }}
                whileTap={{ scale: input.trim() && !isLoading ? 0.95 : 1 }}
                className="px-6 py-3 bg-gradient-to-r from-[#FF4D00] via-[#FF5A1A] to-[#FF6B35] text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden"
                style={{
                  fontFamily: 'TWKEverettMono-Regular, monospace',
                  fontSize: '12px',
                  fontWeight: 400,
                  letterSpacing: '0.5px',
                  boxShadow: input.trim() && !isLoading 
                    ? '0 8px 24px rgba(255, 77, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                    : 'none',
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                  animate={{
                    x: input.trim() && !isLoading ? ['-100%', '100%'] : '0%',
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <span className="relative z-10">Send</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Premium Bottom Arrow Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-6">
        <motion.button
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-[#0F0F0F] border border-[#1A1A1A] rounded-xl flex items-center justify-center backdrop-blur-md"
          style={{ 
            fontFamily: 'TWKEverettMono-Regular, monospace',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: isNavExpanded ? 180 : 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <path
              d="M6 15L12 9L18 15"
              stroke="#E5E5E5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.button>

        {/* Expanded Footer */}
        <AnimatePresence>
          {isNavExpanded && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNavExpanded(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-30"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-40 max-h-[70vh] overflow-y-auto r1x-agent-scrollbar"
                style={{
                  backgroundColor: '#F7F7F7',
                  clipPath: 'polygon(32px 0%, calc(100% - 32px) 0%, 100% 32px, 100% calc(100% - 32px), calc(100% - 32px) 100%, 32px 100%, 0% calc(100% - 32px), 0% 32px)',
                  boxShadow: '0 -12px 48px rgba(0, 0, 0, 0.4)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255, 77, 0, 0.3) transparent',
                }}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="flex justify-end mb-4">
                    <motion.button
                      onClick={() => setIsNavExpanded(false)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors duration-200"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 5L15 15M15 5L5 15"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.button>
                  </div>
                  <Footer />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
