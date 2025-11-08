/**
 * Daydreams Facilitator Integration
 * 
 * Fetches services from Daydreams facilitator for Solana network
 * Following Daydreams facilitator API: https://facilitator.daydreams.systems/
 */

import { prisma } from '@/lib/db';

const DAYDREAMS_FACILITATOR_URL = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';
const SOLANA_NETWORK = 'solana';

export interface DaydreamsService {
  id: string;
  name: string;
  description?: string;
  merchant: string;
  network: string;
  token?: string;
  tokenSymbol?: string;
  price: string;
  endpoint?: string;
  websiteUrl?: string;
  metadata?: any;
}

/**
 * Fetch services from Daydreams facilitator
 * Daydreams facilitator API endpoints: /verify, /settle, /supported
 * Service discovery via /supported or /list endpoint (if available)
 */
export async function fetchDaydreamsServices(): Promise<DaydreamsService[]> {
  try {
    console.log(`[Daydreams] Fetching services from facilitator: ${DAYDREAMS_FACILITATOR_URL}`);
    
    // Daydreams facilitator endpoints
    // Check /supported first to see what's available
    const endpoints = [
      '/supported',  // Check supported networks/tokens
      '/list',       // Service list (if available)
    ];

    let lastError: any = null;
    
    for (const endpoint of endpoints) {
      try {
        const url = `${DAYDREAMS_FACILITATOR_URL}${endpoint}`;
        console.log(`[Daydreams] Trying endpoint: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'r1x-marketplace/1.0',
        };
        
        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`[Daydreams] ${endpoint} returned ${response.status}: ${response.statusText}`);
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          continue; // Try next endpoint
        }

        const data = await response.json();
        console.log(`[Daydreams] ${endpoint} response received`);
        
        // Handle /supported endpoint (returns supported networks/tokens)
        if (endpoint === '/supported') {
          console.log('[Daydreams] Supported networks/tokens:', data);
          // Continue to try /list for actual services
          continue;
        }
        
        // Handle service list response
        let services: any[] = [];
        if (Array.isArray(data)) {
          services = data;
        } else if (data?.resources && Array.isArray(data.resources)) {
          services = data.resources;
        } else if (data?.list && Array.isArray(data.list)) {
          services = data.list;
        } else if (data?.services && Array.isArray(data.services)) {
          services = data.services;
        }
        
        if (services.length > 0) {
          const normalizedServices = services.map((s: any) => normalizeDaydreamsService(s));
          console.log(`[Daydreams] Fetched ${normalizedServices.length} services`);
          return normalizedServices;
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn(`[Daydreams] ${endpoint} request timed out`);
        } else {
          console.error(`[Daydreams] Error fetching ${endpoint}:`, error.message);
        }
        lastError = error;
        continue;
      }
    }
    
    // If no services found, return empty array
    console.warn('[Daydreams] No services found from any endpoint');
    return [];
  } catch (error: any) {
    console.error('[Daydreams] Error fetching services:', error);
    return [];
  }
}

/**
 * Normalize Daydreams service to our format
 */
function normalizeDaydreamsService(service: any): DaydreamsService {
  return {
    id: service.id || service.resourceId || `daydreams-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    name: service.name || service.title || 'Unnamed Service',
    description: service.description || '',
    merchant: service.merchant || service.payTo || '',
    network: SOLANA_NETWORK,
    token: service.token || undefined,
    tokenSymbol: service.tokenSymbol || 'SOL', // Default to SOL for Solana
    price: service.price || service.amount || '0',
    endpoint: service.endpoint || service.resource || undefined,
    websiteUrl: service.websiteUrl || service.website || undefined,
    metadata: service.metadata || service,
  };
}

/**
 * Sync Daydreams services to database
 */
export async function syncDaydreamsServices(): Promise<number> {
  try {
    const services = await fetchDaydreamsServices();
    
    if (services.length === 0) {
      console.log('[Daydreams] No services to sync');
      return 0;
    }
    
    let synced = 0;
    
    for (const service of services) {
      try {
        await prisma.service.upsert({
          where: { serviceId: service.id },
          update: {
            name: service.name,
            description: service.description,
            merchant: service.merchant,
            network: service.network,
            chainId: 0, // Solana doesn't use EVM chainId; store 0 as sentinel
            token: service.token || '',
            tokenSymbol: service.tokenSymbol || 'SOL',
            price: service.price,
            priceDisplay: service.price,
            endpoint: service.endpoint,
            available: true,
            source: 'daydreams',
            facilitatorUrl: DAYDREAMS_FACILITATOR_URL,
            metadata: service.metadata,
            updatedAt: new Date(),
          },
          create: {
            serviceId: service.id,
            name: service.name,
            description: service.description,
            merchant: service.merchant,
            network: service.network,
            chainId: 0, // Solana doesn't use EVM chainId; store 0 as sentinel
            token: service.token || '',
            tokenSymbol: service.tokenSymbol || 'SOL',
            price: service.price,
            priceDisplay: service.price,
            endpoint: service.endpoint,
            available: true,
            source: 'daydreams',
            facilitatorUrl: DAYDREAMS_FACILITATOR_URL,
            metadata: service.metadata,
          },
        });
        synced++;
      } catch (error: any) {
        console.error(`[Daydreams] Error syncing service ${service.id}:`, error.message);
      }
    }
    
    console.log(`[Daydreams] Synced ${synced} services to database`);
    return synced;
  } catch (error: any) {
    console.error('[Daydreams] Error syncing services:', error);
    return 0;
  }
}

