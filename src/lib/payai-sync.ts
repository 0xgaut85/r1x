/**
 * PayAI Facilitator Integration
 * 
 * Fetches real services and tokens from PayAI facilitator
 */

import { prisma } from '@/lib/db';
import { formatUnits, parseUnits } from 'viem';

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
  // Extended fields
  type?: string;
  method?: string;
  inputSchema?: any;
  outputSchema?: any;
  source?: string;
  isExternal?: boolean;
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
    // Prefer /resources (per docs), fallback to /list if present
    const endpoints = ['/resources', '/list'];

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
            if (data.id || data.name || data.endpoint || data.api || data.resource) {
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
 * PayAI facilitator /list endpoint returns resources with structure:
 * {
 *   resource: string,        // Resource URL
 *   type: string,            // "http"
 *   x402Version: number,     // Protocol version
 *   accepts: [{              // Payment requirements array
 *     asset: string,         // Token address
 *     payTo: string,         // Merchant address
 *     scheme: string,        // Payment scheme
 *     network: string,       // "base" or "base-sepolia"
 *     description: string,   // Service description
 *     resource: string,      // Resource URL
 *     extra: { name: "USD Coin", version: "2" }
 *     // ... price info might be here
 *   }],
 *   lastUpdated: number,     // Unix timestamp
 *   metadata: {              // Optional metadata
 *     name?: string,
 *     category?: string,
 *     provider?: string,
 *   }
 * }
 */
function normalizePayAIService(service: any): PayAIService {
  console.log('Normalizing PayAI service:', JSON.stringify(service).substring(0, 500));
  
  // PayAI resource format: extract from accepts array and metadata
  const accepts = Array.isArray(service.accepts) ? service.accepts : [];
  const firstAccept = accepts.length > 0 ? accepts[0] : {};
  const metadata = service.metadata || {};
  
  // Extract name - from metadata.name, first accept description, or resource URL
  const name = metadata.name || 
               metadata.title ||
               metadata.label ||
               firstAccept.description ||
               firstAccept.name ||
               service.name ||
               service.serviceName ||
               service.title ||
               // Fallback: extract from resource URL
               (service.resource ? (() => {
                 try {
                   const url = new URL(service.resource);
                   return url.pathname.split('/').filter(Boolean).pop() || 'Service';
                 } catch {
                   return service.resource.split('/').filter(Boolean).pop() || 'Service';
                 }
               })() : 'Unnamed Service');
  
  // Extract description - from first accept description or metadata
  const description = firstAccept.description ||
                      metadata.description ||
                      metadata.desc ||
                      service.description ||
                      service.desc ||
                      '';
  
  // Extract merchant address - from first accept payTo
  const merchant = firstAccept.payTo ||
                   service.merchant ||
                   service.merchantAddress ||
                   metadata.merchant ||
                   metadata.owner ||
                   '';
  
  // Extract token address - from first accept asset
  const token = firstAccept.asset ||
                service.token ||
                service.tokenAddress ||
                metadata.token ||
                metadata.currency ||
                USDC_BASE_ADDRESS;
  
  // Extract token symbol - from first accept extra.name or determine from token address
  let tokenSymbol = firstAccept.extra?.name ||
                    metadata.tokenSymbol ||
                    service.tokenSymbol ||
                    service.token_symbol ||
                    '';
  
  // If no token symbol, determine from token address
  if (!tokenSymbol) {
    if (token.toLowerCase() === USDC_BASE_ADDRESS.toLowerCase()) {
      tokenSymbol = 'USDC';
    } else if (token.toLowerCase() === '0x036CbD53842c5426634e7929541eC2318f3dCF7e'.toLowerCase()) {
      // USDC on Base Sepolia
      tokenSymbol = 'USDC';
    } else {
      tokenSymbol = 'UNKNOWN';
    }
  }
  
  // Extract price - PayAI resources may have price in accepts array
  // Price might be in accepts[0].amount, accepts[0].value, or similar
  let priceValue = firstAccept.amount ||
                   firstAccept.value ||
                   firstAccept.price ||
                   service.price ||
                   metadata.price ||
                   '0'; // Default to 0 if no price found
  
  // Ensure price is in wei format (for USDC, 6 decimals)
  // PayAI might return price as string "$0.001" or as amount in wei
  let priceWei = priceValue;
  if (typeof priceValue === 'string') {
    // Check if it's a dollar amount like "$0.001"
    if (priceValue.startsWith('$')) {
      const decimals = tokenSymbol === 'USDC' ? 6 : 18;
      try {
        const numericPrice = priceValue.replace('$', '').trim();
        priceWei = parseUnits(numericPrice, decimals).toString();
      } catch {
        priceWei = '0';
      }
    } else if (priceValue.includes('.')) {
      // Likely human-readable format, convert to wei
      const decimals = tokenSymbol === 'USDC' ? 6 : 18;
      try {
        priceWei = parseUnits(priceValue, decimals).toString();
      } catch {
        priceWei = '0';
      }
    }
    // Otherwise assume it's already in wei format
  } else if (typeof priceValue === 'number') {
    const decimals = tokenSymbol === 'USDC' ? 6 : 18;
    priceWei = parseUnits(priceValue.toString(), decimals).toString();
  }
  
  // If still no valid price, default to a small amount (0.001 USDC)
  if (!priceWei || priceWei === '0') {
    const decimals = tokenSymbol === 'USDC' ? 6 : 18;
    priceWei = parseUnits('0.001', decimals).toString();
  }
  
  // Extract endpoint/API URL - from resource field (PayAI format)
  const endpoint = service.resource ||
                   firstAccept.resource ||
                   service.endpoint ||
                   service.apiEndpoint ||
                   '';
  
  // Extract website URL for screenshot - use resource URL if it's a full URL
  const websiteUrl = metadata.website ||
                     metadata.websiteUrl ||
                     metadata.homepage ||
                     metadata.url ||
                     // Use resource URL as website if it's a full URL
                     (service.resource && (service.resource.startsWith('http://') || service.resource.startsWith('https://')) ? service.resource : '') ||
                     '';
  
  // Extract service type from metadata or infer from endpoint/resource
  const type = metadata.type ||
               metadata.serviceType ||
               (service.resource?.includes('nft') || service.resource?.includes('mint') ? 'nft_mint' :
                service.resource?.includes('token') ? 'token' :
                service.resource?.includes('api') ? 'api' : 'api');
  
  // Extract HTTP method (default POST for x402)
  const method = metadata.method || 
                 metadata.httpMethod ||
                 (firstAccept.outputSchema?.input?.method || 'POST');
  
  // Extract schemas from accepts array
  const inputSchema = firstAccept.outputSchema?.input || 
                      firstAccept.inputSchema ||
                      metadata.inputSchema ||
                      null;
  const outputSchema = firstAccept.outputSchema?.output ||
                       firstAccept.outputSchema ||
                       metadata.outputSchema ||
                       null;
  
  // Mark as external (from PayAI facilitator)
  const isExternal = true; // All PayAI facilitator services are external
  
  // Extract service ID - use resource URL as ID or generate from resource
  const serviceId = service.id ||
                    service.resourceId ||
                    (service.resource ? 
                      service.resource.replace(/[^a-z0-9-]/gi, '-').substring(0, 100) :
                      `service-${Date.now()}-${Math.random().toString(36).substring(7)}`
                    );
  
  // Extract network and chainId from first accept or service
  const network = firstAccept.network ||
                  service.network ||
                  metadata.network ||
                  'base';
  
  // Map network name to chainId
  const chainId = network === 'base' ? 8453 :
                  network === 'base-sepolia' ? 84532 :
                  service.chainId ||
                  metadata.chainId ||
                  BASE_CHAIN_ID;
  
  // Log if we're creating an unnamed service
  if (name === 'Unnamed Service' || name === 'Service') {
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
    price: priceWei,
    endpoint: endpoint,
    websiteUrl: websiteUrl,
    metadata: service,
    // Extended fields
    type: type,
    method: method,
    inputSchema: inputSchema,
    outputSchema: outputSchema,
    source: 'payai',
    isExternal: isExternal,
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

      // Try upsert with extended fields first
      try {
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
            // Extended fields (only if migration applied)
            type: service.type || null,
            method: service.method || null,
            inputSchema: service.inputSchema || null,
            outputSchema: service.outputSchema || null,
            source: service.source || 'payai',
            isExternal: service.isExternal ?? true,
            websiteUrl: service.websiteUrl || null,
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
            // Extended fields (only if migration applied)
            type: service.type || null,
            method: service.method || null,
            inputSchema: service.inputSchema || null,
            outputSchema: service.outputSchema || null,
            source: service.source || 'payai',
            isExternal: service.isExternal ?? true,
            websiteUrl: service.websiteUrl || null,
          },
        });
      } catch (upsertError: any) {
        // If migration not applied, upsert without extended fields
        if (upsertError.code === 'P2022' || upsertError.message?.includes('does not exist')) {
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
        } else {
          throw upsertError;
        }
      }

      synced++;
    } catch (error: any) {
      console.error(`Error syncing service ${service.id}:`, error.message);
      errors++;
    }
  }

  // If no services were synced from PayAI, seed with example services
  if (synced === 0) {
    console.log('No PayAI services found, seeding with example services...');
    await seedExampleServices();
  }

  return { synced, errors };
}

