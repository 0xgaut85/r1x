/**
 * PayAI Facilitator Integration
 * 
 * Fetches real services and tokens from PayAI facilitator
 */

import { prisma } from '@/lib/db';
import { formatUnits } from 'viem';

const PAYAI_FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';
const BASE_CHAIN_ID = 8453;
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export interface PayAIService {
  id: string;
  name: string;
  description?: string;
  merchant: string;
  network: string;
  chainId: number;
  token: string;
  tokenSymbol?: string;
  price: string;
  endpoint?: string;
  metadata?: any;
}

/**
 * Fetch services from PayAI facilitator
 * Note: This is a placeholder implementation based on x402 spec
 * Adjust based on actual PayAI facilitator API endpoints
 */
export async function fetchPayAIServices(): Promise<PayAIService[]> {
  try {
    // Try to fetch from PayAI facilitator /list endpoint
    // Adjust endpoint based on actual PayAI API documentation
    const response = await fetch(`${PAYAI_FACILITATOR_URL}/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('PayAI /list endpoint not available, using fallback');
      return [];
    }

    const data = await response.json();
    
    // Normalize PayAI response format (adjust based on actual API response)
    if (Array.isArray(data.services)) {
      return data.services.map((service: any) => normalizePayAIService(service));
    }
    
    if (Array.isArray(data)) {
      return data.map((service: any) => normalizePayAIService(service));
    }

    return [];
  } catch (error: any) {
    console.error('Error fetching PayAI services:', error);
    return [];
  }
}

/**
 * Normalize PayAI service data to our format
 */
function normalizePayAIService(service: any): PayAIService {
  // Extract price and convert to wei if needed
  const price = service.price || service.amount || '0';
  const priceWei = service.priceWei || price;
  
  // Determine token symbol
  const tokenSymbol = service.tokenSymbol || 
    (service.token === USDC_BASE_ADDRESS ? 'USDC' : 'UNKNOWN');
  
  return {
    id: service.id || service.serviceId || `service-${Date.now()}-${Math.random()}`,
    name: service.name || service.title || 'Unnamed Service',
    description: service.description || service.desc,
    merchant: service.merchant || service.merchantAddress || '',
    network: service.network || 'base',
    chainId: service.chainId || BASE_CHAIN_ID,
    token: service.token || service.tokenAddress || USDC_BASE_ADDRESS,
    tokenSymbol,
    price: priceWei.toString(),
    endpoint: service.endpoint || service.apiEndpoint,
    metadata: service,
  };
}

/**
 * Sync PayAI services to database
 */
export async function syncPayAIServices(): Promise<{ synced: number; errors: number }> {
  const services = await fetchPayAIServices();
  let synced = 0;
  let errors = 0;

  for (const service of services) {
    try {
      // Calculate human-readable price
      const decimals = service.tokenSymbol === 'USDC' ? 6 : 18;
      const priceDisplay = formatUnits(BigInt(service.price), decimals);

      await prisma.service.upsert({
        where: { serviceId: service.id },
        update: {
          name: service.name,
          description: service.description,
          category: extractCategory(service.name, service.description),
          merchant: service.merchant,
          network: service.network,
          chainId: service.chainId,
          token: service.token,
          tokenSymbol: service.tokenSymbol,
          price: service.price,
          priceDisplay,
          endpoint: service.endpoint,
          available: true,
          metadata: service.metadata || {},
          updatedAt: new Date(),
        },
        create: {
          serviceId: service.id,
          name: service.name,
          description: service.description,
          category: extractCategory(service.name, service.description),
          merchant: service.merchant,
          network: service.network,
          chainId: service.chainId,
          token: service.token,
          tokenSymbol: service.tokenSymbol,
          price: service.price,
          priceDisplay,
          endpoint: service.endpoint,
          available: true,
          metadata: service.metadata || {},
        },
      });

      synced++;
    } catch (error: any) {
      console.error(`Error syncing service ${service.id}:`, error);
      errors++;
    }
  }

  return { synced, errors };
}

/**
 * Extract category from service name/description
 */
function extractCategory(name?: string, description?: string): string {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  
  if (text.includes('api') || text.includes('claude') || text.includes('gpt') || text.includes('ai inference')) {
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
  
  return 'Other';
}

