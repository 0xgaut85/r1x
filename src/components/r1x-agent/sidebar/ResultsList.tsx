'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ResultDetailModal from './ResultDetailModal';

interface ResultsListProps {
  address: string;
  limit?: number;
}

interface ServiceResult {
  id: string;
  createdAt: string;
  serviceId: string;
  serviceName: string;
  contentType: string;
  preview: string | null;
  transactionHash: string | null;
  settlementHash: string | null;
  blockExplorerUrl?: string | null;
}

export default function ResultsList({ address, limit = 5 }: ResultsListProps) {
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ results: ServiceResult[] }>({
    queryKey: ['user-results', address],
    queryFn: async () => {
      const res = await fetch(`/api/panel/user/results?address=${address}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    },
    enabled: !!address,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[#111111] border border-[#1A1A1A] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const results = data?.results || [];

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
        No results yet
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {results.map((result, index) => (
          <motion.button
            key={result.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedResultId(result.id)}
            className="w-full text-left bg-[#111111] border border-[#1A1A1A] rounded-lg p-3 hover:border-[#FF4D00]/30 transition-colors"
            style={{
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.02)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate mb-1" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                  {result.serviceName}
                </p>
                <p className="text-[10px] text-gray-400 line-clamp-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  {result.preview || `[${result.contentType}]`}
                </p>
                {result.blockExplorerUrl && (
                  <a
                    href={result.blockExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#FF4D00] hover:text-[#FF6B35] transition-colors mt-1 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View tx
                  </a>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedResultId && (
          <ResultDetailModal
            resultId={selectedResultId}
            address={address}
            onClose={() => setSelectedResultId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

