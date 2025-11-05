'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/Footer';

export default function AgentFooter() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-6">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
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
          animate={{ rotate: isExpanded ? 180 : 0 }}
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

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
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
                    onClick={() => setIsExpanded(false)}
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
  );
}

