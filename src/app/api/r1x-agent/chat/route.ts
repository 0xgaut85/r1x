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
    
    // Check if we're in development (localhost is OK) or production (localhost is not OK)
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost') ||
                         !process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!expressServerUrl) {
      console.error('[Next.js Proxy] Express server URL not configured:', expressServerUrl);
      return NextResponse.json(
        { 
          error: 'Express server URL not configured',
          message: 'X402_SERVER_URL environment variable is missing. Please set it in Railway or use default localhost:4021 for development.',
          expressServerUrl: expressServerUrl || 'not set'
        },
        { status: 500 }
      );
    }
    
    // In production, reject localhost URLs (they won't work)
    if (!isDevelopment && expressServerUrl.includes('localhost')) {
      console.error('[Next.js Proxy] Invalid Express server URL for production:', expressServerUrl);
      return NextResponse.json(
        { 
          error: 'Express server URL not configured',
          message: 'X402_SERVER_URL is set to localhost in production. Please set it to your Railway Express service URL.',
          expressServerUrl: expressServerUrl
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
      console.log('[Next.js Proxy] X-Payment header present, forwarding to Express server');
      // Log payment proof structure (first 200 chars to avoid logging sensitive data)
      try {
        const paymentProof = JSON.parse(xPaymentHeader);
        console.log('[Next.js Proxy] Payment proof structure:', {
          hasSignature: !!paymentProof.signature,
          hasMessage: !!paymentProof.message,
          hasTimestamp: !!paymentProof.timestamp,
          chainId: paymentProof.chainId,
        });
      } catch (e) {
        console.log('[Next.js Proxy] X-Payment header (not JSON):', xPaymentHeader.substring(0, 200));
      }
    } else {
      console.log('[Next.js Proxy] No X-Payment header - first request (will get 402)');
    }
    
    // Test health endpoint first (diagnostic)
    const healthUrl = `${expressServerUrl}/health`;
    const targetUrl = `${expressServerUrl}/api/r1x-agent/chat`;
    
    console.log('[Next.js Proxy] Express server URL:', expressServerUrl);
    console.log('[Next.js Proxy] Health check URL:', healthUrl);
    console.log('[Next.js Proxy] Target URL:', targetUrl);
    console.log('[Next.js Proxy] Request details:', {
      method: 'POST',
      hasXPayment: !!xPaymentHeader,
      bodySize: JSON.stringify(body).length,
    });
    
    // Quick health check (non-blocking, for diagnostics only)
    fetch(healthUrl, { 
      method: 'GET',
      signal: AbortSignal.timeout(10000), // 10 second timeout for health check (increased for Railway)
    }).then(healthResponse => {
      console.log('[Next.js Proxy] Health check response:', {
        status: healthResponse.status,
        ok: healthResponse.ok,
      });
      if (healthResponse.ok) {
        healthResponse.json().then(data => {
          console.log('[Next.js Proxy] Health check data:', data);
        }).catch(() => {});
      }
    }).catch(healthError => {
      console.warn('[Next.js Proxy] Health check failed (non-blocking):', {
        message: healthError.message,
        name: healthError.name,
      });
    });
    
    // Forward request to Express server with timeout
    // Increased timeout for Railway network latency
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout (increased for Railway)
    
    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log('[Next.js Proxy] Express server response:', {
        status: response.status,
        statusText: response.statusText,
        hasBody: !!response.body,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      console.error('[Next.js Proxy] Fetch error details:', {
        name: fetchError.name,
        message: fetchError.message,
        cause: fetchError.cause,
        code: fetchError.code,
        errno: fetchError.errno,
        syscall: fetchError.syscall,
        targetUrl: targetUrl,
        expressServerUrl: expressServerUrl,
      });
      
      if (fetchError.name === 'AbortError') {
        console.error('[Next.js Proxy] Request timeout to Express server:', targetUrl);
        return NextResponse.json(
          { 
            error: 'Express server timeout',
            message: 'The Express server did not respond within 60 seconds. Please check if the Express service is running.',
            expressServerUrl: expressServerUrl,
            targetUrl: targetUrl,
            healthUrl: healthUrl,
          },
          { status: 504 }
        );
      }
      
      // Check if it's a DNS/connection error
      const isConnectionError = fetchError.message?.includes('ECONNREFUSED') || 
                                fetchError.message?.includes('ENOTFOUND') ||
                                fetchError.message?.includes('getaddrinfo') ||
                                fetchError.code === 'ECONNREFUSED' ||
                                fetchError.code === 'ENOTFOUND';
      
      return NextResponse.json(
        { 
          error: 'Failed to connect to Express server',
          message: fetchError.message || 'Network error',
          expressServerUrl: expressServerUrl,
          targetUrl: targetUrl,
          healthUrl: healthUrl,
          errorType: fetchError.name,
          errorCode: fetchError.code,
          isConnectionError: isConnectionError,
          details: isConnectionError 
            ? 'Cannot reach Express server. Verify X402_SERVER_URL is correct and Express service is running.'
            : 'Check Express server logs for errors'
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

