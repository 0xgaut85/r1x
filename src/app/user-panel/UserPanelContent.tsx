'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamicImport from 'next/dynamic';
import Footer from '@/components/Footer';

const Header = dynamicImport(() => import('@/components/Header'), { ssr: false });
import WalletButton from '@/components/WalletButton';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useWallet } from '@/hooks/useWallet';
import { useAccount } from 'wagmi';
import { modal } from '@/lib/wallet-provider';

interface UserStats {
  address: string;
  stats: {
    totalTransactions: number;
    totalSpent: string;
    uniqueServicesUsed: number;
    transactionsByCategory: Record<string, number>;
  };
  recentTransactions: Array<{
    id: string;
    transactionHash: string;
    serviceName: string;
    serviceId: string;
    amount: string;
    fee: string;
    status: string;
    timestamp: string;
    blockNumber: number | null;
    blockExplorerUrl: string;
  }>;
}

interface UsageData {
  period: string;
  summary: {
    totalTransactions: number;
    totalAmount: string;
    totalFees: string;
    uniqueServices: number;
  };
  dailyUsage: Array<{
    date: string;
    transactions: number;
    amount: string;
    fees: string;
  }>;
  usageByService: Array<{
    serviceId: string;
    serviceName: string;
    category: string;
    count: number;
    amount: string;
  }>;
}

const COLORS = ['#FF4D00', '#FF6B35', '#FF8C5A', '#FFA87F', '#FFC4A5'];

export default function UserPanelContent() {
  const { address, isConnected } = useWallet();
  const { isConnected: wagmiConnected } = useAccount();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    if (isConnected && address) {
      fetchUserData(address);
    } else {
      setLoading(false);
    }
  }, [isConnected, address, period, lastRefresh]);

  // Refresh data when wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      setLastRefresh(Date.now());
    }
  }, [isConnected, address]);

  const fetchUserData = async (address: string) => {
    setLoading(true);
    try {
      const [statsRes, usageRes] = await Promise.all([
        fetch(`/api/panel/user/stats?address=${address}`),
        fetch(`/api/panel/user/usage?address=${address}&period=${period}`),
      ]);

      const statsData = await statsRes.json();
      const usageData = await usageRes.json();

      setStats(statsData);
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || !address || loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
        <Header />
        <main className="pt-24 md:pt-[138.641px]">
          <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {!isConnected ? (
                <div className="max-w-md mx-auto">
                  <h1 
                    className="text-4xl font-bold mb-6"
                    style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}
                  >
                    User Panel
                  </h1>
                  <p className="text-lg mb-8" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', color: '#666666' }}>
                    Connect your wallet to view your transaction history and usage statistics.
                  </p>
                  <WalletButton variant="panel" className="w-full" />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4D00]"></div>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px]">
        <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 
                  className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                  style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}
                >
                  User Panel
                </h1>
                <motion.button
                  onClick={() => modal.open()}
                  whileHover={{ opacity: 0.7 }}
                  className="text-sm text-gray-600 mb-4 cursor-pointer hover:underline"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                  title="Click to change wallet or disconnect"
                >
                  {address.slice(0, 6)}...{address.slice(-4)}
                </motion.button>
              </div>
              <WalletButton variant="panel" />
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 p-6 rounded-lg"
                >
                  <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                    Total Spent
                  </p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    {parseFloat(stats.stats.totalSpent).toFixed(2)} USDC
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white border border-gray-200 p-6 rounded-lg"
                >
                  <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                    Transactions
                  </p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    {stats.stats.totalTransactions}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border border-gray-200 p-6 rounded-lg"
                >
                  <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                    Services Used
                  </p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    {stats.stats.uniqueServicesUsed}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white border border-gray-200 p-6 rounded-lg"
                >
                  <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                    Period
                  </p>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="text-2xl font-bold border-none outline-none"
                    style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}
                  >
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                    <option value="all">All time</option>
                  </select>
                </motion.div>
              </div>
            )}

            {/* Charts */}
            {usage && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Daily Usage Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 p-6 rounded-lg"
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    Daily Usage
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usage.dailyUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }} />
                      <YAxis style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="transactions" stroke="#FF4D00" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Usage by Service */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white border border-gray-200 p-6 rounded-lg"
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    Usage by Service
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={usage.usageByService.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="serviceName" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }} angle={-45} textAnchor="end" height={100} />
                      <YAxis style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FF4D00" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            )}

            {/* Recent Transactions */}
            {stats && stats.recentTransactions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 p-6 rounded-lg"
              >
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                  Recent Transactions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }}>
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-4">Service</th>
                        <th className="text-left py-2 px-4">Amount</th>
                        <th className="text-left py-2 px-4">Fee</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-100">
                          <td className="py-2 px-4">{tx.serviceName}</td>
                          <td className="py-2 px-4">{tx.amount} USDC</td>
                          <td className="py-2 px-4">{tx.fee} USDC</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded ${
                              tx.status === 'settled' ? 'bg-green-100 text-green-800' :
                              tx.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                              tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-2 px-4">{new Date(tx.timestamp).toLocaleDateString()}</td>
                          <td className="py-2 px-4">
                            <a 
                              href={tx.blockExplorerUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#FF4D00] hover:underline"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

