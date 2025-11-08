/**
 * Next.js API Route - Proxy to Express x402 Server Fee Endpoint
 * 
 * This route proxies agent fee requests to the Express x402 server.
 * The Express server handles payment verification via PayAI middleware.
 * Fixed $0.05 USDC fee for agent service calls.
 * 
 * Client calls: /api/fee (same origin, no CORS)
 * Next.js proxies to: Express server /api/fee (server-to-server, no CORS needed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getX402ServerUrl } from '@/lib/x402-server-url';

export async function POST(request: NextRequest) {
  try {
    // Get Express server URL (server-side only, not exposed to client)
    const expressServerUrl = getX402ServerUrl();
    
    // Check if we're in development (localhost is OK) or production (localhost is not OK)
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost') ||
                         !process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!expressServerUrl) {
      console.error('[Fee Proxy] Express server URL not configured');
      return NextResponse.json(
        { 
          error: 'Express server URL not configured',
          message: 'X402_SERVER_URL environment variable is missing. Please set it in Railway or use default localhost:4021 for development.',
        },
        { status: 500 }
      );
    }
    
    // In production, reject localhost URLs (they won't work)
    if (!isDevelopment && expressServerUrl.includes('localhost')) {
      console.error('[Fee Proxy] Invalid Express server URL for production:', expressServerUrl);
      return NextResponse.json(
        { 
          error: 'Express server URL not configured',
          message: 'X402_SERVER_URL is set to localhost in production. Please set it to your Railway Express service URL.',
          expressServerUrl: expressServerUrl
        },
        { status: 500 }
      );
    }
    
    // Forward request body (empty body is fine - fee is fixed at $0.05)
    const body = await request.json().catch(() => ({}));
    
    // Forward headers (including X-Payment if present)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward X-Payment header if present (payment proof from x402-fetch)
    const xPaymentHeader = request.headers.get('x-payment');
    if (xPaymentHeader) {
      headers['X-Payment'] = xPaymentHeader;
      console.log('[Fee Proxy] X-Payment header present, forwarding to Express server');
    } else {
      console.log('[Fee Proxy] No X-Payment header - first request (will get 402)');
    }
    
    const targetUrl = `${expressServerUrl}/api/fee`;
    
    console.log('[Fee Proxy] Forwarding agent fee request to Express server:', targetUrl);
    
    // Forward request to Express server with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log('[Fee Proxy] Express server response:', {
        status: response.status,
        statusText: response.statusText,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      console.error('[Fee Proxy] Fetch error:', {
        name: fetchError.name,
        message: fetchError.message,
        targetUrl: targetUrl,
      });
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: 'Express server timeout',
            message: 'The Express server did not respond within 30 seconds.',
            expressServerUrl: expressServerUrl,
          },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to connect to Express server',
          message: fetchError.message || 'Network error',
          expressServerUrl: expressServerUrl,
        },
        { status: 502 }
      );
    }
    
    // Handle Railway 502 errors
    if (response.status === 502) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[Fee Proxy] Railway 502 error from Express server:', errorText);
      return NextResponse.json(
        { 
          error: 'Express server not responding',
          message: 'The Express server returned a 502 error.',
          expressServerUrl: expressServerUrl,
        },
        { status: 502 }
      );
    }
    
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
    forwardHeader('content-type', 'Content-Type');
    
    // Forward status and response (including 402 Payment Required)
    return NextResponse.json(jsonData, { 
      status: response.status, // Preserve 402 status for x402-fetch
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[Fee Proxy] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy error',
        message: error.message || 'Failed to forward request to x402 server',
      },
      { status: 500 }
    );
  }
}

