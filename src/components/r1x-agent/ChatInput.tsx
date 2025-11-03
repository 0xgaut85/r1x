'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export default function ChatInput({ input, setInput, onSend, isLoading }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
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
        <SendButton input={input} isLoading={isLoading} onSend={onSend} />
      </motion.div>
    </motion.div>
  );
}

function SendButton({ input, isLoading, onSend }: { input: string; isLoading: boolean; onSend: () => void }) {
  return (
    <motion.button
      onClick={onSend}
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
  );
}

