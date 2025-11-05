'use client';

import { motion } from 'framer-motion';

interface ErrorBannerProps {
  error: string;
}

export default function ErrorBanner({ error }: ErrorBannerProps) {
  return (
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
  );
}

