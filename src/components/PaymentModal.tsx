/**
 * Payment Component for x402 Payments
 * 
 * Handles the complete payment flow: quote -> wallet approval -> payment -> verification
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { connectWallet, transferUSDC, formatUSDC, WalletConnection } from '@/lib/wallet';
import { PaymentQuote, PaymentProof } from '@/lib/types/x402';

interface PaymentModalProps {
  quote: PaymentQuote;
  serviceName: string;
  onSuccess: (proof: PaymentProof) => void;
  onCancel: () => void;
}

export default function PaymentModal({ quote, serviceName, onSuccess, onCancel }: PaymentModalProps) {
  const [step, setStep] = useState<'connect' | 'approve' | 'pay' | 'verifying'>('connect');
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      setError(null);
      const connection = await connectWallet();
      if (connection) {
        setWallet(connection);
        setStep('approve');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleApprove = async () => {
    if (!wallet) return;

    try {
      setError(null);
      setStep('pay');
      // For now, we'll skip approval and go straight to payment
      // In production, you'd check allowance first and approve if needed
    } catch (err: any) {
      setError(err.message || 'Failed to approve');
    }
  };

  const handlePay = async () => {
    if (!wallet) return;

    try {
      setError(null);
      setStep('verifying');
      
      // Convert amount from wei to human-readable format
      const amount = formatUSDC(quote.amount);
      
      // Transfer USDC to merchant
      const hash = await transferUSDC(wallet, quote.merchant, amount);
      setTxHash(hash);

      // Wait for transaction confirmation
      // In production, you'd poll for confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create payment proof
      const proof: PaymentProof = {
        transactionHash: hash,
        blockNumber: 0, // Would be fetched from transaction receipt
        from: wallet.address,
        to: quote.merchant,
        amount: quote.amount,
        token: quote.token,
        timestamp: Date.now(),
      };

      // Verify and settle payment
      await handlePaymentSuccess(proof);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setStep('pay');
    }
  };

  const handlePaymentSuccess = async (proof: PaymentProof) => {
    try {
      // Verify payment with our backend using X-PAYMENT header
      const verifyResponse = await fetch('/api/x402/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': JSON.stringify(proof),
        },
        body: JSON.stringify({
          settle: true,
        }),
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        onSuccess(proof);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Payment verification failed. Please try again.');
      setStep('pay');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 max-w-md w-full"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
      >
        <h2 
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#ECECF1' }}
        >
          Payment Required
        </h2>
        <p 
          className="text-sm text-[#8E8EA0] mb-6"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          {serviceName}
        </p>

        <div className="bg-[#212121] rounded-lg p-4 mb-6 border border-[#2a2a2a]">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8E8EA0]" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Amount:
            </span>
            <span className="text-lg font-semibold text-white" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
              {formatUSDC(quote.amount)} USDC
            </span>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500/50 rounded-lg px-4 py-3 mb-4"
          >
            <p className="text-sm text-red-400" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              {error}
            </p>
          </motion.div>
        )}

        {step === 'connect' && (
          <motion.button
            onClick={handleConnectWallet}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#FF4D00] to-[#FF6B35] text-white rounded-xl font-semibold"
            style={{
              fontFamily: 'TWKEverettMono-Regular, monospace',
              fontSize: '14px',
              boxShadow: '0 4px 16px rgba(255, 77, 0, 0.4)',
            }}
          >
            Connect Wallet
          </motion.button>
        )}

        {step === 'approve' && (
          <motion.button
            onClick={handleApprove}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#FF4D00] to-[#FF6B35] text-white rounded-xl font-semibold"
            style={{
              fontFamily: 'TWKEverettMono-Regular, monospace',
              fontSize: '14px',
              boxShadow: '0 4px 16px rgba(255, 77, 0, 0.4)',
            }}
          >
            Continue to Payment
          </motion.button>
        )}

        {step === 'pay' && (
          <motion.button
            onClick={handlePay}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#FF4D00] to-[#FF6B35] text-white rounded-xl font-semibold"
            style={{
              fontFamily: 'TWKEverettMono-Regular, monospace',
              fontSize: '14px',
              boxShadow: '0 4px 16px rgba(255, 77, 0, 0.4)',
            }}
          >
            Approve Payment
          </motion.button>
        )}

        {step === 'verifying' && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4D00] mb-4"></div>
            <p className="text-sm text-[#ECECF1]" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Verifying payment...
            </p>
            {txHash && (
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#FF4D00] mt-2 inline-block hover:underline"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
              >
                View on BaseScan
              </a>
            )}
          </div>
        )}

        <button
          onClick={onCancel}
          className="w-full mt-4 text-sm text-[#8E8EA0] hover:text-[#ECECF1] transition-colors"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

