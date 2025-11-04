/**
 * Normalize URL to ensure it has a protocol
 */
function normalizeUrl(url: string): string {
  if (!url) return url;
  
  // If URL already has a protocol, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Assume https for production URLs (no localhost)
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
    return `https://${url}`;
  }
  
  // Use http for localhost
  return `http://${url}`;
}

/**
 * Cached runtime config URL (fetched once per session)
 */
let cachedRuntimeUrl: string | null = null;
let runtimeUrlPromise: Promise<string> | null = null;

/**
 * Fetch x402 server URL from runtime config API
 * This allows Railway to set env vars after deployment without rebuild
 */
async function fetchRuntimeUrl(): Promise<string> {
  // Return cached value if available
  if (cachedRuntimeUrl) {
    return cachedRuntimeUrl;
  }

  // Return existing promise if already fetching
  if (runtimeUrlPromise) {
    return runtimeUrlPromise;
  }

  // Fetch from runtime config API
  runtimeUrlPromise = (async () => {
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/config/x402-server-url`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn('[x402-server-url] Runtime config API failed, using fallback');
        return 'http://localhost:4021';
      }

      const data = await response.json();
      if (data.url) {
        cachedRuntimeUrl = normalizeUrl(data.url);
        console.log('[x402-server-url] Using runtime config URL:', cachedRuntimeUrl);
        return cachedRuntimeUrl;
      }

      return 'http://localhost:4021';
    } catch (error) {
      console.error('[x402-server-url] Failed to fetch runtime config:', error);
      return 'http://localhost:4021';
    } finally {
      runtimeUrlPromise = null;
    }
  })();

  return runtimeUrlPromise;
}

/**
 * Get x402 Express Server URL
 * Works both client-side and server-side
 * 
 * Client-side: Uses NEXT_PUBLIC_X402_SERVER_URL (build-time) or runtime config API (fallback)
 * Server-side: Uses X402_SERVER_URL (not exposed to client)
 * 
 * IMPORTANT: NEXT_PUBLIC_* vars are embedded at BUILD TIME in Next.js.
 * If not set during Railway build, this function will try to fetch from runtime API.
 */
export async function getX402ServerUrlAsync(): Promise<string> {
  // Server-side: use X402_SERVER_URL (not exposed to client)
  if (typeof window === 'undefined') {
    if (process.env.X402_SERVER_URL) {
      return normalizeUrl(process.env.X402_SERVER_URL);
    }
    // Fallback to NEXT_PUBLIC for server-side rendering
    const url = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'http://localhost:4021';
    return normalizeUrl(url);
  }
  
  // Client-side: check build-time env var first
  const buildTimeUrl = process.env.NEXT_PUBLIC_X402_SERVER_URL;
  
  if (buildTimeUrl && buildTimeUrl !== 'http://localhost:4021') {
    // Build-time env var is set and valid
    return normalizeUrl(buildTimeUrl);
  }

  // Build-time env var missing or is localhost fallback
  // Try to fetch from runtime config API
  console.warn('[x402-server-url] NEXT_PUBLIC_X402_SERVER_URL not set at build time, fetching from runtime config');
  return fetchRuntimeUrl();
}

/**
 * Synchronous version (for backwards compatibility)
 * Returns immediately, but may return localhost if env var wasn't set at build time
 * 
 * @deprecated Use getX402ServerUrlAsync() for production
 */
export function getX402ServerUrl(): string {
  // Client-side: use NEXT_PUBLIC_X402_SERVER_URL
  if (typeof window !== 'undefined') {
    const url = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'http://localhost:4021';
    const normalized = normalizeUrl(url);
    
    // Log warning if using localhost fallback in production
    if (normalized.includes('localhost') && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
        console.error(
          '[x402-server-url] CRITICAL: NEXT_PUBLIC_X402_SERVER_URL not set at build time!\n' +
          '  Current URL:', normalized, '\n' +
          '  Fix: Set NEXT_PUBLIC_X402_SERVER_URL in Railway BEFORE building, or use getX402ServerUrlAsync()'
        );
      }
    }
    
    return normalized;
  }
  
  // Server-side: use X402_SERVER_URL (not exposed to client)
  if (process.env.X402_SERVER_URL) {
    return normalizeUrl(process.env.X402_SERVER_URL);
  }
  
  // Fallback to localhost for development
  const url = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'http://localhost:4021';
  return normalizeUrl(url);
}

