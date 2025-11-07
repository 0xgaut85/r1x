import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  // Echo Merchant entries (based strictly on PayAI docs)
  // https://docs.payai.network/x402-echo/getting-started
  const services = [
    {
      id: 'echo-base-paid-content',
      name: 'X402 Echo Merchant (Base) — Paid Content [TEST]',
      description:
        'Live x402 test merchant. Returns 402 → pay → 200 and refunds tokens. PayAI covers fees. Use to validate your x402 client end‑to‑end.',
      category: 'Test',
      endpoint: 'https://x402.payai.network/api/base/paid-content',
      merchant: 'payai-echo',
      price: '0.00', // Echo refunds; price quoted at runtime via 402
      tokenSymbol: 'USDC',
      network: 'base',
      chainId: 8453,
      isExternal: true,
    },
  ];

  return NextResponse.json({ services, total: services.length });
}


