/**
 * Marketplace Services API
 * 
 * Returns available x402 services from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MarketplaceService } from '@/lib/types/x402';
import { syncPayAIServices } from '@/lib/payai-sync';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const merchant = searchParams.get('merchant');
    const network = searchParams.get('network') || 'base';
    const chainId = searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 8453;
    const skipSync = searchParams.get('skipSync') === 'true';

    // Build query
    const where: any = {
      available: true,
      network,
      chainId,
    };

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (merchant) {
      where.merchant = { equals: merchant, mode: 'insensitive' };
    }

    let services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // If no services found and sync not skipped, trigger sync
    if (services.length === 0 && !skipSync) {
      console.log('No services found in database, triggering PayAI sync...');
      try {
        const syncResult = await syncPayAIServices();
        console.log(`Sync completed: ${syncResult.synced} services synced, ${syncResult.errors} errors`);
        
        // Query again after sync
        services = await prisma.service.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });
      } catch (syncError: any) {
        console.error('Sync error:', syncError);
        // Continue with empty services if sync fails
      }
    }

    // Convert to MarketplaceService format
    const marketplaceServices: MarketplaceService[] = services.map((service: any) => ({
      id: service.serviceId,
      name: service.name,
      description: service.description || '',
      price: service.priceDisplay,
      merchant: service.merchant,
      category: service.category || 'Other',
      endpoint: service.endpoint || undefined,
      available: service.available,
    }));

    return NextResponse.json({
      services: marketplaceServices,
      total: marketplaceServices.length,
    });
  } catch (error: any) {
    console.error('Marketplace API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred fetching services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'serviceId is required' },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const marketplaceService: MarketplaceService = {
      id: service.serviceId,
      name: service.name,
      description: service.description || '',
      price: service.priceDisplay,
      merchant: service.merchant,
      category: service.category || 'Other',
      endpoint: service.endpoint || undefined,
      available: service.available,
    };

    return NextResponse.json({ service: marketplaceService });
  } catch (error: any) {
    console.error('Marketplace API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

