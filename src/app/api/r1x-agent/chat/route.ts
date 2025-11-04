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
    
    if (!expressServerUrl || expressServerUrl.includes('localhost')) {
      console.error('[Next.js Proxy] Invalid Express server URL:', expressServerUrl);
      return NextResponse.json(
        { 
          error: 'Express server URL not configured',
          message: 'X402_SERVER_URL environment variable is missing or set to localhost. Please set it in Railway.',
          expressServerUrl: expressServerUrl || 'not set'
        },
        { status: 500 }
      );
    }
    
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
    
    const targetUrl = `${expressServerUrl}/api/r1x-agent/chat`;
    console.log('[Next.js Proxy] Forwarding to Express server:', targetUrl);
    
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
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('[Next.js Proxy] Request timeout to Express server:', targetUrl);
        return NextResponse.json(
          { 
            error: 'Express server timeout',
            message: 'The Express server did not respond within 30 seconds. Please check if the Express service is running on Railway.',
            expressServerUrl: expressServerUrl
          },
          { status: 504 }
        );
      }
      
      console.error('[Next.js Proxy] Fetch error:', fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to connect to Express server',
          message: fetchError.message || 'Network error',
          expressServerUrl: expressServerUrl,
          details: 'Check Railway logs for Express service status'
        },
        { status: 502 }
      );
    }
    
    // Handle Railway 502 errors
    if (response.status === 502) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[Next.js Proxy] Railway 502 error from Express server:', errorText);
      return NextResponse.json(
        { 
          error: 'Express server not responding',
          message: 'The Express server returned a 502 error. This usually means the service is down or not accessible.',
          expressServerUrl: expressServerUrl,
          details: errorText,
          troubleshooting: [
            '1. Check Railway → Express Service → Status (should be "Active")',
            '2. Check Railway → Express Service → Logs for errors',
            '3. Verify X402_SERVER_URL is correct in Railway',
            '4. Test Express server directly: curl ' + expressServerUrl + '/health'
          ]
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
    
    // Forward all headers from Express (important for 402 responses and payment quotes)
    const responseHeaders: Record<string, string> = {};
    
    // Forward X-Payment header if present
    const xPayment = response.headers.get('x-payment');
    if (xPayment) {
      responseHeaders['X-Payment'] = xPayment;
    }
    
    // Forward Content-Type
    const contentType = response.headers.get('content-type');
    if (contentType) {
      responseHeaders['Content-Type'] = contentType;
    }
    
    // Forward status and response (including 402 Payment Required)
    return NextResponse.json(jsonData, { 
      status: response.status, // Preserve 402 status for x402-fetch
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[Next.js Proxy] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy error',
        message: error.message || 'Failed to forward request to x402 server',
        details: error.stack
      },
      { status: 500 }
    );
  }
}

