/**
 * Runtime Config API - x402 Server URL
 * 
 * Provides the x402 server URL at runtime (not build time)
 * This allows Railway to set the env var after deployment
 * without requiring a rebuild.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Server-side: use X402_SERVER_URL (not exposed to client)
  const serverUrl = process.env.X402_SERVER_URL || process.env.NEXT_PUBLIC_X402_SERVER_URL;
  
  if (!serverUrl) {
    return NextResponse.json(
      { 
        error: 'X402_SERVER_URL not configured',
        fallback: 'http://localhost:4021' 
      },
      { status: 500 }
    );
  }

  // Normalize URL to ensure it has a protocol
  let normalizedUrl = serverUrl;
  if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
    // Assume https for production URLs (no localhost)
    if (!serverUrl.includes('localhost') && !serverUrl.includes('127.0.0.1')) {
      normalizedUrl = `https://${serverUrl}`;
    } else {
      normalizedUrl = `http://${serverUrl}`;
    }
  }

  return NextResponse.json({
    url: normalizedUrl,
    source: process.env.X402_SERVER_URL ? 'X402_SERVER_URL' : 'NEXT_PUBLIC_X402_SERVER_URL',
  });
}