/**
 * Seed example services when PayAI has no services
 */
async function seedExampleServices() {
  const exampleServices = [
    {
      serviceId: 'example-1',
      name: 'AI Chat Service',
      description: 'AI-powered chat service',
      category: 'AI',
      merchant: '0x0000000000000000000000000000000000000000',
      network: 'base',
      chainId: 8453,
      token: USDC_BASE_ADDRESS,
      tokenSymbol: 'USDC',
      price: '1000000', // 1 USDC
      priceDisplay: '1.0',
      endpoint: 'https://example.com/api/chat',
      available: true,
      metadata: {},
    },
    {
      serviceId: 'example-2',
      name: 'Data Processing',
      description: 'Process large datasets',
      category: 'Compute',
      merchant: '0x0000000000000000000000000000000000000000',
      network: 'base',
      chainId: 8453,
      token: USDC_BASE_ADDRESS,
      tokenSymbol: 'USDC',
      price: '1500000', // 1.5 USDC
      priceDisplay: '1.5',
      endpoint: 'https://example.com/api/process',
      available: true,
      metadata: {},
    },
    {
      serviceId: 'example-3',
      name: 'Image Generation',
      description: 'Generate images from text',
      category: 'AI',
      merchant: '0x0000000000000000000000000000000000000000',
      network: 'base',
      chainId: 8453,
      token: USDC_BASE_ADDRESS,
      tokenSymbol: 'USDC',
      price: '500000', // 0.5 USDC
      priceDisplay: '0.5',
      endpoint: 'https://example.com/api/generate',
      available: true,
      metadata: {},
    },
    {
      serviceId: 'example-4',
      name: 'Video Processing',
      description: 'Process and encode video files',
      category: 'Media',
      merchant: '0x0000000000000000000000000000000000000000',
      network: 'base',
      chainId: 8453,
      token: USDC_BASE_ADDRESS,
      tokenSymbol: 'USDC',
      price: '5000000', // 5 USDC
      priceDisplay: '5.0',
      endpoint: 'https://example.com/api/video',
      available: true,
      metadata: {},
    },
    {
      serviceId: 'example-5',
      name: 'API Gateway',
      description: 'Proxy and rate limit API requests',
      category: 'Infrastructure',
      merchant: '0x0000000000000000000000000000000000000000',
      network: 'base',
      chainId: 8453,
      token: USDC_BASE_ADDRESS,
      tokenSymbol: 'USDC',
      price: '2000000', // 2 USDC
      priceDisplay: '2.0',
      endpoint: 'https://example.com/api/gateway',
      available: true,
      metadata: {},
    },
  ];

  for (const service of exampleServices) {
    try {
      await prisma.service.upsert({
        where: { serviceId: service.serviceId },
        update: service,
        create: service,
      });
    } catch (error: any) {
      console.error(`Error seeding example service ${service.serviceId}:`, error.message);
    }
  }
}

/**
 * Extract category from service name or description
 */
function extractCategory(name: string, description?: string): string {
  const text = `${name} ${description || ''}`.toLowerCase();
  
  if (text.includes('ai') || text.includes('chat') || text.includes('llm') || text.includes('gpt')) {
    return 'AI';
  }
  if (text.includes('image') || text.includes('photo') || text.includes('picture')) {
    return 'Media';
  }
  if (text.includes('video') || text.includes('movie') || text.includes('stream')) {
    return 'Media';
  }
  if (text.includes('data') || text.includes('database') || text.includes('storage')) {
    return 'Data';
  }
  if (text.includes('compute') || text.includes('processing') || text.includes('gpu')) {
    return 'Compute';
  }
  if (text.includes('api') || text.includes('endpoint') || text.includes('gateway')) {
    return 'Infrastructure';
  }
  if (text.includes('marketplace') || text.includes('buy') || text.includes('sell')) {
    return 'Marketplace';
  }
  
  return 'Other';
}
