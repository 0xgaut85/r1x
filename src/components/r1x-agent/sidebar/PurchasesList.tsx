'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { formatUnits } from 'viem';

interface PurchasesListProps {
  address: string;
  limit?: number;
}

interface Purchase {
  id: string;
  transactionHash: string;
  settlementHash?: string | null;
  blockExplorerUrl?: string | null;
  service: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    endpoint: string | null;
    websiteUrl: string | null;
  };
  amount: string;
  feeAmount: string;
  merchantAmount: string;
  token: string;
  chainId: number;
  status: string;
  timestamp: Date;
  verifiedAt: Date | null;
  type: 'fee' | 'service';
}

export default function PurchasesList({ address, limit = 5 }: PurchasesListProps) {
  const { data, isLoading } = useQuery<{ purchases: Purchase[] }>({
    queryKey: ['user-purchases', address],
    queryFn: async () => {
      const res = await fetch(`/api/panel/user/purchases?address=${address}`);
      if (!res.ok) throw new Error('Failed to fetch purchases');
      return res.json();
    },
    enabled: !!address,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-[#111111] border border-[#1A1A1A] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const purchases = data?.purchases?.slice(0, limit) || [];

  if (purchases.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
        No purchases yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {purchases.map((purchase, index) => (
        <motion.div
          key={purchase.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-[#111111] border border-[#1A1A1A] rounded-lg p-3 hover:border-[#FF4D00]/30 transition-colors"
          style={{
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.02)',
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate mb-1" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                {purchase.service.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  {formatUnits(BigInt(purchase.amount), 6)}
                  <Image src="/usdc.png" alt="USDC" width={10} height={10} />
                </span>
                {purchase.blockExplorerUrl && (
                  <a
                    href={purchase.blockExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF4D00] hover:text-[#FF6B35] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </a>
                )}
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] ${
              purchase.type === 'fee' ? 'bg-orange-900/30 text-orange-400' :
              'bg-blue-900/30 text-blue-400'
            }`} style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              {purchase.type}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

