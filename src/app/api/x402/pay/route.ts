/**
 * Next.js API Route - Proxy to Express x402 Server
 * 
 * This route proxies payment requests to the Express x402 server.
 * The Express server handles payment verification via PayAI middleware.
 * 
 * Client calls: /api/x402/pay (same origin, no CORS)
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
    
    // Forward X-Payment header if present (payment proof)
    const xPaymentHeader = request.headers.get('x-payment');
    if (xPaymentHeader) {
      headers['X-Payment'] = xPaymentHeader;
    }
    
    console.log('[Next.js Proxy] Forwarding payment request to Express server:', `${expressServerUrl}/api/x402/pay`);
    
    // Forward request to Express server
    const response = await fetch(`${expressServerUrl}/api/x402/pay`, {
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
    
    // Forward all headers from Express (important for 402 responses and payment metadata)
    const responseHeaders: Record<string, string> = {};

    // Pass-through helper for specific headers (case-insensitive)
    const forwardHeader = (name: string, outName?: string) => {
      const value = response.headers.get(name);
      if (value) responseHeaders[outName ?? name] = value;
    };

    // x402 headers that clients may rely on
    forwardHeader('x-payment', 'X-Payment');
    forwardHeader('x-payment-response', 'X-Payment-Response');
    forwardHeader('x-payment-required', 'X-Payment-Required');
    forwardHeader('x-payment-quote', 'X-Payment-Quote');
    forwardHeader('www-authenticate', 'WWW-Authenticate');

    // Content type
    forwardHeader('content-type', 'Content-Type');
    
    // Forward status and response (including 402 Payment Required)
    return NextResponse.json(jsonData, { 
      status: response.status, // Preserve 402 status for x402-fetch
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[Next.js Proxy] Error forwarding payment request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to forward payment request to x402 server' },
      { status: 500 }
    );
  }
}

