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
 * Check if we're in production (not localhost)
 */
function isProduction(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check NEXT_PUBLIC_BASE_URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    return !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1') && baseUrl.length > 0;
  }
  // Client-side: check window.location
  const hostname = window.location.hostname;
  return !hostname.includes('localhost') && !hostname.includes('127.0.0.1');
}

/**
 * Fetch x402 server URL from runtime config API
 * This allows Railway to set env vars after deployment without rebuild
 */
async function fetchRuntimeUrl(): Promise<string> {
  // Return cached value if available
  if (cachedRuntimeUrl) {
    console.log('[x402-server-url] Using cached runtime URL:', cachedRuntimeUrl);
    return cachedRuntimeUrl;
  }

  // Return existing promise if already fetching
  if (runtimeUrlPromise) {
    console.log('[x402-server-url] Already fetching runtime URL, waiting...');
    return runtimeUrlPromise;
  }

  // Fetch from runtime config API
  runtimeUrlPromise = (async () => {
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const apiUrl = `${baseUrl}/api/config/x402-server-url`;
      console.log('[x402-server-url] Fetching runtime config from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      console.log('[x402-server-url] Runtime config API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[x402-server-url] Runtime config API failed:', response.status, errorText);
        throw new Error(`Runtime config API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[x402-server-url] Runtime config API response:', data);
      
      if (data.url && data.url !== 'http://localhost:4021') {
        cachedRuntimeUrl = normalizeUrl(data.url);
        console.log('[x402-server-url] Successfully fetched runtime URL:', cachedRuntimeUrl, '(source:', data.source, ')');
        return cachedRuntimeUrl;
      }

      console.warn('[x402-server-url] Runtime config API returned invalid URL:', data.url);
      throw new Error('Runtime config API returned invalid URL');
    } catch (error: any) {
      console.error('[x402-server-url] Failed to fetch runtime config:', error?.message || error);
      // Don't return localhost in production - throw error instead
      if (isProduction()) {
        throw error;
      }
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
 * 
 * Priority in production:
 * 1. Runtime config API (X402_SERVER_URL) - always prefer in production
 * 2. Build-time var (NEXT_PUBLIC_X402_SERVER_URL) - only if not localhost
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
  
  // Client-side: In production, ALWAYS prefer runtime config API
  if (isProduction()) {
    const buildTimeUrl = process.env.NEXT_PUBLIC_X402_SERVER_URL;
    
    // If build-time var is localhost or missing, MUST use runtime config
    if (!buildTimeUrl || buildTimeUrl === 'http://localhost:4021' || buildTimeUrl.includes('localhost')) {
      console.log('[x402-server-url] Production detected, build-time var is localhost/missing, fetching runtime config');
      try {
        const runtimeUrl = await fetchRuntimeUrl();
        if (runtimeUrl && !runtimeUrl.includes('localhost')) {
          return runtimeUrl;
        }
        throw new Error('Runtime config returned localhost');
      } catch (error: any) {
        console.error('[x402-server-url] CRITICAL: Runtime config fetch failed in production!', error?.message || error);
        console.error('[x402-server-url] Error details:', {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
        });
        // In production, we should never use localhost
        throw new Error(`Cannot determine x402 server URL. Runtime config API failed: ${error?.message || 'Unknown error'}. Please ensure X402_SERVER_URL is set in Railway environment variables and the runtime config API is accessible.`);
      }
    }
    
    // Build-time var is set and valid, but still prefer runtime config (it's more reliable)
    // Try runtime config first, fallback to build-time if it fails
    try {
      const runtimeUrl = await fetchRuntimeUrl();
      if (runtimeUrl && !runtimeUrl.includes('localhost')) {
        console.log('[x402-server-url] Using runtime config URL (preferred):', runtimeUrl);
        return runtimeUrl;
      }
      console.warn('[x402-server-url] Runtime config returned localhost, using build-time var');
    } catch (error) {
      console.warn('[x402-server-url] Runtime config fetch failed, using build-time var:', error);
    }
    
    // Fallback to build-time var if runtime config unavailable
    console.log('[x402-server-url] Using build-time URL:', buildTimeUrl);
    return normalizeUrl(buildTimeUrl);
  }
  
  // Development: use build-time var or localhost
  const buildTimeUrl = process.env.NEXT_PUBLIC_X402_SERVER_URL;
  if (buildTimeUrl && buildTimeUrl !== 'http://localhost:4021') {
    return normalizeUrl(buildTimeUrl);
  }
  
  return 'http://localhost:4021';
}

/**
 * Synchronous version (for backwards compatibility)
 * Returns immediately, but may return localhost if env var wasn't set at build time
 * 
 * NOTE: In production, this will return localhost if build-time var wasn't set.
 * Use getX402ServerUrlAsync() for production instead.
 * 
 * @deprecated Use getX402ServerUrlAsync() for production
 */
export function getX402ServerUrl(): string {
  // Client-side: use NEXT_PUBLIC_X402_SERVER_URL
  if (typeof window !== 'undefined') {
    const url = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'http://localhost:4021';
    const normalized = normalizeUrl(url);
    
    // In production, don't log error (async version handles it)
    // Just return the value - the async version will handle runtime config
    if (normalized.includes('localhost') && isProduction()) {
      // Silently return localhost - async version will fix it
      // This prevents error spam in console
      return normalized;
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

