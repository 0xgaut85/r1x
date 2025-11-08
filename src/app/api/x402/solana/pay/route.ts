import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function formatUSDC(amount: string): string {
  try {
    const v = BigInt(amount);
    const whole = v / BigInt(1_000_000);
    const frac = (v % BigInt(1_000_000)).toString().padStart(6, '0');
    return `${whole.toString()}.${frac}`;
  } catch {
    return amount;
  }
}

function calculateFees(amount: string, feePercentage: number = 5) {
  const amountBig = BigInt(amount);
  const fee = (amountBig * BigInt(feePercentage)) / BigInt(100);
  const merchantAmount = amountBig - fee;
  return { feeAmount: fee.toString(), merchantAmount: merchantAmount.toString() };
}

const ProofSchema = z.object({
  signature: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  amount: z.union([z.string().regex(/^\d+$/), z.number()]).transform(v => v.toString()),
  tokenSymbol: z.string().optional(),
  token: z.string().optional(),
});

async function fetchWithRetry(url: string, init: RequestInit, attempts = 2, timeoutMs = 15000): Promise<Response> {
  let lastErr: any;
  for (let i = 0; i <= attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if (res.ok || (res.status >= 400 && res.status < 500)) return res; // don't retry 4xx
      lastErr = new Error(`HTTP ${res.status}: ${res.statusText}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, serviceName, proof, verifyPayload, settlePayload } = body;

    if (!serviceId || !serviceName || !proof || !verifyPayload || !settlePayload) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsed = ProofSchema.safeParse(proof);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid proof', details: parsed.error.flatten() }, { status: 400 });
    }
    const validProof = parsed.data;

    const facilitatorUrl = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';

    // Enforce recipient matches env
    const solanaFeeRecipient = process.env.SOLANA_FEE_RECIPIENT_ADDRESS;
    if (solanaFeeRecipient && validProof.to !== solanaFeeRecipient) {
      return NextResponse.json({ error: 'Recipient mismatch' }, { status: 400 });
    }

    // Verify via Daydreams facilitator (pass-through payload)
    const verifyRes = await fetchWithRetry(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(verifyPayload),
    });

    if (!verifyRes.ok) {
      const text = await verifyRes.text().catch(() => '');
      return NextResponse.json({ error: 'Verification failed', details: text }, { status: 400 });
    }

    const verifyJson: any = await verifyRes.json().catch(() => ({}));

    // Settle via Daydreams facilitator (pass-through)
    const settleRes = await fetchWithRetry(`${facilitatorUrl}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(settlePayload),
    });

    if (!settleRes.ok) {
      const text = await settleRes.text().catch(() => '');
      return NextResponse.json({ error: 'Settlement failed', details: text }, { status: 400 });
    }

    const settleJson: any = await settleRes.json().catch(() => ({}));

    const tokenSymbol: string = validProof.tokenSymbol || 'USDC';
    const tokenString: string = validProof.token || tokenSymbol;
    const amount: string = String(validProof.amount);

    // Ensure service exists (Solana)
    let dbService = await prisma.service.findUnique({ where: { serviceId } });
    if (!dbService) {
      dbService = await prisma.service.create({
        data: {
          serviceId,
          name: serviceName,
          description: `Paid service: ${serviceName}`,
          category: 'Other',
          merchant: String(validProof.to),
          network: 'solana',
          chainId: 0,
          token: tokenString,
          tokenSymbol: tokenSymbol,
          price: amount,
          priceDisplay: formatUSDC(amount),
          available: true,
          facilitatorUrl: facilitatorUrl,
          source: 'daydreams',
        },
      });
    }

    const feePct = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5');
    const { feeAmount, merchantAmount } = calculateFees(amount, isFinite(feePct) ? feePct : 5);

    const settlementHash = settleJson.settlementHash || settleJson.transactionHash || settleJson.hash || null;

    await prisma.transaction.create({
      data: {
        serviceId: dbService.id,
        transactionHash: String(validProof.signature || (validProof as any).transactionHash || 'unknown'),
        settlementHash: settlementHash,
        blockNumber: null,
        from: String(validProof.from || '').toString(),
        to: String(validProof.to || '').toString(),
        amount: amount,
        token: tokenString,
        chainId: 0,
        feeAmount,
        merchantAmount,
        status: 'settled',
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        settledAt: new Date(),
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true, verify: verifyJson, settle: settleJson });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
