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

    // Get user's transactions (include pending, verified, and settled)
    const transactions = await prisma.transaction.findMany({
      where: {
        from: userAddress.toLowerCase(),
        status: { in: ['pending', 'verified', 'settled'] },
      },
      include: {
        service: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    // Calculate total spent (only from verified and settled transactions)
    const verifiedTransactions = transactions.filter(tx => ['verified', 'settled'].includes(tx.status));
    const totalSpent = verifiedTransactions.reduce((sum, tx) => {
      return sum + BigInt(tx.amount);
    }, BigInt(0));

    // Get unique services used (from verified and settled transactions)
    const uniqueServices = new Set(verifiedTransactions.map(tx => tx.serviceId));
    
    // Get recent transactions (last 10)
    const recentTransactions = transactions.slice(0, 10).map(tx => {
      // For x402 transactions, prefer settlement hash if available (final settlement transaction)
      // Otherwise use transaction hash (original payment transaction)
      const explorerHash = tx.settlementHash || tx.transactionHash;
      const explorerUrl = explorerHash 
        ? `https://basescan.org/tx/${explorerHash}`
        : null;
      
      return {
        id: tx.id,
        transactionHash: tx.transactionHash,
        settlementHash: tx.settlementHash,
        serviceName: tx.service.name,
        serviceId: tx.service.serviceId,
        amount: formatUnits(BigInt(tx.amount), USDC_DECIMALS),
        fee: formatUnits(BigInt(tx.feeAmount), USDC_DECIMALS),
        status: tx.status,
        timestamp: tx.timestamp,
        blockNumber: tx.blockNumber,
        blockExplorerUrl: explorerUrl,
      };
    });

    // Get transactions by category (from verified and settled transactions)
    const transactionsByCategory = verifiedTransactions.reduce((acc, tx) => {
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

