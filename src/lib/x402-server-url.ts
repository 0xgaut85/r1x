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
 * Get x402 Express Server URL
 * Works both client-side and server-side
 * 
 * Client-side: Uses NEXT_PUBLIC_X402_SERVER_URL
 * Server-side: Uses X402_SERVER_URL (not exposed to client)
 */
export function getX402ServerUrl(): string {
  // Client-side: use NEXT_PUBLIC_X402_SERVER_URL
  if (typeof window !== 'undefined') {
    const url = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'http://localhost:4021';
    return normalizeUrl(url);
  }
  
  // Server-side: use X402_SERVER_URL (not exposed to client)
  if (process.env.X402_SERVER_URL) {
    return normalizeUrl(process.env.X402_SERVER_URL);
  }
  
  // Fallback to localhost for development
  const url = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'http://localhost:4021';
  return normalizeUrl(url);
}

