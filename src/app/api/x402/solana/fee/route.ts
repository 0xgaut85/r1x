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

const ProofSchema = z.object({
  signature: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  amount: z.union([z.string().regex(/^\d+$/), z.number()]).transform(v => v.toString()),
  tokenSymbol: z.string().optional(),
  token: z.string().optional(),
});

const FeeAmountSchema = z.string().regex(/^\d+(\.\d{1,6})?$/);

export async function POST(request: NextRequest) {
  try {
    const { proof, feeAmount } = await request.json();

    if (!proof) {
      return NextResponse.json({ error: 'Missing required field: proof' }, { status: 400 });
    }

    const proofParsed = ProofSchema.safeParse(proof);
    if (!proofParsed.success) {
      return NextResponse.json({ error: 'Invalid proof', details: proofParsed.error.flatten() }, { status: 400 });
    }

    if (feeAmount && !FeeAmountSchema.safeParse(String(feeAmount)).success) {
      return NextResponse.json({ error: 'Invalid feeAmount format' }, { status: 400 });
    }

    const facilitatorUrl = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';
    const solanaFeeRecipient = process.env.SOLANA_FEE_RECIPIENT_ADDRESS;

    if (!solanaFeeRecipient) {
      return NextResponse.json({ error: 'SOLANA_FEE_RECIPIENT_ADDRESS is not configured' }, { status: 500 });
    }

    // Validate proof recipient matches our Solana fee recipient
    if ((proofParsed.data.to || '').toString() !== solanaFeeRecipient.toString()) {
      return NextResponse.json({ error: 'Recipient mismatch: fee must be paid to SOLANA_FEE_RECIPIENT_ADDRESS' }, { status: 400 });
    }

    // Calculate amount in atomic units (prefer explicit feeAmount provided by client; fallback to proof.amount)
    const amountAtomic: string = feeAmount
      ? (() => {
          try {
            const [whole, frac = ''] = String(feeAmount).split('.');
            const padded = (frac + '000000').slice(0, 6);
            return `${BigInt(whole) * BigInt(1_000_000) + BigInt(padded)}`;
          } catch {
            return String(proofParsed.data.amount);
          }
        })()
      : String(proofParsed.data.amount);

    // Verify payment with Daydreams facilitator (proper x402 protocol)
    const paymentProof: PaymentProof & { signature?: string } = {
      transactionHash: proofParsed.data.signature, // Use signature as transactionHash for Solana
      signature: proofParsed.data.signature,
      blockNumber: 0, // Solana doesn't use block numbers
      from: proofParsed.data.from,
      to: proofParsed.data.to,
      amount: amountAtomic,
      token: proofParsed.data.token || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      timestamp: Date.now(),
    };

    const verifyResult = await verifyPaymentWithDaydreams(paymentProof, solanaFeeRecipient);
    
    if (!verifyResult.verified) {
      return NextResponse.json({ 
        error: 'Payment verification failed', 
        details: verifyResult.reason 
      }, { status: 400 });
    }

    // Settle payment with Daydreams facilitator
    const settleResult = await settlePaymentWithDaydreams(paymentProof, solanaFeeRecipient);
    
    if (!settleResult.settled) {
      return NextResponse.json({ 
        error: 'Payment settlement failed', 
        details: settleResult.reason 
      }, { status: 400 });
    }

    const settlementHash = settleResult.settlementHash || proofParsed.data.signature;

    // Persist fee transaction (100% fee to platform)
    const tokenSymbol: string = proofParsed.data.tokenSymbol || 'USDC';
    const tokenString: string = proofParsed.data.token || tokenSymbol;

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

    await prisma.transaction.create({
      data: {
        serviceId: dbService.id,
        transactionHash: String(proofParsed.data.signature),
        settlementHash: settlementHash,
        blockNumber: null,
        from: String(proofParsed.data.from || '').toString(),
        to: String(proofParsed.data.to || '').toString(),
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
