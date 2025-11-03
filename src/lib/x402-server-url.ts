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
    return process.env.NEXT_PUBLIC_X402_SERVER_URL || 'http://localhost:4021';
  }
  
  // Server-side: use X402_SERVER_URL (not exposed to client)
  if (process.env.X402_SERVER_URL) {
    return process.env.X402_SERVER_URL;
  }
  
  // Fallback to localhost for development
  return process.env.NEXT_PUBLIC_X402_SERVER_URL || 'http://localhost:4021';
}

