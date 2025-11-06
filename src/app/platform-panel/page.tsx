'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamicImport from 'next/dynamic';
import Footer from '@/components/Footer';
import CryptoLogo from '@/components/CryptoLogo';

const Header = dynamicImport(() => import('@/components/Header'), { ssr: false });
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartTooltip, currencyValueFormatter, numberValueFormatter, dateLabelFormatter } from '@/components/charts/ChartTooltip';

interface AnalyticsData {
  period: string;
  summary: {
    totalTransactions: number;
    totalVolume: string;
    totalFees: string;
    uniqueUsers: number;
    activeServices: number;
  };
  dailyStats: Array<{
    date: string;
    transactions: number;
    volume: string;
    fees: string;
    uniqueUsers: number;
  }>;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    category: string;
    transactions: number;
    volume: string;
    fees: string;
    uniqueUsers: number;
  }>;
  statusBreakdown: Record<string, number>;
  userGrowth: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
  }>;
}

interface FeesData {
  period: string;
  summary: {
    totalFees: string;
    transferredFees: string;
    pendingFees: string;
    totalRecords: number;
    transferredCount: number;
    pendingCount: number;
  };
  dailyFees: Array<{
    date: string;
    total: string;
    transferred: string;
    pending: string;
    count: number;
  }>;
  feesByRecipient: Array<{
    recipient: string;
    total: string;
    transferred: string;
    pending: string;
    count: number;
  }>;
  recentFees: Array<{
    id: string;
    transactionHash: string;
    serviceName: string;
    serviceId: string;
    feeAmount: string;
    feeRecipient: string;
    transferred: boolean;
    createdAt: string;
    blockExplorerUrl: string | null;
  }>;
}

