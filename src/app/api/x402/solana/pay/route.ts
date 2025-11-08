import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { Connection } from '@solana/web3.js';

export const dynamic = 'force-dynamic';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

/**
 * Verify Solana transaction exists on-chain
 * This is the correct method - Solana transactions are verified on-chain
 */
async function verifySolanaTransaction(signature: string): Promise<{ verified: boolean; error?: string }> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const txStatus = await connection.getSignatureStatus(signature);
    
    if (!txStatus || !txStatus.value) {
      return { verified: false, error: 'Transaction not found' };
    }
    
    if (txStatus.value.err) {
      return { verified: false, error: `Transaction failed: ${JSON.stringify(txStatus.value.err)}` };
    }
    
    return { verified: true };
  } catch (error: any) {
    return { verified: false, error: error.message || 'Verification error' };
  }
}

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

    // Verify transaction on-chain (correct method for Solana)
    // Solana transactions are settled immediately when sent, so we verify on-chain
    const verifyResult = await verifySolanaTransaction(validProof.signature);
    
    if (!verifyResult.verified) {
      return NextResponse.json({ 
        error: 'Payment verification failed', 
        details: verifyResult.error 
      }, { status: 400 });
    }

    // Transaction verified on-chain - no separate settlement needed for Solana
    const settlementHash = validProof.signature; // Solana signature is the settlement hash

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
