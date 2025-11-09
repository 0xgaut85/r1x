'use client';

import { motion } from 'framer-motion';
import { PaymentQuote } from '@/lib/types/x402';
import { useWallet } from '@/hooks/useWallet';
import { base } from 'wagmi/chains';
import CryptoLogo from '@/components/CryptoLogo';
import { getExplorerUrl, getExplorerLabel } from '@/lib/explorer-url';

interface AgentPaymentModalProps {
  quote: PaymentQuote;
  paymentStep: 'idle' | 'processing' | 'verifying';
  txHash: string | null;
  error: string | null;
  chainId: number;
  isConnected: boolean;
  onPay: () => void;
  onClose: () => void;
}

export default function AgentPaymentModal({
  quote,
  paymentStep,
  txHash,
  error,
  chainId,
  isConnected,
  onPay,
  onClose,
}: AgentPaymentModalProps) {
  const { formatUSDC } = useWallet();
  const explorerUrl = txHash ? getExplorerUrl(txHash, null, chainId) : null;
  const explorerLabel = getExplorerLabel(null, chainId);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 max-w-md w-full" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}>
          <h2 className="text-xl font-semibold mb-2 text-white" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
            Payment Required
          </h2>
          <p className="text-sm text-[#8E8EA0] mb-6 flex items-center gap-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
            r1x Agent Chat - 0.25 <CryptoLogo symbol="USDC" size={14} /> USDC per message
          </p>

          <div className="bg-[#212121] rounded-lg p-4 mb-6 border border-[#2a2a2a]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#8E8EA0]" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Amount:
              </span>
              <span className="text-lg font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                {formatUSDC(quote.amount)} <CryptoLogo symbol="USDC" size={20} /> USDC
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-950/30 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-sm text-red-300" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                {error}
              </p>
            </div>
          )}

          {chainId !== base.id && (
            <div className="mb-4 bg-yellow-950/30 border border-yellow-500/30 rounded-lg px-4 py-3">
              <p className="text-sm text-yellow-300" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Please switch to Base network
              </p>
            </div>
          )}

          {paymentStep === 'idle' && (
            <motion.button
              onClick={onPay}
              disabled={!isConnected || chainId !== base.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#FF4D00] to-[#FF6B35] text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
            >
              Pay {formatUSDC(quote.amount)} <CryptoLogo symbol="USDC" size={14} /> USDC
            </motion.button>
          )}

          {paymentStep === 'processing' && (
            <div className="w-full px-6 py-3 bg-[#212121] rounded-xl flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Processing transaction...
              </span>
            </div>
          )}

          {paymentStep === 'verifying' && (
            <div className="w-full px-6 py-3 bg-[#212121] rounded-xl flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Verifying payment...
              </span>
            </div>
          )}

          {txHash && explorerUrl && (
            <div className="mt-4 text-center">
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#FF4D00] hover:underline"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
              >
                {explorerLabel}
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

