/**
 * Next.js API Route - Proxy to external x402 resource (avoids browser CORS)
 * 
 * The browser calls this same-origin endpoint. This route forwards the request
 * to the external merchant resource server-to-server and preserves x402 headers.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, method = 'POST', headers: clientHeaders, body } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid url' }, { status: 400 });
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(clientHeaders || {}),
    };

    // Forward request to external resource with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Read response body as text first (could be JSON or not)
    const dataText = await response.text();
    let jsonData: any;
    try {
      jsonData = JSON.parse(dataText);
    } catch {
      jsonData = { data: dataText };
    }

    // Forward relevant x402 headers
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

    return NextResponse.json(jsonData, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Proxy error' },
      { status: 500 }
    );
  }
}


