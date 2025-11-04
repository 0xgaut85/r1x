/**
 * Debug Echo Route - Proxies to PayAI Echo Merchant for client flow validation
 *
 * Use with x402-fetch from the browser to validate payment flow end-to-end
 * without involving our Express server. This isolates client/payment issues.
 */

import { NextRequest, NextResponse } from 'next/server';

const ECHO_URL = 'https://x402.payai.network/api/base/paid-content';

export async function POST(request: NextRequest) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward payment header if present
    const xPayment = request.headers.get('x-payment');
    if (xPayment) headers['X-Payment'] = xPayment;

    const body = await request.text();

    const response = await fetch(ECHO_URL, {
      method: 'POST',
      headers,
      body,
    });

    const text = await response.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    // Forward relevant x402 headers
    const responseHeaders: Record<string, string> = {};
    const forward = (name: string, out?: string) => {
      const value = response.headers.get(name);
      if (value) responseHeaders[out ?? name] = value;
    };
    forward('x-payment', 'X-Payment');
    forward('x-payment-response', 'X-Payment-Response');
    forward('x-payment-required', 'X-Payment-Required');
    forward('x-payment-quote', 'X-Payment-Quote');
    forward('www-authenticate', 'WWW-Authenticate');
    forward('content-type', 'Content-Type');

    return NextResponse.json(json, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Echo proxy failed' },
      { status: 500 },
    );
  }
}


