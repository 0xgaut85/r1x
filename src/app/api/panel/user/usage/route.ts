/**
 * User Panel - Usage Statistics API
 * 
 * GET /api/panel/user/usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatUnits } from 'viem';

const USDC_DECIMALS = 6;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, all

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

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

    const transactions = await prisma.transaction.findMany({
      where: {
        from: userAddress.toLowerCase(),
        status: { in: ['verified', 'settled'] },
        timestamp: { gte: startDate },
      },
      include: {
        service: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    // Group by date for chart data
    const dailyUsage = transactions.reduce((acc, tx) => {
      const date = tx.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          amount: BigInt(0),
          fees: BigInt(0),
        };
      }
      acc[date].count++;
      acc[date].amount += BigInt(tx.amount);
      acc[date].fees += BigInt(tx.feeAmount);
      return acc;
    }, {} as Record<string, { date: string; count: number; amount: bigint; fees: bigint }>);

    const dailyData = Object.values(dailyUsage).map(day => ({
      date: day.date,
      transactions: day.count,
      amount: formatUnits(day.amount, USDC_DECIMALS),
      fees: formatUnits(day.fees, USDC_DECIMALS),
    }));

    // Group by service
    const usageByService = transactions.reduce((acc, tx) => {
      const serviceId = tx.service.serviceId;
      if (!acc[serviceId]) {
        acc[serviceId] = {
          serviceId,
          serviceName: tx.service.name,
          category: tx.service.category || 'Other',
          count: 0,
          amount: BigInt(0),
        };
      }
      acc[serviceId].count++;
      acc[serviceId].amount += BigInt(tx.amount);
      return acc;
    }, {} as Record<string, { serviceId: string; serviceName: string; category: string; count: number; amount: bigint }>);

    const serviceData = Object.values(usageByService)
      .map(service => ({
        ...service,
        amount: formatUnits(service.amount, USDC_DECIMALS),
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate totals
    const totalAmount = transactions.reduce((sum, tx) => sum + BigInt(tx.amount), BigInt(0));
    const totalFees = transactions.reduce((sum, tx) => sum + BigInt(tx.feeAmount), BigInt(0));

    return NextResponse.json({
      period,
      summary: {
        totalTransactions: transactions.length,
        totalAmount: formatUnits(totalAmount, USDC_DECIMALS),
        totalFees: formatUnits(totalFees, USDC_DECIMALS),
        uniqueServices: Object.keys(usageByService).length,
      },
      dailyUsage: dailyData,
      usageByService: serviceData,
    });
  } catch (error: any) {
    console.error('User usage API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

