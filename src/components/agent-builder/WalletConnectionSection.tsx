'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { modal } from '@/lib/wallet-provider';
import { useWallet } from '@/hooks/useWallet';

export default function WalletConnectionSection() {
  const { 
    address, 
    isConnected, 
    isEVMConnected, 
    evmAddress,
    isSolanaConnected,
    solanaAddress 
  } = useWallet();

  const handleConnect = () => {
    modal.open();
  };

  const formatAddress = (addr: string | null | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-8 rounded-lg">
      <div className="mb-8">
        <h2 
          className="text-white text-2xl mb-3"
          style={{
            fontFamily: 'TWKEverett-Regular, sans-serif',
            fontWeight: 400,
            letterSpacing: '-1px',
          }}
        >
          Multi-Chain Wallet Connection
        </h2>
        <p 
          className="text-white/60 text-sm leading-relaxed"
          style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}
        >
          Connect your wallets to enable agent deployment and payment capabilities across Base and Solana networks. 
          Agents can automatically handle payments on both networks using x402 protocol.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Base Network */}
        <motion.div 
          className="bg-white/5 border border-white/10 p-6 rounded-lg hover:border-[#0052FF]/50 transition-all duration-300"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
              <Image
                src="/logos/coinbase.png"
                alt="Base Network"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 
                className="text-white text-lg mb-1"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
              >
                BASE NETWORK
              </h3>
              <p className="text-white/50 text-xs" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
                EVM Compatible • USDC Payments
              </p>
            </div>
            {isEVMConnected && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-medium"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                >
                  CONNECTED
                </span>
              </div>
            )}
          </div>
          
          {isEVMConnected && evmAddress ? (
            <div className="space-y-4">
              <div className="bg-black/40 p-3 rounded border border-white/5">
                <div className="text-white/40 text-xs mb-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  WALLET ADDRESS
                </div>
                <div className="text-white text-sm break-all font-mono">
                  {evmAddress}
                </div>
                <div className="text-white/60 text-xs mt-2 font-mono">
                  {formatAddress(evmAddress)}
                </div>
              </div>
              <motion.button
                onClick={handleConnect}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm transition-colors border border-white/20"
                style={{
                  fontFamily: 'TWKEverettMono-Regular, monospace',
                  clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)',
                }}
              >
                MANAGE WALLET
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={handleConnect}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3.5 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white transition-colors font-medium"
              style={{
                fontFamily: 'TWKEverettMono-Regular, monospace',
                fontSize: '13px',
                fontWeight: 400,
                clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
              }}
            >
              CONNECT BASE WALLET
            </motion.button>
          )}
        </motion.div>

        {/* Solana Network */}
        <motion.div 
          className="bg-white/5 border border-white/10 p-6 rounded-lg hover:border-[#14F195]/50 transition-all duration-300"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
              <Image
                src="/solana.jpg"
                alt="Solana Network"
                width={40}
                height={40}
                className="object-contain rounded-full"
              />
            </div>
            <div className="flex-1">
              <h3 
                className="text-white text-lg mb-1"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
              >
                SOLANA NETWORK
              </h3>
              <p className="text-white/50 text-xs" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
                High Performance • USDC Payments
              </p>
            </div>
            {isSolanaConnected && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-medium"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                >
                  CONNECTED
                </span>
              </div>
            )}
          </div>
          
          {isSolanaConnected && solanaAddress ? (
            <div className="space-y-4">
              <div className="bg-black/40 p-3 rounded border border-white/5">
                <div className="text-white/40 text-xs mb-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  WALLET ADDRESS
                </div>
                <div className="text-white text-sm break-all font-mono">
                  {solanaAddress}
                </div>
                <div className="text-white/60 text-xs mt-2 font-mono">
                  {formatAddress(solanaAddress)}
                </div>
              </div>
              <motion.button
                onClick={handleConnect}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm transition-colors border border-white/20"
                style={{
                  fontFamily: 'TWKEverettMono-Regular, monospace',
                  clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)',
                }}
              >
                MANAGE WALLET
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={handleConnect}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-[#14F195] to-[#9945FF] hover:from-[#14F195]/90 hover:to-[#9945FF]/90 text-white transition-colors font-medium"
              style={{
                fontFamily: 'TWKEverettMono-Regular, monospace',
                fontSize: '13px',
                fontWeight: 400,
                clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
              }}
            >
              CONNECT SOLANA WALLET
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Network Status Summary */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-lg mb-8">
        <h3 
          className="text-white text-lg mb-4"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          NETWORK STATUS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isEVMConnected ? 'bg-green-400' : 'bg-white/20'}`} />
            <div>
              <div className="text-white text-sm font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Base Network
              </div>
              <div className="text-white/50 text-xs" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
                {isEVMConnected ? 'Ready for payments' : 'Not connected'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isSolanaConnected ? 'bg-green-400' : 'bg-white/20'}`} />
            <div>
              <div className="text-white text-sm font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Solana Network
              </div>
              <div className="text-white/50 text-xs" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
                {isSolanaConnected ? 'Ready for payments' : 'Not connected'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${(isEVMConnected || isSolanaConnected) ? 'bg-[#FF4D00]' : 'bg-white/20'}`} />
            <div>
              <div className="text-white text-sm font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Agent Builder
              </div>
              <div className="text-white/50 text-xs" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
                {(isEVMConnected || isSolanaConnected) ? 'Ready to deploy' : 'Connect wallet to start'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Management Preview */}
      {(isEVMConnected || isSolanaConnected) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 p-6 rounded-lg"
        >
          <h3 
            className="text-white text-lg mb-4"
            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
          >
            WALLET MANAGEMENT
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                SPENDING LIMIT (USDC)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="100.00"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded focus:border-[#FF4D00]/50 focus:outline-none transition-colors"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                  disabled
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  USDC
                </div>
              </div>
              <p className="text-white/40 text-xs mt-2" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
                Maximum amount agents can spend per transaction
              </p>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                AUTO-APPROVE SETTINGS
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded border border-white/10">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[#FF4D00] cursor-not-allowed"
                    disabled
                  />
                  <div>
                    <div className="text-white text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                      Trusted Services
                    </div>
                    <div className="text-white/50 text-xs" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
                      Auto-approve payments for verified services
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

