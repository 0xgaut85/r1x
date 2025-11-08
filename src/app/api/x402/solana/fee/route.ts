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

export async function POST(request: NextRequest) {
  try {
    const { proof, verifyPayload, settlePayload, feeAmount } = await request.json();

    if (!proof || !verifyPayload || !settlePayload) {
      return NextResponse.json({ error: 'Missing required fields: proof, verifyPayload, settlePayload' }, { status: 400 });
    }

    const facilitatorUrl = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';
    const solanaFeeRecipient = process.env.SOLANA_FEE_RECIPIENT_ADDRESS;

    if (!solanaFeeRecipient) {
      return NextResponse.json({ error: 'SOLANA_FEE_RECIPIENT_ADDRESS is not configured' }, { status: 500 });
    }

    // Validate proof recipient matches our Solana fee recipient
    if ((proof.to || '').toString() !== solanaFeeRecipient.toString()) {
      return NextResponse.json({ error: 'Recipient mismatch: fee must be paid to SOLANA_FEE_RECIPIENT_ADDRESS' }, { status: 400 });
    }

    // Verify via Daydreams
    const verifyRes = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(verifyPayload),
    });

    if (!verifyRes.ok) {
      const t = await verifyRes.text().catch(() => '');
      return NextResponse.json({ error: 'Verification failed', details: t }, { status: 400 });
    }

    const verifyJson: any = await verifyRes.json().catch(() => ({}));

    // Settle via Daydreams
    const settleRes = await fetch(`${facilitatorUrl}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(settlePayload),
    });

    if (!settleRes.ok) {
      const t = await settleRes.text().catch(() => '');
      return NextResponse.json({ error: 'Settlement failed', details: t }, { status: 400 });
    }

    const settleJson: any = await settleRes.json().catch(() => ({}));

    // Persist fee transaction (100% fee to platform)
    const tokenSymbol: string = proof.tokenSymbol || 'USDC';
    const tokenString: string = proof.token || tokenSymbol;
    // Prefer explicit feeAmount provided by client; fallback to proof.amount
    const amountAtomic: string = feeAmount
      ? (() => {
          // feeAmount is expected as decimal (e.g., '0.25'), convert to 6-decimals atomic
          try {
            const [whole, frac = ''] = String(feeAmount).split('.');
            const padded = (frac + '000000').slice(0, 6);
            return `${BigInt(whole) * BigInt(1_000_000) + BigInt(padded)}`;
          } catch {
            return String(proof.amount);
          }
        })()
      : String(proof.amount);

    // Ensure service exists (platform-fee)
    let dbService = await prisma.service.findUnique({ where: { serviceId: 'platform-fee-solana' } });
    if (!dbService) {
      dbService = await prisma.service.create({
        data: {
          serviceId: 'platform-fee-solana',
          name: 'Platform Fee (Solana)',
          description: 'Fee collected by r1x on Solana',
          category: 'Platform',
          merchant: solanaFeeRecipient,
          network: 'solana',
          chainId: 0,
          token: tokenString,
          tokenSymbol: tokenSymbol,
          price: amountAtomic,
          priceDisplay: formatUSDC(amountAtomic),
          available: true,
          facilitatorUrl: facilitatorUrl,
          source: 'daydreams',
        },
      });
    }

    const settlementHash = settleJson.settlementHash || settleJson.transactionHash || settleJson.hash || null;

    await prisma.transaction.create({
      data: {
        serviceId: dbService.id,
        transactionHash: String(proof.signature || proof.transactionHash || 'unknown'),
        settlementHash: settlementHash,
        blockNumber: null,
        from: String(proof.from || '').toString(),
        to: String(proof.to || '').toString(),
        amount: amountAtomic,
        token: tokenString,
        chainId: 0,
        feeAmount: amountAtomic,
        merchantAmount: '0',
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
