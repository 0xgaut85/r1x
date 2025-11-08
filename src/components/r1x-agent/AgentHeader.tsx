'use client';

import { motion } from 'framer-motion';
import WalletButton from '@/components/WalletButton';

interface AgentHeaderProps {
  address: string | undefined;
  isConnected: boolean;
}

export default function AgentHeader({ address, isConnected }: AgentHeaderProps) {
  return (
    <motion.div 
      className="fixed top-6 right-6 z-50 flex gap-3 items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <WalletButton variant="agent" />
      
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
  );
}

