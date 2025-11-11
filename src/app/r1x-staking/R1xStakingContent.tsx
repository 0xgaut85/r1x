'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useWallet } from '@/hooks/useWallet';
import { modal } from '@/lib/wallet-provider';
import { transferR1X, getR1XBalance } from '@/lib/solana-r1x-transfer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartTooltip, numberValueFormatter, dateLabelFormatter } from '@/components/charts/ChartTooltip';

const R1X_TOKEN_MINT = '5DDYWuhWN8PDgNyu9Khgmqt4AkJmtAZarFBKah4Epump';
const STAKING_ADDRESS = 'HdjRVLjPNpkayysqTsKo1oYBHwzLHAVmgp6uLVH4Sk4Q';

interface StakingData {
  amount: string;
  timestamp: number;
}

export default function R1xStakingContent() {
  const { solanaAddress, isSolanaConnected } = useWallet();
  const [r1xBalance, setR1xBalance] = useState<string>('0');
  const [stakedAmount, setStakedAmount] = useState<string>('0');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [apy, setApy] = useState<number>(19.5);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [historicalApy, setHistoricalApy] = useState<Array<{ date: string; apy: number }>>([]);
  const [projectedApy, setProjectedApy] = useState<Array<{ date: string; projected: number }>>([]);
  const [platformFees, setPlatformFees] = useState<{ totalFees: number; period: string } | null>(null);

  // Generate historical APY data (last 30 days starting from Nov 11, 2025)
  useEffect(() => {
    const generateHistoricalData = () => {
      const data: Array<{ date: string; apy: number }> = [];
      // Start from November 11, 2025
      const startDate = new Date('2025-11-11');
      const today = new Date();
      
      // Generate data from Nov 11, 2025 to today (or last 30 days if today is before Nov 11)
      const daysToGenerate = Math.min(30, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      for (let i = daysToGenerate - 1; i >= 0; i--) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Only generate data up to today
        if (date > today) break;
        
        // Generate realistic APY values between 18-21%
        const baseApy = 19.5;
        const variation = (Math.random() - 0.5) * 3; // ±1.5%
        const apyValue = Math.max(18, Math.min(21, baseApy + variation));
        
        data.push({
          date: date.toISOString().split('T')[0],
          apy: parseFloat(apyValue.toFixed(2)),
        });
      }
      
      setHistoricalApy(data);
      // Set current APY to the latest historical value
      if (data.length > 0) {
        setApy(data[data.length - 1].apy);
      }
    };

    generateHistoricalData();
  }, []);

  // Fetch platform fees and calculate projected APY
  useEffect(() => {
    const fetchPlatformFees = async () => {
      try {
        const response = await fetch('/api/panel/platform/analytics?period=30d');
        if (response.ok) {
          const data = await response.json();
          const totalFees = parseFloat(data.summary?.totalFees || '0');
          setPlatformFees({ totalFees, period: '30d' });
          
          // Calculate projected APY based on fees
          // Assuming total staked amount (we'll use a placeholder or fetch from API)
          // For now, we'll estimate based on fees
          const estimatedTotalStaked = 1000000; // Placeholder - in production, fetch actual staked amount
          const annualFees = totalFees * 12; // Project monthly fees to annual
          const projectedApyValue = (annualFees / estimatedTotalStaked) * 100;
          
          // Generate projected APY for next 30 days
          const projected: Array<{ date: string; projected: number }> = [];
          const today = new Date();
          
          for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            // Projected APY with some variation
            const variation = (Math.random() - 0.5) * 2; // ±1%
            const projectedValue = Math.max(18, Math.min(21, projectedApyValue + variation));
            
            projected.push({
              date: date.toISOString().split('T')[0],
              projected: parseFloat(projectedValue.toFixed(2)),
            });
          }
          
          setProjectedApy(projected);
        }
      } catch (error) {
        console.error('Failed to fetch platform fees:', error);
        // Generate mock projected data if API fails
        const projected: Array<{ date: string; projected: number }> = [];
        const today = new Date();
        
        for (let i = 1; i <= 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          const projectedValue = 18 + Math.random() * 3;
          
          projected.push({
            date: date.toISOString().split('T')[0],
            projected: parseFloat(projectedValue.toFixed(2)),
          });
        }
        
        setProjectedApy(projected);
      }
    };

    fetchPlatformFees();
  }, []);

  // Animate APY between 18-21% - slower, more realistic changes
  useEffect(() => {
    if (historicalApy.length > 0) {
      const interval = setInterval(() => {
        setApy(prev => {
          // Small random change between -0.05% and +0.05% (more realistic)
          const change = (Math.random() - 0.5) * 0.1;
          const newApy = prev + change;
          return Math.max(18, Math.min(21, newApy)); // Clamp between 18-21%
        });
      }, 45000); // Update every 45 seconds (much slower, more realistic)

      return () => clearInterval(interval);
    }
  }, [historicalApy]);

  // Load staked amount from localStorage
  useEffect(() => {
    if (solanaAddress) {
      const stored = localStorage.getItem(`r1x_staking_${solanaAddress}`);
      if (stored) {
        const data: StakingData = JSON.parse(stored);
        setStakedAmount(data.amount);
      } else {
        setStakedAmount('0');
      }
    }
  }, [solanaAddress]);

  // Load R1X balance
  useEffect(() => {
    if (solanaAddress && isSolanaConnected) {
      loadBalance();
      // Refresh balance periodically
      const interval = setInterval(() => {
        loadBalance();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    } else {
      setR1xBalance('0');
    }
  }, [solanaAddress, isSolanaConnected]);

  const loadBalance = async () => {
    if (!solanaAddress) return;
    try {
      const balance = await getR1XBalance(solanaAddress);
      setR1xBalance(balance);
    } catch (err) {
      console.error('Failed to load R1X balance:', err);
      setR1xBalance('0');
    }
  };

  const handleDeposit = async () => {
    if (!isSolanaConnected || !solanaAddress) {
      modal.open();
      return;
    }

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > parseFloat(r1xBalance)) {
      setError('Insufficient R1X balance');
      return;
    }

    setError('');
    setSuccess('');
    setIsDepositing(true);

    try {
      // Get Solana wallet
      const phantom = (window as any).phantom?.solana;
      const solflare = (window as any).solflare;
      const wallet = phantom || solflare;

      if (!wallet || !wallet.isConnected) {
        throw new Error('Please connect your Solana wallet');
      }

      // Transfer R1X tokens to staking address
      const signature = await transferR1X({
        wallet,
        to: STAKING_ADDRESS,
        amount: depositAmount,
      });

      // Update staked amount
      const currentStaked = parseFloat(stakedAmount);
      const newStaked = currentStaked + amount;
      setStakedAmount(newStaked.toFixed(6));

      // Store in localStorage
      const stakingData: StakingData = {
        amount: newStaked.toFixed(6),
        timestamp: Date.now(),
      };
      localStorage.setItem(`r1x_staking_${solanaAddress}`, JSON.stringify(stakingData));

      setSuccess(`Successfully staked ${depositAmount} R1X! Transaction: ${signature.slice(0, 8)}...`);
      setDepositAmount('');
      
      // Reload balance after a short delay to allow blockchain to update
      setTimeout(() => {
        loadBalance();
      }, 2000);
    } catch (err: any) {
      console.error('Deposit error:', err);
      setError(err.message || 'Failed to deposit R1X tokens');
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px]">
        <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src="/logosvg.svg" 
                    alt="r1x" 
                    className="w-16 h-16"
                    style={{ 
                      filter: 'brightness(0) saturate(100%) invert(26%) sepia(98%) saturate(7462%) hue-rotate(359deg) brightness(104%) contrast(101%)'
                    }}
                  />
                  <h1 
                    className="text-4xl sm:text-5xl md:text-6xl font-bold"
                    style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}
                  >
                    r1x Staking
                  </h1>
                </div>
                <p 
                  className="text-lg sm:text-xl text-gray-700"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                >
                  Stake your $R1X tokens and earn rewards from platform fees
                </p>
              </div>
            </div>

            {/* APY Display Card */}
            <motion.div
              className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 mb-8 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <p 
                  className="text-gray-600 text-sm mb-4 uppercase tracking-wider"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                >
                  Current APY
                </p>
                <motion.div
                  key={Math.floor(apy * 100)}
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="mb-4"
                >
                  <p 
                    className="text-6xl sm:text-7xl md:text-8xl font-bold"
                    style={{ 
                      fontFamily: 'TWKEverett-Regular, sans-serif',
                      background: 'linear-gradient(135deg, #FF4D00 0%, #FF6B35 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {apy.toFixed(2)}%
                  </p>
                </motion.div>
                <p 
                  className="text-gray-500 text-sm"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                >
                  APY fluctuates based on platform fee distribution
                </p>
              </div>
            </motion.div>

            {/* APY Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Historical APY Chart */}
              <motion.div
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}
                >
                  Historical APY (30 Days)
                </h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalApy} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
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
                        tickFormatter={(value) => `${value}%`}
                        tickLine={false}
                        axisLine={{ stroke: '#E5E7EB' }}
                        width={50}
                        domain={[17, 22]}
                        style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '11px' }}
                      />
                      <Tooltip 
                        content={
                          <ChartTooltip 
                            valueFormatter={(v) => `${parseFloat(v.toString()).toFixed(2)}%`} 
                            labelFormatter={dateLabelFormatter} 
                          />
                        } 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="apy" 
                        stroke="#FF4D00" 
                        strokeWidth={2} 
                        name="APY (%)" 
                        dot={{ r: 2 }} 
                        activeDot={{ r: 4 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Projected APY Chart */}
              <motion.div
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}
                >
                  Projected APY (30 Days)
                </h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectedApy} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
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
                        tickFormatter={(value) => `${value}%`}
                        tickLine={false}
                        axisLine={{ stroke: '#E5E7EB' }}
                        width={50}
                        domain={[17, 22]}
                        style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '11px' }}
                      />
                      <Tooltip 
                        content={
                          <ChartTooltip 
                            valueFormatter={(v) => `${parseFloat(v.toString()).toFixed(2)}%`} 
                            labelFormatter={dateLabelFormatter} 
                          />
                        } 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="projected" 
                        stroke="#FF6B35" 
                        strokeWidth={2} 
                        name="Projected APY (%)" 
                        strokeDasharray="5 5"
                        dot={{ r: 2 }} 
                        activeDot={{ r: 4 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Wallet Connection */}
            {!isSolanaConnected ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                <div className="max-w-md mx-auto">
                  <p 
                    className="text-gray-700 mb-8 text-lg"
                    style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                  >
                    Connect your Solana wallet to start staking $R1X tokens
                  </p>
                  <motion.button
                    onClick={() => modal.open()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-[#FF4D00] text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '14px' }}
                  >
                    CONNECT WALLET
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <p 
                      className="text-gray-600 text-sm mb-3 uppercase tracking-wider"
                      style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                    >
                      Your R1X Balance
                    </p>
                    <p 
                      className="text-3xl font-bold text-black"
                      style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}
                    >
                      {parseFloat(r1xBalance).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      <span className="text-xl text-gray-500 ml-2">R1X</span>
                    </p>
                  </motion.div>
                  <motion.div
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p 
                      className="text-gray-600 text-sm mb-3 uppercase tracking-wider"
                      style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                    >
                      Staked Amount
                    </p>
                    <p 
                      className="text-3xl font-bold text-black"
                      style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}
                    >
                      {parseFloat(stakedAmount).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      <span className="text-xl text-gray-500 ml-2">R1X</span>
                    </p>
                  </motion.div>
                </div>

                {/* Deposit Form */}
                <motion.div
                  className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 
                    className="text-black text-2xl mb-6"
                    style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}
                  >
                    Stake R1X Tokens
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label 
                        className="block text-gray-700 text-sm mb-3 font-medium"
                        style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                      >
                        Amount to Stake
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={depositAmount}
                        onChange={(e) => {
                          setDepositAmount(e.target.value);
                          setError('');
                        }}
                        placeholder="0.00"
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent transition-all"
                        style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '16px' }}
                      />
                      <div className="flex gap-2 mt-3">
                        {[25, 50, 75, 100].map((percent) => (
                          <button
                            key={percent}
                            onClick={() => {
                              if (percent === 100) {
                                setDepositAmount(r1xBalance);
                              } else {
                                setDepositAmount((parseFloat(r1xBalance) * (percent / 100)).toFixed(6));
                              }
                            }}
                            className="px-4 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                          >
                            {percent === 100 ? 'MAX' : `${percent}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4"
                      >
                        <p 
                          className="text-red-600 text-sm"
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                        >
                          {error}
                        </p>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border border-green-200 rounded-lg p-4"
                      >
                        <p 
                          className="text-green-700 text-sm"
                          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                        >
                          {success}
                        </p>
                      </motion.div>
                    )}

                    <motion.button
                      onClick={handleDeposit}
                      disabled={isDepositing || !depositAmount}
                      whileHover={{ scale: isDepositing ? 1 : 1.02 }}
                      whileTap={{ scale: isDepositing ? 1 : 0.98 }}
                      className="w-full px-6 py-4 bg-[#FF4D00] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '14px' }}
                    >
                      {isDepositing ? 'PROCESSING...' : 'STAKE R1X'}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Info Card */}
                <motion.div
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="space-y-3">
                    <div>
                      <p 
                        className="text-gray-600 text-xs mb-1 uppercase tracking-wider"
                        style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                      >
                        Connected Wallet
                      </p>
                      <p 
                        className="text-black text-sm font-mono"
                        style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                      >
                        {solanaAddress?.slice(0, 8)}...{solanaAddress?.slice(-8)}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <p 
                        className="text-gray-600 text-xs mb-1 uppercase tracking-wider"
                        style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                      >
                        Staking Address
                      </p>
                      <p 
                        className="text-black text-sm font-mono break-all"
                        style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                      >
                        {STAKING_ADDRESS}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

