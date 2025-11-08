import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { verifyPaymentWithDaydreams, settlePaymentWithDaydreams } from '@/lib/daydreams-facilitator';
import { PaymentProof } from '@/lib/types/x402';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, serviceName, proof } = body;

    if (!serviceId || !serviceName || !proof) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsed = ProofSchema.safeParse(proof);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid proof', details: parsed.error.flatten() }, { status: 400 });
    }
    const validProof = parsed.data;

    const facilitatorUrl = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';
    const amountStr: string = String(validProof.amount);

    // Verify payment with Daydreams facilitator (proper x402 protocol)
    const paymentProof: PaymentProof & { signature?: string } = {
      transactionHash: validProof.signature, // Use signature as transactionHash for Solana
      signature: validProof.signature,
      blockNumber: 0, // Solana doesn't use block numbers
      from: validProof.from,
      to: validProof.to,
      amount: amountStr,
      token: validProof.token || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      timestamp: Date.now(),
    };

    const verifyResult = await verifyPaymentWithDaydreams(paymentProof, validProof.to);
    
    if (!verifyResult.verified) {
      return NextResponse.json({ 
        error: 'Payment verification failed', 
        details: verifyResult.reason 
      }, { status: 400 });
    }

    // Settle payment with Daydreams facilitator
    const settleResult = await settlePaymentWithDaydreams(paymentProof, validProof.to);
    
    if (!settleResult.settled) {
      return NextResponse.json({ 
        error: 'Payment settlement failed', 
        details: settleResult.reason 
      }, { status: 400 });
    }

    const settlementHash = settleResult.settlementHash || validProof.signature;

    const tokenSymbol: string = validProof.tokenSymbol || 'USDC';
    const tokenString: string = validProof.token || tokenSymbol;
    const amount: string = amountStr;

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

    await prisma.transaction.create({
      data: {
        serviceId: dbService.id,
        transactionHash: String(validProof.signature),
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

    return NextResponse.json({ 
      success: true, 
      verified: true,
      settled: true,
      settlementHash,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
