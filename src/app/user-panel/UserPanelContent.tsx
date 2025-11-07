'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamicImport from 'next/dynamic';
import Footer from '@/components/Footer';
import Image from 'next/image';

const Header = dynamicImport(() => import('@/components/Header'), { ssr: false });
import WalletButton from '@/components/WalletButton';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartTooltip, currencyValueFormatter, numberValueFormatter, dateLabelFormatter } from '@/components/charts/ChartTooltip';
import { useWallet } from '@/hooks/useWallet';
import { useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { modal } from '@/lib/wallet-provider';
import { X402Client } from '@/lib/payments/x402Client';
import { getX402ServerUrlAsync } from '@/lib/x402-server-url';
import { formatUnits } from 'viem';

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
    settlementHash?: string | null;
    serviceName: string;
    serviceId: string;
    amount: string;
    fee: string;
    status: string;
    timestamp: string;
    blockNumber: number | null;
    blockExplorerUrl: string | null;
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

interface Purchase {
  id: string;
  transactionHash: string;
  settlementHash?: string | null;
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

export default function UserPanelContent() {
  const { address, isConnected, walletClient } = useWallet();
  const { isConnected: wagmiConnected } = useAccount();
  const chainId = useChainId();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [reRunningService, setReRunningService] = useState<string | null>(null);

  // Initialize X402Client for re-running services
  const x402Client = useMemo(() => {
    if (!walletClient) return null;
    try {
      return new X402Client({
        walletClient,
        maxValue: BigInt(100 * 10 ** 6), // 100 USDC max
      });
    } catch (err) {
      console.error('[User Panel] Failed to initialize X402Client:', err);
      return null;
    }
  }, [walletClient]);

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
      const [statsRes, usageRes, purchasesRes] = await Promise.all([
        fetch(`/api/panel/user/stats?address=${address}`),
        fetch(`/api/panel/user/usage?address=${address}&period=${period}`),
        fetch(`/api/panel/user/purchases?address=${address}`),
      ]);

      // Parse responses and check for errors
      const statsData = await statsRes.json();
      if (!statsRes.ok) {
        console.error('Failed to fetch user stats:', statsData);
        throw new Error(statsData.error || 'Failed to fetch user stats');
      }

      const usageData = await usageRes.json();
      if (!usageRes.ok) {
        console.error('Failed to fetch user usage:', usageData);
        throw new Error(usageData.error || 'Failed to fetch user usage');
      }

      let purchasesData = { purchases: [] };
      if (purchasesRes.ok) {
        purchasesData = await purchasesRes.json();
      } else {
        const errorData = await purchasesRes.json();
        console.error('Failed to fetch purchases:', errorData);
      }

      setStats(statsData);
      setUsage(usageData);
      setPurchases(purchasesData.purchases || []);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReRunService = async (purchase: Purchase) => {
    if (!x402Client || !purchase.service.endpoint) {
      alert('Service endpoint not available');
      return;
    }

    if (chainId !== base.id) {
      alert('Please switch to Base network');
      return;
    }

    setReRunningService(purchase.id);
    try {
      const response = await x402Client.purchaseService({
        id: purchase.service.id,
        name: purchase.service.name,
        endpoint: purchase.service.endpoint,
        price: formatUnits(BigInt(purchase.amount), 6), // Convert from wei
        isExternal: false,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Service accessed! ${data.message || ''}`);
      } else {
        throw new Error(`Service returned ${response.status}`);
      }
    } catch (error: any) {
      console.error('[User Panel] Re-run error:', error);
      alert(`Failed to access service: ${error.message || 'Unknown error'}`);
    } finally {
      setReRunningService(null);
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
            {stats?.stats && (
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
                    <span className="flex items-center gap-1">
                      {parseFloat(stats.stats.totalSpent || '0').toFixed(2)} 
                      <Image src="/usdc.svg" alt="USDC" width={16} height={16} />
                      USDC
                    </span>
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
                  <div style={{ width: '100%', height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usage.dailyUsage} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={dateLabelFormatter}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                          minTickGap={30}
                          interval="preserveStartEnd"
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '11px' }}
                        />
                        <YAxis
                          tickFormatter={numberValueFormatter}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                          width={45}
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '11px' }}
                        />
                        <Tooltip content={<ChartTooltip valueFormatter={(v) => numberValueFormatter(v)} labelFormatter={dateLabelFormatter} />} />
                        <Line type="monotone" dataKey="transactions" stroke="#FF4D00" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
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
                  <div style={{ width: '100%', height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usage.usageByService.slice(0, 10)} margin={{ top: 10, right: 20, left: 10, bottom: 80 }}>
                        <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="serviceName"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '10px' }}
                        />
                        <YAxis
                          tickFormatter={numberValueFormatter}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                          width={45}
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '11px' }}
                        />
                        <Tooltip content={<ChartTooltip valueFormatter={(v) => numberValueFormatter(v)} />} />
                        <Bar dataKey="count" fill="#FF4D00" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Purchases Section */}
            {purchases.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 p-6 rounded-lg mb-8"
              >
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                  My Purchases
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }}>
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-4">Service</th>
                        <th className="text-left py-2 px-4">Type</th>
                        <th className="text-left py-2 px-4">Amount</th>
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Transaction</th>
                        <th className="text-left py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b border-gray-100">
                          <td className="py-2 px-4">
                            <div>
                              <div className="font-semibold">{purchase.service.name}</div>
                              {purchase.service.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {purchase.service.description.substring(0, 50)}...
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              purchase.type === 'fee' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {purchase.type}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <span className="flex items-center gap-1">
                              {formatUnits(BigInt(purchase.amount), 6)} <Image src="/usdc.svg" alt="USDC" width={14} height={14} /> USDC
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            {new Date(purchase.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4">
                            {purchase.settlementHash ? (
                            <a
                                href={`https://basescan.org/tx/${purchase.settlementHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#FF4D00] hover:underline text-xs"
                            >
                              View on BaseScan
                            </a>
                            ) : (
                              <span className="text-gray-400 text-xs">Pending settlement</span>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            {purchase.service.endpoint && purchase.type === 'service' ? (
                              <button
                                onClick={() => handleReRunService(purchase)}
                                disabled={reRunningService === purchase.id || !wagmiConnected}
                                className="px-3 py-1 bg-[#FF4D00] text-white rounded text-xs hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                              >
                                {reRunningService === purchase.id ? 'Processing...' : 'Use/Open'}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
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
                          <td className="py-2 px-4">
                            <span className="flex items-center gap-1">
                              {tx.amount} <Image src="/usdc.svg" alt="USDC" width={14} height={14} /> USDC
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <span className="flex items-center gap-1">
                              {tx.fee} <Image src="/usdc.svg" alt="USDC" width={14} height={14} /> USDC
                            </span>
                          </td>
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
                            {tx.blockExplorerUrl ? (
                              <a 
                                href={tx.blockExplorerUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#FF4D00] hover:underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">No hash</span>
                            )}
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