interface ServicesData {
  period: string;
  summary: {
    totalServices: number;
    activeServices: number;
    totalTransactions: number;
    totalVolume: string;
    totalFees: string;
  };
  services: Array<{
    serviceId: string;
    name: string;
    description: string | null;
    category: string;
    merchant: string;
    price: string;
    available: boolean;
    totalTransactions: number;
    totalVolume: string;
    totalFees: string;
    uniqueUsers: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

const COLORS = ['#FF4D00', '#FF6B35', '#FF8C5A', '#FFA87F', '#FFC4A5'];

export const dynamic = 'force-dynamic';

export default function PlatformPanelPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [fees, setFees] = useState<FeesData | null>(null);
  const [services, setServices] = useState<ServicesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'fees' | 'services'>('overview');

  useEffect(() => {
    fetchPlatformData();
  }, [period, activeTab]);

  const fetchPlatformData = async () => {
    setLoading(true);
    try {
      const promises = [
        fetch(`/api/panel/platform/analytics?period=${period}`),
      ];

      if (activeTab === 'fees') {
        promises.push(fetch(`/api/panel/platform/fees?period=${period}`));
      }
      if (activeTab === 'services') {
        promises.push(fetch(`/api/panel/platform/services?period=${period}`));
      }

      const [analyticsRes, ...rest] = await Promise.all(promises);
      
      // Parse analytics response and check for errors
      const analyticsData = await analyticsRes.json();
      if (!analyticsRes.ok) {
        console.error('Failed to fetch analytics:', analyticsData);
        throw new Error(analyticsData.error || 'Failed to fetch analytics');
      }
      
      setAnalytics(analyticsData);

      if (activeTab === 'fees' && rest[0]) {
        const feesData = await rest[0].json();
        if (!rest[0].ok) {
          console.error('Failed to fetch fees:', feesData);
        } else {
          setFees(feesData);
        }
      }
      if (activeTab === 'services' && rest[0]) {
        const servicesData = await rest[0].json();
        if (!rest[0].ok) {
          console.error('Failed to fetch services:', servicesData);
        } else {
          setServices(servicesData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch platform data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = JSON.stringify({ analytics, fees, services }, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `platform-data-${period}.json`;
      link.click();
    } else {
      // CSV export would be implemented here
      alert('CSV export coming soon');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
        <Header />
        <main className="pt-24 md:pt-[138.641px]">
          <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4D00]"></div>
              </div>
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
                  Platform Panel
                </h1>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  Analytics and insights for r1x platform
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }}
                >
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="90d">90 days</option>
                  <option value="all">All time</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportData('json')}
                  className="px-4 py-2 bg-[#FF4D00] text-white rounded-lg"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }}
                >
                  Export JSON
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-gray-200">
              {(['overview', 'fees', 'services'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-[#FF4D00] text-[#FF4D00]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && analytics?.summary && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                  {[
                    { label: 'Total Volume', value: `${parseFloat(analytics.summary.totalVolume || '0').toFixed(2)}`, showLogo: true },
                    { label: 'Total Fees', value: `${parseFloat(analytics.summary.totalFees || '0').toFixed(2)}`, showLogo: true },
                    { label: 'Transactions', value: (analytics.summary.totalTransactions || 0).toString(), showLogo: false },
                    { label: 'Unique Users', value: (analytics.summary.uniqueUsers || 0).toString(), showLogo: false },
                    { label: 'Active Services', value: (analytics.summary.activeServices || 0).toString(), showLogo: false },
                  ].map((card, idx) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white border border-gray-200 p-6 rounded-lg"
                    >
                      <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                        {card.label}
                      </p>
                      <p className="text-2xl font-bold" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                        <span className="flex items-center gap-1">
                          {card.value}
                          {card.showLogo && (
                            <>
                              <CryptoLogo symbol="USDC" size={16} />
                              USDC
                            </>
                          )}
                        </span>
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Daily Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 p-6 rounded-lg"
                  >
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    Daily Volume & Fees
                  </h3>
                  <div style={{ width: '100%', height: '340px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.dailyStats} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
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
                          width={50}
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '11px' }}
                        />
                        <Tooltip content={<ChartTooltip valueFormatter={(v) => currencyValueFormatter(v, 'USDC')} labelFormatter={dateLabelFormatter} />} />
                        <Legend verticalAlign="bottom" height={30} wrapperStyle={{ paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="volume" stroke="#FF4D00" strokeWidth={2} name="Volume (USDC)" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="fees" stroke="#FF6B35" strokeWidth={2} name="Fees (USDC)" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  </motion.div>

                  {/* Top Services */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-gray-200 p-6 rounded-lg"
                  >
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    Top Services by Transactions
                  </h3>
                  <div style={{ width: '100%', height: '340px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topServices} margin={{ top: 10, right: 20, left: 10, bottom: 90 }}>
                        <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="serviceName"
                          angle={-45}
                          textAnchor="end"
                          height={90}
                          interval={0}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '10px' }}
                        />
                        <YAxis
                          tickFormatter={numberValueFormatter}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                          width={50}
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '11px' }}
                        />
                        <Tooltip content={<ChartTooltip valueFormatter={(v) => numberValueFormatter(v)} />} />
                        <Bar dataKey="transactions" fill="#FF4D00" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  </motion.div>

                  {/* User Growth */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-gray-200 p-6 rounded-lg"
                  >
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    User Growth
                  </h3>
                  <div style={{ width: '100%', height: '340px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.userGrowth} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
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
                          width={50}
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '11px' }}
                        />
                        <Tooltip content={<ChartTooltip valueFormatter={(v) => numberValueFormatter(v)} labelFormatter={dateLabelFormatter} />} />
                        <Legend verticalAlign="bottom" height={30} wrapperStyle={{ paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="newUsers" stroke="#FF4D00" strokeWidth={2} name="New Users" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="totalUsers" stroke="#FF6B35" strokeWidth={2} name="Total Users" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  </motion.div>

                  {/* Status Breakdown */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-gray-200 p-6 rounded-lg"
                  >
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    Transaction Status
                  </h3>
                  <div style={{ width: '100%', height: '340px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(analytics.statusBreakdown).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="45%"
                          labelLine={true}
                          label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          style={{ fontSize: '11px', fontFamily: 'TWKEverettMono-Regular, monospace' }}
                        >
                          {Object.entries(analytics.statusBreakdown).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={40} wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  </motion.div>
                </div>
              </>
            )}

            {/* Fees Tab */}
            {activeTab === 'fees' && fees && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Fees', value: `${parseFloat(fees.summary.totalFees).toFixed(2)} USDC` },
                    { label: 'Transferred', value: `${parseFloat(fees.summary.transferredFees).toFixed(2)} USDC` },
                    { label: 'Pending', value: `${parseFloat(fees.summary.pendingFees).toFixed(2)} USDC` },
                    { label: 'Total Records', value: fees.summary.totalRecords.toString() },
                  ].map((card, idx) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white border border-gray-200 p-6 rounded-lg"
                    >
                      <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                        {card.label}
                      </p>
                      <p className="text-2xl font-bold" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                        {card.value}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 p-6 rounded-lg"
                  >
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    Daily Fees Collected
                  </h3>
                  <div style={{ width: '100%', height: '340px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={fees.dailyFees} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
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
                          width={50}
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '11px' }}
                        />
                        <Tooltip content={<ChartTooltip valueFormatter={(v) => currencyValueFormatter(v, 'USDC')} labelFormatter={dateLabelFormatter} />} />
                        <Legend verticalAlign="bottom" height={30} wrapperStyle={{ paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="total" stroke="#FF4D00" strokeWidth={2} name="Total" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="transferred" stroke="#22c55e" strokeWidth={2} name="Transferred" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-gray-200 p-6 rounded-lg"
                  >
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    Fees by Recipient
                  </h3>
                  <div style={{ width: '100%', height: '340px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fees.feesByRecipient} margin={{ top: 10, right: 20, left: 10, bottom: 90 }}>
                        <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="recipient"
                          angle={-45}
                          textAnchor="end"
                          height={90}
                          interval={0}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '10px' }}
                        />
                        <YAxis
                          tickFormatter={numberValueFormatter}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E7EB' }}
                          width={50}
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '11px' }}
                        />
                        <Tooltip content={<ChartTooltip valueFormatter={(v) => currencyValueFormatter(v, 'USDC')} />} />
                        <Bar dataKey="total" fill="#FF4D00" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  </motion.div>
                </div>
              </>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && services && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                  {[
                    { label: 'Total Services', value: services.summary.totalServices.toString() },
                    { label: 'Active Services', value: services.summary.activeServices.toString() },
                    { label: 'Total Transactions', value: services.summary.totalTransactions.toString() },
                    { label: 'Total Volume', value: `${parseFloat(services.summary.totalVolume).toFixed(2)} USDC` },
                    { label: 'Total Fees', value: `${parseFloat(services.summary.totalFees).toFixed(2)} USDC` },
                  ].map((card, idx) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white border border-gray-200 p-6 rounded-lg"
                    >
                      <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                        {card.label}
                      </p>
                      <p className="text-2xl font-bold" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                        {card.value}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 p-6 rounded-lg"
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                    Service Performance
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }}>
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4">Service</th>
                          <th className="text-left py-2 px-4">Category</th>
                          <th className="text-left py-2 px-4">Price</th>
                          <th className="text-left py-2 px-4">Transactions</th>
                          <th className="text-left py-2 px-4">Volume</th>
                          <th className="text-left py-2 px-4">Fees</th>
                          <th className="text-left py-2 px-4">Users</th>
                          <th className="text-left py-2 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.services.map((service) => (
                          <tr key={service.serviceId} className="border-b border-gray-100">
                            <td className="py-2 px-4">{service.name}</td>
                            <td className="py-2 px-4">{service.category}</td>
                            <td className="py-2 px-4">{service.price} USDC</td>
                            <td className="py-2 px-4">{service.totalTransactions}</td>
                            <td className="py-2 px-4">{service.totalVolume} USDC</td>
                            <td className="py-2 px-4">{service.totalFees} USDC</td>
                            <td className="py-2 px-4">{service.uniqueUsers}</td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 rounded ${
                                service.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {service.available ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

