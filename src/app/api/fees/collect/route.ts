/**
 * Next.js API Route - Proxy to Express x402 Server Fees Collect Endpoint
 * 
 * This route proxies marketplace fee requests to the Express x402 server.
 * Using same-origin avoids browser CORS. The Express server handles x402.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getX402ServerUrl } from '@/lib/x402-server-url';

export async function POST(request: NextRequest) {
  try {
    const expressServerUrl = getX402ServerUrl();

    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost') ||
                         !process.env.NEXT_PUBLIC_BASE_URL;

    if (!expressServerUrl) {
      return NextResponse.json(
        { error: 'Express server URL not configured' },
        { status: 500 }
      );
    }

    if (!isDevelopment && expressServerUrl.includes('localhost')) {
      return NextResponse.json(
        { error: 'Invalid Express server URL for production' },
        { status: 500 }
      );
    }

    // Body may include feeAmount
    const body = await request.json().catch(() => ({}));

    // Forward X-Payment header if present (payment proof)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const xPaymentHeader = request.headers.get('x-payment') || request.headers.get('X-Payment');
    if (xPaymentHeader) headers['X-Payment'] = xPaymentHeader;

    const targetUrl = `${expressServerUrl}/api/fees/collect`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { data: text };
    }

    const responseHeaders: Record<string, string> = {};
    const forwardHeader = (name: string, outName?: string) => {
      const value = response.headers.get(name);
      if (value) responseHeaders[outName ?? name] = value;
    };

    forwardHeader('x-payment', 'X-Payment');
    forwardHeader('x-payment-response', 'X-Payment-Response');
    forwardHeader('x-payment-required', 'X-Payment-Required');
    forwardHeader('x-payment-quote', 'X-Payment-Quote');
    forwardHeader('www-authenticate', 'WWW-Authenticate');
    forwardHeader('content-type', 'Content-Type');

    return NextResponse.json(data, { status: response.status, headers: responseHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 });
  }
}
