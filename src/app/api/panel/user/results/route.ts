/**
 * User Panel - Service Results API
 * 
 * GET /api/panel/user/results
 * Returns service results/outputs for a user's purchases
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!address) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    // Fetch service results for this wallet
    const [results, total] = await Promise.all([
      (prisma as any).serviceResult.findMany({
        where: {
          payer: address.toLowerCase(),
        },
        include: {
          service: {
            select: {
              serviceId: true,
              name: true,
              description: true,
              category: true,
            },
          },
          transaction: {
            select: {
              transactionHash: true,
              settlementHash: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      (prisma as any).serviceResult.count({
        where: {
          payer: address.toLowerCase(),
        },
      }),
    ]);

    // Format for frontend
    const formattedResults = (results as any[]).map((result: any) => {
      // Generate preview text
      let preview: string | null = null;
      if (result.resultText) {
        preview = result.resultText.length > 150
          ? result.resultText.substring(0, 150) + '...'
          : result.resultText;
      } else if (result.resultJson) {
        try {
          const jsonStr = JSON.stringify(result.resultJson);
          preview = jsonStr.length > 150
            ? jsonStr.substring(0, 150) + '...'
            : jsonStr;
        } catch {
          preview = '[JSON data]';
        }
      } else if (result.filename) {
        preview = `File: ${result.filename}`;
      } else {
        preview = `[${result.contentType}]`;
      }

      return {
        id: result.id,
        createdAt: result.createdAt,
        serviceId: result.service.serviceId,
        serviceName: result.service.name,
        contentType: result.contentType,
        preview,
        transactionHash: result.transactionHash || result.transaction?.transactionHash || null,
        settlementHash: result.transaction?.settlementHash || null,
      };
    });

    return NextResponse.json({
      results: formattedResults,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error: any) {
    console.error('[User Results API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service results' },
      { status: 500 }
    );
  }
}

