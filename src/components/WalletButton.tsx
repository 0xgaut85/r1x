'use client';

import { motion } from 'framer-motion';
import { modal } from '@/lib/wallet-provider';
import { useWallet } from '@/hooks/useWallet';

interface WalletButtonProps {
  variant?: 'default' | 'agent' | 'panel';
  className?: string;
}

export default function WalletButton({ variant = 'default', className = '' }: WalletButtonProps) {
  // Always call hooks in the same order - wagmi will handle provider check
  const { address, isConnected } = useWallet();

  const handleClick = () => {
    modal.open();
  };

  // Agent variant (dark background, top-right)
  if (variant === 'agent') {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`px-5 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] backdrop-blur-md text-white transition-all duration-300 ${className}`}
        style={{
          fontFamily: 'TWKEverettMono-Regular, monospace',
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '0.5px',
          clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
      </motion.button>
    );
  }

  // Panel variant (light background, styled for panels)
  if (variant === 'panel') {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`px-6 py-3 bg-gradient-to-r from-[#FF4D00] to-[#FF6B35] text-white rounded-xl ${className}`}
        style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
      >
        {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
      </motion.button>
    );
  }

  // Default variant (header style)
  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`px-4 py-2 bg-white text-black transition-all duration-200 hover:opacity-90 ${className}`}
      style={{
        clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
        fontFamily: 'TWKEverettMono-Regular, monospace',
        fontSize: '12px',
        fontWeight: 400,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
    </motion.button>
  );
}
