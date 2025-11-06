/**
 * Platform Panel - Analytics API
 * 
 * GET /api/panel/platform/analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatUnits } from 'viem';

const USDC_DECIMALS = 6;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, all

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get all transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        timestamp: { gte: startDate },
      },
      include: {
        service: true,
        fees: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    // Calculate total fees collected
    const totalFees = transactions.reduce((sum, tx) => {
      return sum + BigInt(tx.feeAmount);
    }, BigInt(0));

    // Calculate total volume
    const totalVolume = transactions.reduce((sum, tx) => {
      return sum + BigInt(tx.amount);
    }, BigInt(0));

    // Get unique users
    const uniqueUsers = new Set(
      transactions
        .filter(tx => tx.from && tx.from !== '')
        .map(tx => tx.from.toLowerCase())
    );

    // Daily revenue and fees
    const dailyStats = transactions.reduce((acc, tx) => {
      const date = tx.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          transactions: 0,
          volume: BigInt(0),
          fees: BigInt(0),
          users: new Set<string>(),
        };
      }
      acc[date].transactions++;
      acc[date].volume += BigInt(tx.amount);
      acc[date].fees += BigInt(tx.feeAmount);
      if (tx.from) {
        acc[date].users.add(tx.from.toLowerCase());
      }
      return acc;
    }, {} as Record<string, { date: string; transactions: number; volume: bigint; fees: bigint; users: Set<string> }>);

    const dailyData = Object.values(dailyStats).map(day => ({
      date: day.date,
      transactions: day.transactions,
      volume: formatUnits(day.volume, USDC_DECIMALS),
      fees: formatUnits(day.fees, USDC_DECIMALS),
      uniqueUsers: day.users.size,
    }));

    // Service performance
    const serviceStats = transactions
      .filter(tx => tx.service) // Filter out transactions with missing services
      .reduce((acc, tx) => {
        const serviceId = tx.service!.serviceId;
        if (!acc[serviceId]) {
          acc[serviceId] = {
            serviceId,
            serviceName: tx.service!.name,
            category: tx.service!.category || 'Other',
            transactions: 0,
            volume: BigInt(0),
            fees: BigInt(0),
            users: new Set<string>(),
          };
        }
        acc[serviceId].transactions++;
        acc[serviceId].volume += BigInt(tx.amount);
        acc[serviceId].fees += BigInt(tx.feeAmount);
        if (tx.from) {
          acc[serviceId].users.add(tx.from.toLowerCase());
        }
        return acc;
      }, {} as Record<string, { serviceId: string; serviceName: string; category: string; transactions: number; volume: bigint; fees: bigint; users: Set<string> }>);

    const topServices = Object.values(serviceStats)
      .map(service => ({
        ...service,
        volume: formatUnits(service.volume, USDC_DECIMALS),
        fees: formatUnits(service.fees, USDC_DECIMALS),
        uniqueUsers: service.users.size,
      }))
      .sort((a, b) => b.transactions - a.transactions)
      .slice(0, 10);

    // Transaction status breakdown
    const statusBreakdown = transactions.reduce((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // User growth (cumulative unique users over time)
    const userGrowth = transactions
      .filter(tx => tx.from && tx.from !== '')
      .reduce((acc, tx) => {
        const date = tx.timestamp.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = new Set<string>();
        }
        acc[date].add(tx.from.toLowerCase());
        return acc;
      }, {} as Record<string, Set<string>>);

    // Calculate cumulative user growth
    const sortedDates = Object.entries(userGrowth).sort(([a], [b]) => a.localeCompare(b));
    const cumulativeUsers = new Set<string>();
    const userGrowthData = sortedDates.map(([date, users]) => {
      const newUsers = Array.from(users).filter(u => !cumulativeUsers.has(u));
      newUsers.forEach(u => cumulativeUsers.add(u));
      return {
        date,
        newUsers: newUsers.length,
        totalUsers: cumulativeUsers.size,
      };
    });

    return NextResponse.json({
      period,
      summary: {
        totalTransactions: transactions.length,
        totalVolume: formatUnits(totalVolume, USDC_DECIMALS),
        totalFees: formatUnits(totalFees, USDC_DECIMALS),
        uniqueUsers: uniqueUsers.size,
        activeServices: Object.keys(serviceStats).length,
      },
      dailyStats: dailyData,
      topServices,
      statusBreakdown,
      userGrowth: userGrowthData.slice(-30), // Last 30 days
    });
  } catch (error: any) {
    console.error('Platform analytics API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

