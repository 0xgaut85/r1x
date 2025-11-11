'use client';

/**
 * Runtime Solana RPC URL fetcher
 * Fetches RPC URL from Railway env vars at runtime (not build time)
 */
let cachedRpcUrl: string | null = null;
let fetchPromise: Promise<string> | null = null;

async function fetchSolanaRpcUrl(): Promise<string> {
  try {
    const response = await fetch('/api/config/solana-rpc');
    if (!response.ok) {
      throw new Error(`Failed to fetch Solana RPC URL: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.rpcUrl) {
      throw new Error('Solana RPC URL not configured');
    }
    return data.rpcUrl;
  } catch (error) {
    console.error('[SolanaRpcConfig] Error fetching RPC URL:', error);
    // Fallback to public RPC (will fail in browser, but better than nothing)
    return 'https://api.mainnet-beta.solana.com';
  }
}

/**
 * Get Solana RPC URL from Railway env vars at runtime
 * Caches the result to avoid repeated API calls
 */
export async function getSolanaRpcUrl(): Promise<string> {
  // Return cached value if available
  if (cachedRpcUrl) {
    return cachedRpcUrl;
  }

  // If fetch is already in progress, return that promise
  if (fetchPromise) {
    return fetchPromise;
  }

  // Start fetching
  fetchPromise = fetchSolanaRpcUrl().then((url) => {
    cachedRpcUrl = url;
    fetchPromise = null;
    return url;
  });

  return fetchPromise;
}

/**
 * Reset cache (useful for testing or if env var changes)
 */
export function resetSolanaRpcCache() {
  cachedRpcUrl = null;
  fetchPromise = null;
}







