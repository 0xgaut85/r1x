/**
 * Public API - Transaction Summary
 * 
 * GET /api/panel/public/transactions
 * Public endpoint for partners/x402scan to fetch transaction summaries
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatUnits } from 'viem';

const USDC_DECIMALS = 6;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const serviceId = searchParams.get('serviceId');
    const status = searchParams.get('status'); // verified, settled

    const where: any = {
      status: { in: ['verified', 'settled'] },
    };

    if (serviceId) {
      let service;
      try {
        service = await prisma.service.findUnique({
          where: { serviceId },
        });
      } catch (error: any) {
        // If migration not applied, query with select
        if (error.code === 'P2022' || error.message?.includes('does not exist')) {
          service = await prisma.service.findUnique({
            where: { serviceId },
            select: {
              id: true,
              serviceId: true,
              name: true,
              description: true,
              category: true,
              merchant: true,
              network: true,
              chainId: true,
              token: true,
              tokenSymbol: true,
              price: true,
              priceDisplay: true,
              endpoint: true,
              available: true,
              metadata: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        } else {
          throw error;
        }
      }
      
      if (service) {
        where.serviceId = service.id;
      } else {
        return NextResponse.json({
          transactions: [],
          pagination: { total: 0, limit, offset, hasMore: false },
        });
      }
    }

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
              category: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    const publicTransactions = transactions.map(tx => {
      // For x402 transactions, prefer settlement hash if available (final settlement transaction)
      // Otherwise use transaction hash (original payment transaction)
      const explorerHash = tx.settlementHash || tx.transactionHash;
      const explorerUrl = explorerHash 
        ? `https://basescan.org/tx/${explorerHash}`
        : null;
      
      return {
        transactionHash: tx.transactionHash,
        settlementHash: tx.settlementHash,
        blockNumber: tx.blockNumber,
        service: {
          id: tx.service.serviceId,
          name: tx.service.name,
          category: tx.service.category,
        },
        amount: formatUnits(BigInt(tx.amount), USDC_DECIMALS),
        fee: formatUnits(BigInt(tx.feeAmount), USDC_DECIMALS),
        status: tx.status,
        timestamp: tx.timestamp,
        blockExplorerUrl: explorerUrl,
      };
    });

    return NextResponse.json({
      transactions: publicTransactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('Public transactions API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

