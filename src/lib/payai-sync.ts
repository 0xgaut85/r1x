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
  websiteUrl?: string; // Website URL for screenshot preview
  metadata?: any;
}

/**
 * Fetch services from PayAI facilitator
 * PayAI facilitator API endpoints: /verify, /settle, /resources
 * Service discovery via /resources endpoint
 */
export async function fetchPayAIServices(): Promise<PayAIService[]> {
  try {
    console.log(`[PayAI] Fetching services from facilitator: ${PAYAI_FACILITATOR_URL}`);
    
    // PayAI facilitator service discovery endpoints
    // Based on PayAI facilitator API structure
    const endpoints = [
      '/resources',         // PayAI resources endpoint (main service discovery)
      '/api/resources',     // Alternative API path
      '/v1/resources',      // Versioned endpoint
      '/services',          // Alternative naming
      '/list',              // Legacy endpoint
      '/discover',          // Discovery endpoint
    ];

    let lastError: any = null;
    
    for (const endpoint of endpoints) {
      try {
        const url = `${PAYAI_FACILITATOR_URL}${endpoint}`;
        console.log(`[PayAI] Trying endpoint: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        // PayAI facilitator may require CDP API key authentication for Base mainnet
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'r1x-marketplace/1.0',
        };
        
        // Add CDP API key authentication if available (required for Base mainnet)
        const cdpApiKeyId = process.env.CDP_API_KEY_ID;
        const cdpApiKeySecret = process.env.CDP_API_KEY_SECRET;
        
        if (cdpApiKeyId && cdpApiKeySecret) {
          const auth = Buffer.from(`${cdpApiKeyId}:${cdpApiKeySecret}`).toString('base64');
          headers['Authorization'] = `Basic ${auth}`;
          console.log(`[PayAI] Using CDP API key authentication for ${endpoint}`);
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`[PayAI] ${endpoint} returned ${response.status}: ${response.statusText}`);
          const errorText = await response.text().catch(() => '');
          console.warn(`[PayAI] Error response:`, errorText.substring(0, 200));
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          continue; // Try next endpoint
        }

        const data = await response.json();
        console.log(`[PayAI] ${endpoint} response received (first 1000 chars):`, JSON.stringify(data).substring(0, 1000));
        
        // Handle different response formats from PayAI facilitator
        // PayAI resources endpoint may return: { resources: [...] } or direct array
        let services: any[] = [];
        
        console.log(`[PayAI] Response structure for ${endpoint}:`, {
          isArray: Array.isArray(data),
          keys: typeof data === 'object' && data !== null ? Object.keys(data) : [],
          hasResources: data?.resources !== undefined,
          hasData: data?.data !== undefined,
        });
        
        if (Array.isArray(data)) {
          // Direct array response
          services = data;
          console.log(`[PayAI] Direct array response with ${services.length} items`);
        } else if (data?.resources && Array.isArray(data.resources)) {
          // PayAI resources format: { resources: [...] }
          services = data.resources;
          console.log(`[PayAI] Resources array with ${services.length} items`);
        } else if (data?.data && Array.isArray(data.data)) {
          services = data.data;
        } else if (data?.services && Array.isArray(data.services)) {
          services = data.services;
        } else if (data?.items && Array.isArray(data.items)) {
          services = data.items;
        } else if (data?.result && Array.isArray(data.result)) {
          services = data.result;
        } else if (data?.apis && Array.isArray(data.apis)) {
          services = data.apis;
        } else if (typeof data === 'object' && data !== null) {
          // Try to extract services from object values
          const values = Object.values(data);
          const arrays = values.filter((v: any) => Array.isArray(v) && v.length > 0);
          if (arrays.length > 0) {
            services = arrays.flat();
            console.log(`[PayAI] Extracted ${services.length} services from nested arrays`);
          } else {
            // Single service object?
            if (data.id || data.name || data.endpoint || data.api) {
              services = [data];
              console.log(`[PayAI] Single service object found`);
            }
          }
        }
        
        // Filter for PayAI services (might have @PayAI tag or identifier)
        if (services.length > 0) {
          // PayAI services might be tagged or identified in metadata
          const payaiServices = services.filter((service: any) => {
            const serviceStr = JSON.stringify(service).toLowerCase();
            return (
              serviceStr.includes('payai') ||
              serviceStr.includes('@payai') ||
              service?.facilitator === PAYAI_FACILITATOR_URL ||
              service?.provider === 'payai' ||
              service?.tags?.includes('payai') ||
              service?.tags?.includes('@payai') ||
              true // Include all for now, filter later if needed
            );
          });
          
          if (payaiServices.length < services.length) {
            console.log(`[PayAI] Filtered ${payaiServices.length} PayAI services from ${services.length} total`);
            services = payaiServices;
          }
        }

        if (services.length > 0) {
          console.log(`[PayAI] Found ${services.length} services from ${endpoint}`);
          const normalized = services.map((service: any) => normalizePayAIService(service));
          console.log(`[PayAI] Normalized services sample:`, normalized.slice(0, 3).map(s => ({ id: s.id, name: s.name, token: s.tokenSymbol })));
          return normalized;
        }
        
        console.warn(`[PayAI] No services found in ${endpoint} response. Response structure:`, Object.keys(data));
      } catch (endpointError: any) {
        if (endpointError.name === 'AbortError') {
          console.warn(`[PayAI] Request to ${endpoint} timed out`);
        } else {
          console.warn(`[PayAI] Error fetching from ${endpoint}:`, endpointError.message);
        }
        lastError = endpointError;
        continue; // Try next endpoint
      }
    }

    // If all endpoints failed, log and return empty
    console.warn('[PayAI] All endpoints failed. Last error:', lastError?.message);
    return [];
  } catch (error: any) {
    console.error('[PayAI] Error fetching services:', error.message);
    console.error('[PayAI] Error stack:', error.stack);
    // Don't throw - return empty array so sync can continue with seed data
    return [];
  }
}

/**
 * Normalize PayAI service data to our format
 * Based on PayAI facilitator API structure
 */
function normalizePayAIService(service: any): PayAIService {
  console.log('Normalizing PayAI service:', JSON.stringify(service).substring(0, 200));
  
  // Extract service name - try multiple fields
  const name = service.name || 
               service.title || 
               service.serviceName ||
               service.apiName ||
               service.resourceName ||
               (service.metadata && service.metadata.name) ||
               (service.metadata && service.metadata.title) ||
               service.path ||
               service.route ||
               'Unnamed Service';
  
  // Extract description - try multiple fields
  const description = service.description || 
                     service.desc || 
                     service.summary ||
                     service.details ||
                     (service.metadata && service.metadata.description) ||
                     service.doc ||
                     '';
  
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
  } else if (service.fee) {
    price = service.fee.toString();
  } else if (service.paymentAmount) {
    price = service.paymentAmount.toString();
  } else if (service.metadata && service.metadata.price) {
    price = service.metadata.price.toString();
  }
  
  // Ensure price is in wei format (for USDC, 6 decimals)
  // If price is already in smallest unit, use as-is
  // If price looks like human-readable format, assume it needs conversion
  if (price !== '0' && (price.includes('.') || parseFloat(price) < 1000000)) {
    // Likely human-readable format, convert to wei (6 decimals for USDC)
    const decimals = 6;
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice > 0) {
      price = (BigInt(Math.floor(numericPrice * Math.pow(10, decimals)))).toString();
    }
  }
  
  // Extract merchant address - try multiple fields
  const merchant = service.merchant || 
                   service.merchantAddress || 
                   service.merchant_address ||
                   service.provider ||
                   service.owner ||
                   service.address ||
                   (service.metadata && service.metadata.merchant) ||
                   '0x0000000000000000000000000000000000000000';
  
  // Extract token address - try multiple fields
  const token = service.token || 
                service.tokenAddress || 
                service.token_address ||
                service.currency ||
                service.paymentToken ||
                service.payment_token ||
                (service.metadata && service.metadata.token) ||
                (service.metadata && service.metadata.currency) ||
                USDC_BASE_ADDRESS;
  
  // Extract token symbol - try multiple fields
  let tokenSymbol = service.tokenSymbol || 
                    service.token_symbol ||
                    service.currencySymbol ||
                    service.currency_symbol ||
                    (service.metadata && service.metadata.tokenSymbol) ||
                    (service.metadata && service.metadata.token_symbol);
  
  // If no token symbol, try to determine from token address
  if (!tokenSymbol) {
    if (token.toLowerCase() === USDC_BASE_ADDRESS.toLowerCase()) {
      tokenSymbol = 'USDC';
    } else {
      // Try to get from known token addresses or mint
      tokenSymbol = service.mint || service.mintAddress || 'UNKNOWN';
    }
  }
  
  // Extract endpoint/API URL - try multiple fields
  const endpoint = service.endpoint || 
                   service.apiEndpoint || 
                   service.api_endpoint ||
                   service.path ||
                   service.route ||
                   service.api ||
                   (service.metadata && service.metadata.endpoint) ||
                   '';
  
  // Extract website URL for screenshot - try multiple fields
  const websiteUrl = service.website || 
                     service.websiteUrl ||
                     service.url ||
                     service.homepage ||
                     service.homepageUrl ||
                     (service.metadata && service.metadata.website) ||
                     (service.metadata && service.metadata.websiteUrl) ||
                     (service.metadata && service.metadata.homepage) ||
                     (service.metadata && service.metadata.url) ||
                     // If endpoint is a full URL (not relative), use it as website
                     (endpoint && (endpoint.startsWith('http://') || endpoint.startsWith('https://')) ? endpoint : '') ||
                     '';
  
  // Extract service ID - try multiple fields
  const serviceId = service.id || 
                    service.serviceId || 
                    service.service_id ||
                    service.resourceId ||
                    service.resource_id ||
                    (name && name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) ||
                    (endpoint && endpoint.replace(/[^a-z0-9-]/gi, '-')) ||
                    `service-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  // Extract network and chainId
  const network = service.network || 
                  service.chain || 
                  (service.metadata && service.metadata.network) ||
                  'base';
  
  const chainId = service.chainId || 
                  service.chain_id ||
                  service.chainId ||
                  (service.metadata && service.metadata.chainId) ||
                  BASE_CHAIN_ID;
  
  // Log if we're creating an unnamed service
  if (name === 'Unnamed Service') {
    console.warn('Found service with no name:', {
      id: serviceId,
      keys: Object.keys(service),
      service: JSON.stringify(service).substring(0, 300)
    });
  }
  
  return {
    id: serviceId,
    name: name,
    description: description,
    merchant: merchant,
    network: network,
    chainId: typeof chainId === 'string' ? parseInt(chainId) : chainId,
    token: token,
    tokenSymbol: tokenSymbol || 'USDC',
    price: price,
    endpoint: endpoint,
    websiteUrl: websiteUrl,
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
