/**
 * Next.js API Route - Proxy to Express x402 Server
 * 
 * This route proxies requests to the Express x402 server.
 * The Express server handles payment verification via PayAI middleware.
 * 
 * Client calls: /api/r1x-agent/chat (same origin, no CORS)
 * Next.js proxies to: Express server (server-to-server, no CORS needed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getX402ServerUrl } from '@/lib/x402-server-url';

export async function POST(request: NextRequest) {
  try {
    // Get Express server URL (server-side only, not exposed to client)
    const expressServerUrl = getX402ServerUrl();
    
    // Forward request body
    const body = await request.json();
    
    // Forward headers (including X-Payment if present)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward X-Payment header if present (payment proof from x402-fetch)
    const xPaymentHeader = request.headers.get('x-payment');
    if (xPaymentHeader) {
      headers['X-Payment'] = xPaymentHeader;
    }
    
    console.log('[Next.js Proxy] Forwarding to Express server:', `${expressServerUrl}/api/r1x-agent/chat`);
    
    // Forward request to Express server
    const response = await fetch(`${expressServerUrl}/api/r1x-agent/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    // Get response data
    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { error: data };
    }
    
    // Forward all headers from Express (important for 402 responses and payment quotes)
    const headers: Record<string, string> = {};
    
    // Forward X-Payment header if present
    const xPayment = response.headers.get('x-payment');
    if (xPayment) {
      headers['X-Payment'] = xPayment;
    }
    
    // Forward Content-Type
    const contentType = response.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    // Forward status and response (including 402 Payment Required)
    return NextResponse.json(jsonData, { 
      status: response.status, // Preserve 402 status for x402-fetch
      headers,
    });
  } catch (error: any) {
    console.error('[Next.js Proxy] Error forwarding to Express:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to forward request to x402 server' },
      { status: 500 }
    );
  }
}

