'use client';

/**
 * Client-safe runtime config fetched from Railway via API.
 * Cached per session to avoid repeated network calls.
 */
export type RuntimeConfig = {
  projectId: string;
  platformFeePercentage: string;
  solanaFeeRecipient: string;
  payaiFacilitatorUrl: string;
  daydreamsFacilitatorUrl: string;
  x402ServerUrl: string;
  baseUrl: string;
  logokitApiKey: string;
};

let cachedConfig: RuntimeConfig | null = null;
let inFlight: Promise<RuntimeConfig> | null = null;

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  if (cachedConfig) return cachedConfig;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetch('/api/config/runtime', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Runtime config fetch failed: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      cachedConfig = data as RuntimeConfig;
      return cachedConfig;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function resetRuntimeConfigCache() {
  cachedConfig = null;
  inFlight = null;
}



