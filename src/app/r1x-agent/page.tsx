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
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Animated Background Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(255, 77, 0, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(255, 77, 0, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(255, 77, 0, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Top Home Button */}
      <motion.div 
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.a
          href="/"
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 77, 0, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-white text-black rounded transition-all duration-200"
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            fontSize: '12px',
            fontWeight: 400,
            clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
            boxShadow: '0 4px 12px rgba(255, 77, 0, 0.2)',
          }}
        >
          Home
        </motion.a>
      </motion.div>

      {/* Main Chat Container */}
      <main className="flex-1 flex flex-col relative z-10">
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 pt-20 pb-24">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto py-8">
            <div className="space-y-8">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <motion.div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 relative"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        style={{
                          background: 'linear-gradient(135deg, #FF4D00 0%, #FF6B35 100%)',
                          boxShadow: '0 4px 20px rgba(255, 77, 0, 0.4)',
                        }}
                      >
                        <span className="text-white text-xs font-bold relative z-10" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>r1x</span>
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: [
                              '0 0 0 0 rgba(255, 77, 0, 0.4)',
                              '0 0 0 8px rgba(255, 77, 0, 0)',
                              '0 0 0 0 rgba(255, 77, 0, 0)',
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeOut',
                          }}
                        />
                      </motion.div>
                    )}
                    <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <motion.div
                        className={`rounded-2xl px-5 py-4 shadow-lg ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-[#FF4D00] to-[#FF6B35] text-white ml-auto'
                            : 'bg-[#1a1a1a] text-[#ECECF1] border border-[#2a2a2a] backdrop-blur-sm'
                        }`}
                        style={{
                          fontFamily: message.role === 'assistant' ? 'TWKEverettMono-Regular, monospace' : 'TWKEverett-Regular, sans-serif',
                          boxShadow: message.role === 'user' 
                            ? '0 8px 32px rgba(255, 77, 0, 0.3)' 
                            : '0 8px 32px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                        {message.status === 'sending' && (
                          <motion.div 
                            className="mt-3 flex items-center gap-1.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-white/70 rounded-full"
                                animate={{
                                  y: [0, -8, 0],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                  ease: 'easeInOut',
                                }}
                              />
                            ))}
                          </motion.div>
                        )}
                        {message.status === 'error' && (
                          <motion.div 
                            className="mt-3 text-xs text-red-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            Error: {error || 'Failed to send message'}
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                    {message.role === 'user' && (
                      <motion.div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 relative"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        style={{
                          background: 'linear-gradient(135deg, #FF4D00 0%, #FF6B35 100%)',
                          boxShadow: '0 4px 20px rgba(255, 77, 0, 0.4)',
                        }}
                      >
                        <span className="text-white text-xs font-bold relative z-10" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>U</span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 justify-start"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 relative"
                    style={{
                      background: 'linear-gradient(135deg, #FF4D00 0%, #FF6B35 100%)',
                      boxShadow: '0 4px 20px rgba(255, 77, 0, 0.4)',
                    }}
                  >
                    <span className="text-white text-xs font-bold" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>r1x</span>
                  </div>
                  <motion.div 
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-5 py-4 backdrop-blur-sm"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2.5 h-2.5 bg-[#FF4D00] rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 0.8,
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

          {/* Suggestions (shown only when there's just the welcome message) */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02, 
                    backgroundColor: '#1f1f1f',
                    borderColor: '#FF4D00',
                    boxShadow: '0 8px 24px rgba(255, 77, 0, 0.2)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left px-5 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-[#FF4D00] transition-all duration-300 group relative overflow-hidden"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF4D00]/0 via-[#FF4D00]/5 to-[#FF4D00]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="text-sm text-[#ECECF1] relative z-10 group-hover:text-white transition-colors duration-300">{suggestion}</span>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4"
            >
              <div className="bg-red-900/20 border border-red-500/50 rounded-xl px-5 py-4 backdrop-blur-sm" style={{ boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)' }}>
                <p className="text-sm text-red-400" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  {error}
                </p>
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <motion.div 
            className="pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="flex gap-3 items-end bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 focus-within:border-[#FF4D00] transition-all duration-300 relative overflow-hidden"
              whileFocus={{
                boxShadow: '0 8px 32px rgba(255, 77, 0, 0.2)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF4D00]/0 via-[#FF4D00]/5 to-[#FF4D00]/0 opacity-0 focus-within:opacity-100 transition-opacity duration-300" />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message r1x Agent..."
                className="flex-1 bg-transparent text-[#ECECF1] placeholder-[#8E8EA0] resize-none outline-none text-sm sm:text-base relative z-10"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1 }}
                whileTap={{ scale: input.trim() && !isLoading ? 0.95 : 1 }}
                className="px-5 py-2.5 bg-gradient-to-r from-[#FF4D00] to-[#FF6B35] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden"
                style={{
                  fontFamily: 'TWKEverettMono-Regular, monospace',
                  fontSize: '12px',
                  boxShadow: input.trim() && !isLoading ? '0 4px 16px rgba(255, 77, 0, 0.4)' : 'none',
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{
                    x: input.trim() && !isLoading ? ['-100%', '100%'] : '0%',
                  }}
                  transition={{
                    duration: 2,
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

      {/* Bottom Arrow Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4">
        <motion.button
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-t from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] rounded-xl flex items-center justify-center backdrop-blur-sm"
          style={{ 
            fontFamily: 'TWKEverettMono-Regular, monospace',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          }}
        >
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: isNavExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <path
              d="M6 15L12 9L18 15"
              stroke="#ECECF1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.button>

        {/* Expanded Navbar */}
        <AnimatePresence>
          {isNavExpanded && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNavExpanded(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-40 max-h-[70vh] overflow-y-auto"
                style={{
                  backgroundColor: '#F7F7F7',
                  clipPath: 'polygon(32px 0%, calc(100% - 32px) 0%, 100% 32px, 100% calc(100% - 32px), calc(100% - 32px) 100%, 32px 100%, 0% calc(100% - 32px), 0% 32px)',
                  boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {/* Close Button */}
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
