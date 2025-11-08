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
 * We do not rely on an undocumented catalog endpoint.
 */
export async function fetchDaydreamsServices(): Promise<DaydreamsService[]> {
  if (!DAYDREAMS_FACILITATOR_URL) {
    console.warn('[Daydreams] DAYDREAMS_FACILITATOR_URL not set in Railway. Skipping Daydreams sync.');
    return [];
  }
  
  try {
    console.log(`[Daydreams] Checking supported networks/tokens: ${DAYDREAMS_FACILITATOR_URL}/supported`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${DAYDREAMS_FACILITATOR_URL}/supported`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'r1x-marketplace/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Daydreams] /supported returned ${response.status}: ${response.statusText}`);
      return [];
    }

    const data = await response.json().catch(() => ({}));
    console.log('[Daydreams] Supported response received');

    // We do not have a public service catalog in docs; rely on DB/self-serve.
    return [];
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('[Daydreams] /supported request timed out');
    } else {
      console.error('[Daydreams] Error fetching /supported:', error?.message || error);
    }
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
    tokenSymbol: service.tokenSymbol || 'SOL',
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
            chainId: 0,
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
            chainId: 0,
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

