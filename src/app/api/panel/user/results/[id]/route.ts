/**
 * User Panel - Service Result Detail API
 * 
 * GET /api/panel/user/results/[id]
 * Returns full details of a specific service result
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getExplorerUrl, getExplorerLabel } from '@/lib/explorer-url';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const { id: resultId } = await params;

    if (!resultId) {
      return NextResponse.json(
        { error: 'Missing result ID' },
        { status: 400 }
      );
    }

    // Fetch the service result
    const result = await (prisma as any).serviceResult.findUnique({
      where: { id: resultId },
      include: {
        service: {
          select: {
            serviceId: true,
            name: true,
            description: true,
            category: true,
            endpoint: true,
            network: true,
          },
        },
        transaction: {
          select: {
            transactionHash: true,
            settlementHash: true,
            amount: true,
            feeAmount: true,
            timestamp: true,
            chainId: true,
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Service result not found' },
        { status: 404 }
      );
    }

    // Verify ownership if address is provided
    if (address && result.payer.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const bestHash = result.transaction?.settlementHash || result.transactionHash || result.transaction?.transactionHash;
    const blockExplorerUrl = getExplorerUrl(
      bestHash,
      result.service.network || null,
      result.transaction?.chainId || null
    );
    const explorerLabel = getExplorerLabel(
      result.service.network || null,
      result.transaction?.chainId || null
    );

    return NextResponse.json({
      id: result.id,
      createdAt: result.createdAt,
      service: {
        id: result.service.serviceId,
        name: result.service.name,
        description: result.service.description,
        category: result.service.category,
        endpoint: result.service.endpoint,
      },
      contentType: result.contentType,
      resultText: result.resultText,
      resultJson: result.resultJson,
      filename: result.filename,
      metadata: result.metadata,
      transactionHash: result.transactionHash || result.transaction?.transactionHash || null,
      settlementHash: result.transaction?.settlementHash || null,
      blockExplorerUrl,
      explorerLabel,
      transaction: result.transaction ? {
        amount: result.transaction.amount,
        feeAmount: result.transaction.feeAmount,
        timestamp: result.transaction.timestamp,
      } : null,
    });
  } catch (error: any) {
    console.error('[User Result Detail API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service result' },
      { status: 500 }
    );
  }
}

