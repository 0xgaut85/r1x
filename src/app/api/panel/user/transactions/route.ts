/**
 * User Panel - Purchase History API
 * 
 * GET /api/panel/user/transactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatUnits } from 'viem';

const USDC_DECIMALS = 6;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // pending, verified, settled, failed

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    const where: any = {
      from: userAddress.toLowerCase(),
    };

    if (status) {
      where.status = status;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          service: {
            select: {
              serviceId: true,
              name: true,
              description: true,
              category: true,
              priceDisplay: true,
            },
          },
          fees: {
            select: {
              feeAmount: true,
              transferred: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    const formattedTransactions = transactions.map(tx => {
      // For x402 transactions, ONLY use settlementHash (actual on-chain tx)
      const explorerUrl = tx.settlementHash 
        ? `https://basescan.org/tx/${tx.settlementHash}`
        : null;
      
      return {
        id: tx.id,
        transactionHash: tx.transactionHash,
        service: {
          id: tx.service.serviceId,
          name: tx.service.name,
          description: tx.service.description,
          category: tx.service.category,
          price: tx.service.priceDisplay,
        },
        amount: formatUnits(BigInt(tx.amount), USDC_DECIMALS),
        fee: formatUnits(BigInt(tx.feeAmount), USDC_DECIMALS),
        merchantAmount: formatUnits(BigInt(tx.merchantAmount), USDC_DECIMALS),
        status: tx.status,
        verificationStatus: tx.verificationStatus,
        blockNumber: tx.blockNumber,
        timestamp: tx.timestamp,
        verifiedAt: tx.verifiedAt,
        settledAt: tx.settledAt,
        blockExplorerUrl: explorerUrl,
        settlementHash: tx.settlementHash,
      };
    });

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('User transactions API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

