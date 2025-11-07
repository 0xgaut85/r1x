'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface OverviewCardsProps {
  address: string;
}

interface UserStats {
  address: string;
  stats: {
    totalTransactions: number;
    totalSpent: string;
    uniqueServicesUsed: number;
    transactionsByCategory: Record<string, number>;
  };
}

export default function OverviewCards({ address }: OverviewCardsProps) {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ['user-stats', address],
    queryFn: async () => {
      const res = await fetch(`/api/panel/user/stats?address=${address}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    enabled: !!address,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[#111111] border border-[#1A1A1A] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats?.stats) {
    return null;
  }

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111111] border border-[#1A1A1A] rounded-lg p-4"
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03)',
        }}
      >
        <p className="text-xs text-gray-400 mb-1.5" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
          Total Spent
        </p>
        <p className="text-lg font-semibold text-white flex items-center gap-1.5" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
          {parseFloat(stats.stats.totalSpent || '0').toFixed(2)}
          <Image src="/usdc.png" alt="USDC" width={14} height={14} />
          <span className="text-sm text-gray-400">USDC</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#111111] border border-[#1A1A1A] rounded-lg p-4"
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03)',
        }}
      >
        <p className="text-xs text-gray-400 mb-1.5" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
          Transactions
        </p>
        <p className="text-lg font-semibold text-white" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
          {stats.stats.totalTransactions}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#111111] border border-[#1A1A1A] rounded-lg p-4"
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03)',
        }}
      >
        <p className="text-xs text-gray-400 mb-1.5" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
          Services Used
        </p>
        <p className="text-lg font-semibold text-white" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
          {stats.stats.uniqueServicesUsed}
        </p>
      </motion.div>
    </div>
  );
}

