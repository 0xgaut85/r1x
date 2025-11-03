/**
 * User Panel API Routes
 * 
 * Endpoints for user-facing panel data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatUnits } from 'viem';

const USDC_DECIMALS = 6;

/**
 * GET /api/panel/user/stats
 * Get user statistics (balance, transaction count, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    // Get user's transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        from: userAddress.toLowerCase(),
        status: { in: ['verified', 'settled'] },
      },
      include: {
        service: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    // Calculate total spent
    const totalSpent = transactions.reduce((sum, tx) => {
      return sum + BigInt(tx.amount);
    }, BigInt(0));

    // Get unique services used
    const uniqueServices = new Set(transactions.map(tx => tx.serviceId));
    
    // Get recent transactions (last 10)
    const recentTransactions = transactions.slice(0, 10).map(tx => ({
      id: tx.id,
      transactionHash: tx.transactionHash,
      serviceName: tx.service.name,
      serviceId: tx.service.serviceId,
      amount: formatUnits(BigInt(tx.amount), USDC_DECIMALS),
      fee: formatUnits(BigInt(tx.feeAmount), USDC_DECIMALS),
      status: tx.status,
      timestamp: tx.timestamp,
      blockNumber: tx.blockNumber,
      blockExplorerUrl: `https://basescan.org/tx/${tx.transactionHash}`,
    }));

    // Get transactions by category
    const transactionsByCategory = transactions.reduce((acc, tx) => {
      const category = tx.service.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      address: userAddress,
      stats: {
        totalTransactions: transactions.length,
        totalSpent: formatUnits(totalSpent, USDC_DECIMALS),
        uniqueServicesUsed: uniqueServices.size,
        transactionsByCategory,
      },
      recentTransactions,
    });
  } catch (error: any) {
    console.error('User panel API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

