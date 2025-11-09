/**
 * User Purchases API
 * 
 * Returns purchases (transactions) for a specific wallet address
 * Includes both fee and service transactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getExplorerUrl } from '@/lib/explorer-url';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('address')?.toLowerCase();

    if (!wallet) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    // Fetch transactions for this wallet
    const transactions = await prisma.transaction.findMany({
      where: {
        from: wallet.toLowerCase(),
        status: { in: ['verified', 'settled'] },
      },
      include: {
        service: {
          select: {
            serviceId: true,
            name: true,
            description: true,
            category: true,
            endpoint: true,
            metadata: true,
            network: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100, // Limit to 100 most recent
    });

    // Format for frontend
    const purchases = transactions.map(tx => {
      // Extract websiteUrl from metadata if available
      const metadata = tx.service.metadata && typeof tx.service.metadata === 'object' && !Array.isArray(tx.service.metadata)
        ? tx.service.metadata as Record<string, any>
        : null;
      
      const websiteUrl = metadata?.website ||
                        metadata?.websiteUrl ||
                        metadata?.homepage ||
                        metadata?.url ||
                        undefined;

      // Use settlementHash if available, otherwise transactionHash
      const bestHash = (tx as any).settlementHash || tx.transactionHash;
      const blockExplorerUrl = getExplorerUrl(
        bestHash,
        tx.service.network || null,
        tx.chainId
      );

      return {
        id: tx.id,
        transactionHash: tx.transactionHash,
        settlementHash: (tx as any).settlementHash || null,
        blockExplorerUrl,
        service: {
          id: tx.service.serviceId,
          name: tx.service.name,
          description: tx.service.description,
          category: tx.service.category,
          endpoint: tx.service.endpoint,
          websiteUrl: websiteUrl,
          network: tx.service.network || null,
        },
      amount: tx.amount,
      feeAmount: tx.feeAmount,
      merchantAmount: tx.merchantAmount,
      token: tx.token,
      chainId: tx.chainId,
      status: tx.status,
      timestamp: tx.timestamp,
      verifiedAt: tx.verifiedAt,
      type: tx.service.serviceId === 'platform-fee' ? 'fee' : 'service',
      };
    });

    return NextResponse.json({
      purchases,
      total: purchases.length,
      wallet,
    });
  } catch (error: any) {
    console.error('[User Purchases API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

