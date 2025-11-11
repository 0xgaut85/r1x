/**
 * Next.js API Route - Proxy Solana chat to Express x402 Server
 * 
 * Client calls: /api/r1x-agent/chat/solana (same origin)
 * Proxies to: Express /api/r1x-agent/chat/solana
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
      return NextResponse.json({ error: 'X402_SERVER_URL not configured' }, { status: 500 });
    }
    if (!isDevelopment && expressServerUrl.includes('localhost')) {
      return NextResponse.json({ error: 'X402_SERVER_URL invalid in production' }, { status: 500 });
    }

    const body = await request.json();

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const xPaymentHeader = request.headers.get('x-payment');
    if (xPaymentHeader) headers['X-Payment'] = xPaymentHeader;

    const targetUrl = `${expressServerUrl}/api/r1x-agent/chat/solana`;
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
      clearTimeout(timeoutId);
    } catch (e: any) {
      clearTimeout(timeoutId);
      return NextResponse.json({ error: e?.message || 'Network error' }, { status: 502 });
    }

    const text = await response.text();
    let jsonData: any;
    try { jsonData = JSON.parse(text); } catch { jsonData = { message: text }; }

    const responseHeaders: Record<string, string> = {};
    const forwardHeader = (name: string, outName?: string) => {
      const value = response.headers.get(name);
      if (value) responseHeaders[outName ?? name] = value;
    };
    forwardHeader('x-payment', 'X-Payment');
    forwardHeader('x-payment-response', 'X-Payment-Response');
    forwardHeader('content-type', 'Content-Type');

    return NextResponse.json(jsonData, { status: response.status, headers: responseHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Proxy error' }, { status: 500 });
  }
}








