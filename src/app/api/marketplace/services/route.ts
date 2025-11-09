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
    const chainId = searchParams.get('chainId')
      ? parseInt(searchParams.get('chainId')!)
      : (network === 'base' ? 8453 : 0);
    const skipSync = searchParams.get('skipSync') === 'true';
    const type = searchParams.get('type'); // Service type filter
    const q = searchParams.get('q'); // Search query
    const source = searchParams.get('source'); // Source filter (payai, x402scan)

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

    // Only filter by type/source if columns exist (after migration)
    // These filters will work once migration is applied
    try {
      if (type) {
        where.type = { equals: type, mode: 'insensitive' };
      }

      if (source) {
        where.source = { equals: source, mode: 'insensitive' };
      }
    } catch (error) {
      // Columns might not exist yet - ignore filter errors
      console.warn('[Marketplace] Type/source filters skipped (columns may not exist yet)');
    }

    // Search query (name or description)
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Query services - handle case where migration hasn't been applied yet
    let services;
    try {
      services = await prisma.service.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: any) {
      // If migration hasn't been applied (P2022 = column doesn't exist), retry without new fields
      if (error.code === 'P2022' || error.message?.includes('does not exist')) {
        console.warn('[Marketplace] Migration not applied yet, querying without new fields');
        // Remove filters that use new columns
        const safeWhere: any = {
          available: where.available,
          network: where.network,
          chainId: where.chainId,
        };
        if (where.category) safeWhere.category = where.category;
        if (where.merchant) safeWhere.merchant = where.merchant;
        if (where.OR) safeWhere.OR = where.OR;
        
        // Query without selecting new fields - explicitly select only existing fields
        services = await prisma.service.findMany({
          where: safeWhere,
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
            // Exclude new fields: type, method, inputSchema, outputSchema, source, isExternal, websiteUrl, screenshotUrl
          },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        throw error;
      }
    }

    // If no services found and sync not skipped, trigger PayAI sync (works for both EVM and Solana)
    if (services.length === 0 && !skipSync) {
      console.log(`No services found for network='${network}', triggering PayAI sync...`);
      try {
        const syncResult = await syncPayAIServices();
        console.log(`[Marketplace] PayAI sync completed: ${syncResult.synced} services synced, ${syncResult.errors} errors`);
        
        // Query again after sync - use same fallback logic
        try {
          services = await prisma.service.findMany({
            where,
            orderBy: { createdAt: 'desc' },
          });
        } catch (syncQueryError: any) {
          // If migration still not applied, use safe query
          if (syncQueryError.code === 'P2022' || syncQueryError.message?.includes('does not exist')) {
            const safeWhere: any = {
              available: where.available,
              network: where.network,
              chainId: where.chainId,
            };
            if (where.category) safeWhere.category = where.category;
            if (where.merchant) safeWhere.merchant = where.merchant;
            if (where.OR) safeWhere.OR = where.OR;
            
            services = await prisma.service.findMany({
              where: safeWhere,
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
              orderBy: { createdAt: 'desc' },
            });
          } else {
            throw syncQueryError;
          }
        }
      } catch (syncError: any) {
        console.error('Sync error:', syncError);
        // Continue with empty services if sync fails
      }
    }

    // Convert database services to MarketplaceService format
    const dbServices: MarketplaceService[] = services.map((service: any) => {
      // Extract website URL from metadata if available
      const websiteUrl = service.metadata?.website || 
                        service.metadata?.websiteUrl ||
                        service.metadata?.homepage ||
                        service.metadata?.url ||
                        undefined;
      
      return {
        id: service.serviceId,
        name: service.name,
        description: service.description || '',
        price: service.priceDisplay,
        merchant: service.merchant,
        category: service.category || 'Other',
        endpoint: service.endpoint || undefined,
        websiteUrl: websiteUrl || (service as any).websiteUrl || undefined,
        screenshotUrl: (service as any).screenshotUrl || undefined,
        available: service.available,
        isExternal: (service as any).isExternal ?? false,
        token: service.token,
        tokenSymbol: service.tokenSymbol,
        network: service.network,
        chainId: service.chainId,
        x402Ready: (service as any).x402Ready ?? true,
        verified: (service as any).verified ?? false,
        source: (service as any).source || undefined,
      };
    });

    // Fetch services from PayAI facilitator in real-time (Base/EVM only)
    let payaiServices: MarketplaceService[] = [];
    const enablePayAI = process.env.ENABLE_PAYAI_FACILITATOR === 'true';
    if (network === 'base' && enablePayAI) {
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
            websiteUrl: service.websiteUrl || undefined,
            screenshotUrl: undefined, // PayAI services don't have cached screenshots yet
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
    } else if (network === 'base' && !enablePayAI) {
      console.info('[Marketplace] Skipping PayAI facilitator fetch (ENABLE_PAYAI_FACILITATOR is not true)');
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
    
    // Final list, filtered by requested network and chainId for safety
    const marketplaceServices = Array.from(allServicesMap.values()).filter(s => {
      const matchesNetwork = !s.network || s.network === network;
      const matchesChain = typeof s.chainId !== 'number' || s.chainId === chainId;
      return matchesNetwork && matchesChain;
    });

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

    // Query service - handle migration not applied
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

