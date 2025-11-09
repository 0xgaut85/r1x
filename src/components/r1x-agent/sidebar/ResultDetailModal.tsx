'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultDetailModalProps {
  resultId: string;
  address: string;
  onClose: () => void;
}

interface ResultDetail {
  id: string;
  createdAt: string;
  service: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    endpoint: string | null;
  };
  contentType: string;
  resultText: string | null;
  resultJson: any;
  filename: string | null;
  metadata: any;
  transactionHash: string | null;
  settlementHash: string | null;
  blockExplorerUrl?: string | null;
  explorerLabel?: string;
  transaction: {
    amount: string;
    feeAmount: string;
    timestamp: string;
  } | null;
}

export default function ResultDetailModal({ resultId, address, onClose }: ResultDetailModalProps) {
  const { data: result, isLoading } = useQuery<ResultDetail>({
    queryKey: ['result-detail', resultId, address],
    queryFn: async () => {
      const res = await fetch(`/api/panel/user/results/${resultId}?address=${address}`);
      if (!res.ok) throw new Error('Failed to fetch result detail');
      return res.json();
    },
    enabled: !!resultId && !!address,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4D00]"></div>
        </div>
      );
    }

    if (!result) {
      return (
        <div className="text-center py-12 text-gray-400">
          Result not found
        </div>
      );
    }

    if (result.resultJson) {
      return (
        <pre className="bg-[#0A0A0A] rounded-lg p-4 overflow-x-auto text-xs text-gray-300" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
          {JSON.stringify(result.resultJson, null, 2)}
        </pre>
      );
    }

    if (result.resultText) {
      return (
        <div className="bg-[#0A0A0A] rounded-lg p-4 text-xs text-gray-300 whitespace-pre-wrap" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
          {result.resultText}
        </div>
      );
    }

    if (result.filename) {
      return (
        <div className="bg-[#0A0A0A] rounded-lg p-4 text-xs text-gray-300">
          <p>File: {result.filename}</p>
          <p className="text-gray-500 mt-2">{result.contentType}</p>
        </div>
      );
    }

    return (
      <div className="text-gray-400 text-sm">
        No content available
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111111] border border-[#1A1A1A] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex items-center justify-between p-4 border-b border-[#1A1A1A]">
            <div>
              <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                {result?.service.name || 'Service Result'}
              </h3>
              {result && (
                <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  {new Date(result.createdAt).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1A1A1A] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4L12 12M12 4L4 12" stroke="#999" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 r1x-agent-scrollbar">
            {renderContent()}
          </div>

          {result?.blockExplorerUrl && (
            <div className="p-4 border-t border-[#1A1A1A]">
              <a
                href={(result.blockExplorerUrl && !result.blockExplorerUrl.includes('basescan.org/error'))
                  ? result.blockExplorerUrl
                  : (() => {
                      const hash = result.settlementHash || result.transactionHash;
                      if (!hash) return result.blockExplorerUrl || '#';
                      const clean = hash.startsWith('0x') ? hash.slice(2) : hash;
                      return `https://solscan.io/tx/${clean}`;
                    })()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#FF4D00] hover:text-[#FF6B35] transition-colors inline-flex items-center gap-1"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
              >
                {result.explorerLabel || 'View transaction'}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

