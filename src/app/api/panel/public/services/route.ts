/**
 * Public API - Service Catalog
 * 
 * GET /api/panel/public/services
 * Public endpoint for partners/x402scan to fetch our service catalog
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const network = searchParams.get('network') || 'base';
    const chainId = searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 8453;

    const where: any = {
      available: true,
      network,
      chainId,
    };

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        _count: {
          select: {
            transactions: {
              where: {
                status: { in: ['verified', 'settled'] },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format for public API
    const publicServices = services.map(service => ({
      id: service.serviceId,
      name: service.name,
      description: service.description,
      category: service.category || 'Other',
      merchant: service.merchant,
      network: service.network,
      chainId: service.chainId,
      token: service.token,
      tokenSymbol: service.tokenSymbol,
      price: service.priceDisplay,
      priceWei: service.price,
      endpoint: service.endpoint,
      totalPurchases: service._count.transactions,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));

    return NextResponse.json({
      services: publicServices,
      total: publicServices.length,
      network,
      chainId,
    });
  } catch (error: any) {
    console.error('Public services API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

