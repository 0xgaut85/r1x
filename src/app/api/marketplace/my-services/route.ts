/**
 * My Services API
 * 
 * Returns services submitted by a specific owner address
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerAddress = searchParams.get('address')?.toLowerCase();

    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'Missing required parameter: address' },
        { status: 400 }
      );
    }

    // Query services by owner
    const services = await prisma.service.findMany({
      where: ({
        ownerAddress: ownerAddress.toLowerCase(),
      } as any), // Cast until migration adds ownerAddress to Prisma types
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format for frontend
    const formatted = services.map(service => ({
      id: service.serviceId,
      name: service.name,
      description: service.description,
      category: service.category,
      endpoint: service.endpoint,
      price: service.priceDisplay,
      merchant: service.merchant,
      approvalStatus: (service as any).approvalStatus,
      verified: (service as any).verified,
      x402Ready: (service as any).x402Ready,
      lastPreflightAt: (service as any).lastPreflightAt,
      lastPreflightStatus: (service as any).lastPreflightStatus,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));

    return NextResponse.json({
      services: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    console.error('[My Services API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

