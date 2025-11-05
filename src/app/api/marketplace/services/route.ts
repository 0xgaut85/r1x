/**
 * Marketplace Services API
 * 
 * Returns available x402 services from database AND PayAI facilitator
 * Fetches services from PayAI facilitator /list endpoint in real-time
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MarketplaceService } from '@/lib/types/x402';
import { syncPayAIServices, fetchPayAIServices } from '@/lib/payai-sync';
import { formatUnits } from 'viem';

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

    // Convert database services to MarketplaceService format
    const dbServices: MarketplaceService[] = services.map((service: any) => ({
      id: service.serviceId,
      name: service.name,
      description: service.description || '',
      price: service.priceDisplay,
      merchant: service.merchant,
      category: service.category || 'Other',
      endpoint: service.endpoint || undefined,
      available: service.available,
      isExternal: false, // Services from our database
    }));

    // Fetch services from PayAI facilitator in real-time
    let payaiServices: MarketplaceService[] = [];
    try {
      const facilitatorServices = await fetchPayAIServices();
      const PLATFORM_FEE_PERCENTAGE = 5; // 5% fee
      
      payaiServices = facilitatorServices.map((service) => {
        // Calculate price with fee added
        const priceWei = BigInt(service.price);
        const feeWei = (priceWei * BigInt(PLATFORM_FEE_PERCENTAGE)) / BigInt(100);
        const totalPriceWei = priceWei + feeWei;
        
        // Format price display
        const decimals = service.tokenSymbol === 'USDC' ? 6 : 18;
        const basePrice = formatUnits(priceWei, decimals);
        const totalPrice = formatUnits(totalPriceWei, decimals);
        
        return {
          id: service.id,
          name: service.name,
          description: service.description || '',
          price: basePrice, // Base price (before fee)
          priceWithFee: totalPrice, // Total price (with 5% fee)
          merchant: service.merchant,
          category: extractCategory(service.name, service.description) || 'Other',
          endpoint: service.endpoint || undefined,
          available: true,
          isExternal: true, // Services from PayAI facilitator
          token: service.token,
          tokenSymbol: service.tokenSymbol,
          network: service.network,
          chainId: service.chainId,
        };
      });
      
      console.log(`[Marketplace] Fetched ${payaiServices.length} services from PayAI facilitator`);
    } catch (error: any) {
      console.error('[Marketplace] Error fetching PayAI facilitator services:', error.message);
      // Continue with database services only if PayAI fetch fails
    }

    // Combine database services and PayAI facilitator services
    // Remove duplicates (same serviceId)
    const allServicesMap = new Map<string, MarketplaceService>();
    
    // Add database services first (these take precedence)
    dbServices.forEach(service => {
      allServicesMap.set(service.id, service);
    });
    
    // Add PayAI facilitator services (skip if already exists)
    payaiServices.forEach(service => {
      if (!allServicesMap.has(service.id)) {
        allServicesMap.set(service.id, service);
      }
    });
    
    const marketplaceServices = Array.from(allServicesMap.values());

    return NextResponse.json({
      services: marketplaceServices,
      total: marketplaceServices.length,
      fromDatabase: dbServices.length,
      fromPayAI: payaiServices.length,
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

/**
 * Extract category from service name/description
 */
function extractCategory(name?: string, description?: string): string {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  
  if (text.includes('api') || text.includes('claude') || text.includes('gpt') || text.includes('ai inference') || text.includes('llm') || text.includes('chat')) {
    return 'AI Inference';
  }
  if (text.includes('data') || text.includes('feed') || text.includes('stream')) {
    return 'Data Streams';
  }
  if (text.includes('compute') || text.includes('gpu') || text.includes('processing')) {
    return 'Compute Resources';
  }
  if (text.includes('content') || text.includes('digital') || text.includes('asset')) {
    return 'Digital Content';
  }
  if (text.includes('robot') || text.includes('agent') || text.includes('autonomous')) {
    return 'Robot Services';
  }
  if (text.includes('token') || text.includes('mint') || text.includes('nft')) {
    return 'Tokens & NFTs';
  }
  
  return 'Other';
}

