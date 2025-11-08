'use client';

import { motion } from 'framer-motion';
import { ChatMessage } from '@/lib/types/chat';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export default function ChatSuggestions({ suggestions, onSuggestionClick }: ChatSuggestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
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
  );
}

