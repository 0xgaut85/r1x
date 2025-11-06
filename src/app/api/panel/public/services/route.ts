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

    // Query services - handle case where migration hasn't been applied yet
    let services;
    try {
      services = await prisma.service.findMany({
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
    } catch (error: any) {
      // If migration hasn't been applied (P2022 = column doesn't exist), retry without new fields
      if (error.code === 'P2022' || error.message?.includes('does not exist')) {
        console.warn('[Public Services] Migration not applied yet, querying without new fields');
        services = await prisma.service.findMany({
          where,
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
            transactions: {
              where: {
                status: { in: ['verified', 'settled'] },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        
        // Manually add _count
        services = services.map((service: any) => ({
          ...service,
          _count: {
            transactions: service.transactions?.length || 0,
          },
        }));
      } else {
        throw error;
      }
    }

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

