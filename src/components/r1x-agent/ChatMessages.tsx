'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/lib/types/chat';
import MessageBubble from './MessageBubble';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatMessages({ messages, isLoading, messagesEndRef }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto py-12 r1x-agent-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 77, 0, 0.2) transparent' }}>
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} index={index} />
          ))}
        </AnimatePresence>
        
        {isLoading && <LoadingMessage />}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function LoadingMessage() {
  return (
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
  );
}

