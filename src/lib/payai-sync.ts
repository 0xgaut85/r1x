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
 * Based on x402 spec and PayAI facilitator API
 */
export async function fetchPayAIServices(): Promise<PayAIService[]> {
  try {
    const facilitatorUrl = `${PAYAI_FACILITATOR_URL}/list`;
    console.log(`Fetching services from PayAI facilitator: ${facilitatorUrl}`);
    
    // Try multiple endpoints based on x402 spec and PayAI conventions
    const endpoints = [
      '/list',
      '/services',
      '/discover',
      '/v1/services',
    ];

    let lastError: any = null;
    
    for (const endpoint of endpoints) {
      try {
        const url = `${PAYAI_FACILITATOR_URL}${endpoint}`;
        console.log(`Trying endpoint: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`PayAI ${endpoint} endpoint returned ${response.status}: ${response.statusText}`);
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          continue; // Try next endpoint
        }

        const data = await response.json();
        console.log(`PayAI ${endpoint} response received:`, JSON.stringify(data).substring(0, 500));
        
        // Handle different response formats
        let services: any[] = [];
        
        if (Array.isArray(data)) {
          services = data;
        } else if (data.services && Array.isArray(data.services)) {
          services = data.services;
        } else if (data.data && Array.isArray(data.data)) {
          services = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          services = data.items;
        } else if (data.result && Array.isArray(data.result)) {
          services = data.result;
        } else if (typeof data === 'object' && data !== null) {
          // Try to extract services from object values
          const values = Object.values(data);
          services = values.filter((v: any) => Array.isArray(v) && v.length > 0).flat();
        }

        if (services.length > 0) {
          console.log(`Found ${services.length} services from ${endpoint}`);
          return services.map((service: any) => normalizePayAIService(service));
        }
        
        console.warn(`No services found in ${endpoint} response`);
      } catch (endpointError: any) {
        if (endpointError.name === 'AbortError') {
          console.warn(`Request to ${endpoint} timed out`);
        } else {
          console.warn(`Error fetching from ${endpoint}:`, endpointError.message);
        }
        lastError = endpointError;
        continue; // Try next endpoint
      }
    }

    // If all endpoints failed, log and return empty
    console.warn('All PayAI endpoints failed. Last error:', lastError?.message);
    return [];
  } catch (error: any) {
    console.error('Error fetching PayAI services:', error.message);
    // Don't throw - return empty array so sync can continue with seed data
    return [];
  }
}

/**
 * Normalize PayAI service data to our format
 */
function normalizePayAIService(service: any): PayAIService {
  // Extract price - handle different formats
  let price = '0';
  if (service.price) {
    price = service.price.toString();
  } else if (service.amount) {
    price = service.amount.toString();
  } else if (service.priceWei) {
    price = service.priceWei.toString();
  } else if (service.cost) {
    price = service.cost.toString();
  }
  
  // Ensure price is in wei format (for USDC, 6 decimals)
  // If price is already in smallest unit, use as-is
  // If price looks like human-readable format, assume it needs conversion
  if (price.includes('.') || parseFloat(price) < 1000000) {
    // Likely human-readable format, convert to wei (6 decimals for USDC)
    const decimals = 6;
    price = (BigInt(Math.floor(parseFloat(price) * Math.pow(10, decimals)))).toString();
  }
  
  // Extract merchant address
  const merchant = service.merchant || 
                   service.merchantAddress || 
                   service.provider ||
                   service.owner ||
                   '0x0000000000000000000000000000000000000000';
  
  // Extract token address
  const token = service.token || 
                service.tokenAddress || 
                service.currency ||
                USDC_BASE_ADDRESS;
  
  // Determine token symbol
  const tokenSymbol = service.tokenSymbol || 
    (token.toLowerCase() === USDC_BASE_ADDRESS.toLowerCase() ? 'USDC' : 'UNKNOWN');
  
  // Extract service ID
  const serviceId = service.id || 
                    service.serviceId || 
                    service.service_id ||
                    service.name?.toLowerCase().replace(/\s+/g, '-') ||
                    `service-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  return {
    id: serviceId,
    name: service.name || service.title || 'Unnamed Service',
    description: service.description || service.desc || service.summary,
    merchant: merchant,
    network: service.network || 'base',
    chainId: service.chainId || service.chain_id || BASE_CHAIN_ID,
    token: token,
    tokenSymbol: tokenSymbol,
    price: price,
    endpoint: service.endpoint || service.apiEndpoint || service.url,
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

  console.log(`Syncing ${services.length} services from PayAI...`);

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
      console.error(`Error syncing service ${service.id}:`, error.message);
      errors++;
    }
  }

  // If no services were synced from PayAI, seed with example services
  if (synced === 0 && services.length === 0) {
    console.log('No PayAI services found, seeding with example services...');
    await seedExampleServices();
    synced = 5; // Return count of seeded services
  }

  return { synced, errors };
}

/**
 * Seed example services when PayAI has no services
 */
async function seedExampleServices(): Promise<void> {
  const exampleServices = [
    {
      serviceId: 'claude-sonnet-api',
      name: 'Claude Sonnet API',
      description: 'Access to Anthropic Claude Sonnet 3.5 model for AI inference',
      merchant: '0x0000000000000000000000000000000000000000',
      category: 'AI Inference',
      price: '1000000', // 1 USDC
      priceDisplay: '1.0',
      endpoint: '/api/ai/claude',
    },
    {
      serviceId: 'gpt-4-api',
      name: 'GPT-4 API Access',
      description: 'Pay-per-use access to OpenAI GPT-4 model',
      merchant: '0x0000000000000000000000000000000000000000',
      category: 'AI Inference',
      price: '1500000', // 1.5 USDC
      priceDisplay: '1.5',
      endpoint: '/api/ai/gpt4',
    },
    {
      serviceId: 'realtime-data-feed',
      name: 'Real-time Data Feed',
      description: 'Stream real-time market data and analytics',
      merchant: '0x0000000000000000000000000000000000000000',
      category: 'Data Streams',
      price: '500000', // 0.5 USDC
      priceDisplay: '0.5',
      endpoint: '/api/data/stream',
    },
    {
      serviceId: 'gpu-compute',
      name: 'GPU Compute Resources',
      description: 'Access to high-performance GPU compute for ML workloads',
      merchant: '0x0000000000000000000000000000000000000000',
      category: 'Compute Resources',
      price: '5000000', // 5 USDC
      priceDisplay: '5.0',
      endpoint: '/api/compute/gpu',
    },
    {
      serviceId: 'digital-content-api',
      name: 'Digital Content API',
      description: 'Access to premium digital content and media assets',
      merchant: '0x0000000000000000000000000000000000000000',
      category: 'Digital Content',
      price: '2000000', // 2 USDC
      priceDisplay: '2.0',
      endpoint: '/api/content/access',
    },
  ];

  for (const service of exampleServices) {
    try {
      await prisma.service.upsert({
        where: { serviceId: service.serviceId },
        update: {
          name: service.name,
          description: service.description,
          category: service.category,
          price: service.price,
          priceDisplay: service.priceDisplay,
          endpoint: service.endpoint,
          available: true,
          updatedAt: new Date(),
        },
        create: {
          serviceId: service.serviceId,
          name: service.name,
          description: service.description,
          category: service.category,
          merchant: service.merchant,
          network: 'base',
          chainId: 8453,
          token: USDC_BASE_ADDRESS,
          tokenSymbol: 'USDC',
          price: service.price,
          priceDisplay: service.priceDisplay,
          endpoint: service.endpoint,
          available: true,
        },
      });
    } catch (error: any) {
      console.error(`Error seeding service ${service.serviceId}:`, error.message);
    }
  }
}

/**
 * Extract category from service name/description
 */
function extractCategory(name?: string, description?: string): string {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  
  if (text.includes('api') || text.includes('claude') || text.includes('gpt') || text.includes('ai inference') || text.includes('llm')) {
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
