import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

export async function POST(request: NextRequest) {
  try {
    const {
      serviceId,
      serviceName,
      proof, // { signature, from, to, amount, tokenSymbol }
      verifyPayload,
      settlePayload,
    } = await request.json();

    if (!serviceId || !serviceName || !proof || !verifyPayload || !settlePayload) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const facilitatorUrl = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';

    // 1) Verify via Daydreams facilitator (pass-through payload as provided by client)
    const verifyRes = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(verifyPayload),
    });

    if (!verifyRes.ok) {
      const text = await verifyRes.text().catch(() => '');
      return NextResponse.json({ error: 'Verification failed', details: text }, { status: 400 });
    }

    const verifyJson: any = await verifyRes.json().catch(() => ({}));

    // 2) Settle via Daydreams facilitator (pass-through)
    const settleRes = await fetch(`${facilitatorUrl}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(settlePayload),
    });

    if (!settleRes.ok) {
      const text = await settleRes.text().catch(() => '');
      return NextResponse.json({ error: 'Settlement failed', details: text }, { status: 400 });
    }

    const settleJson: any = await settleRes.json().catch(() => ({}));

    // 3) Persist transaction (Solana)
    const tokenSymbol: string = proof.tokenSymbol || 'USDC';
    const tokenString: string = proof.token || tokenSymbol;
    const amount: string = String(proof.amount);

    // Ensure service exists (Solana)
    let dbService = await prisma.service.findUnique({ where: { serviceId } });
    if (!dbService) {
      dbService = await prisma.service.create({
        data: {
          serviceId,
          name: serviceName,
          description: `Paid service: ${serviceName}`,
          category: 'Other',
          merchant: String(proof.to),
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

    // Extract settlement tx hash if present
    const settlementHash = settleJson.settlementHash || settleJson.transactionHash || settleJson.hash || null;

    await prisma.transaction.create({
      data: {
        serviceId: dbService.id,
        transactionHash: String(proof.signature || proof.transactionHash || 'unknown'),
        settlementHash: settlementHash,
        blockNumber: null,
        from: String(proof.from || '').toString(),
        to: String(proof.to || '').toString(),
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
