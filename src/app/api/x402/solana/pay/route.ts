import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { X402PaymentHandler } from 'x402-solana/server';

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

    // Use PayAI facilitator (same as Express server)
    const facilitatorUrl = process.env.FACILITATOR_URL;
    const solanaFeeRecipient = process.env.SOLANA_FEE_RECIPIENT_ADDRESS;
    const solanaRpcUrl = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    const USDC_SOLANA_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC on Solana mainnet

    if (!facilitatorUrl || !solanaFeeRecipient) {
      return NextResponse.json({ 
        error: 'Solana payment handler not configured',
        details: 'FACILITATOR_URL or SOLANA_FEE_RECIPIENT_ADDRESS missing'
      }, { status: 500 });
    }

    // Initialize PayAI x402-solana payment handler (same as Express server)
    const x402Handler = new X402PaymentHandler({
      network: 'solana',
      treasuryAddress: solanaFeeRecipient,
      facilitatorUrl: facilitatorUrl,
      ...(solanaRpcUrl && solanaRpcUrl.startsWith('http') ? { rpcUrl: solanaRpcUrl } : {}),
    });

    const amountStr: string = String(validProof.amount);

    // Create payment requirements for verification (per x402-solana docs)
    const paymentRequirements = await x402Handler.createPaymentRequirements({
      price: {
        amount: amountStr, // Amount in micro-units (string)
        asset: {
          address: USDC_SOLANA_MINT,
          decimals: 6,
        },
      },
      network: 'solana',
      config: {
        description: 'Solana Service Payment',
        resource: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/x402/solana/pay`,
        mimeType: 'application/json',
      },
    });

    // Extract payment proof from X-Payment header format
    // x402-solana expects the payment header format from x402-fetch
    const paymentHeader = {
      signature: validProof.signature,
      from: validProof.from,
      to: validProof.to,
      amount: amountStr,
      token: validProof.token || USDC_SOLANA_MINT,
    };

    // Verify payment using PayAI facilitator via x402-solana package
    const verified = await x402Handler.verifyPayment(paymentHeader as any, paymentRequirements);
    
    const isValid = typeof verified === 'boolean' ? verified : (verified as any)?.isValid ?? false;
    if (!isValid) {
      const reason = typeof verified === 'object' && verified !== null 
        ? (verified as any).invalidReason || 'Verification failed'
        : 'Verification failed';
      return NextResponse.json({ 
        error: 'Payment verification failed', 
        details: reason 
      }, { status: 400 });
    }

    // Settle payment using PayAI facilitator via x402-solana package
    const settleResult = await x402Handler.settlePayment(paymentHeader as any, paymentRequirements);
    
    if (settleResult && typeof settleResult === 'object' && 'success' in settleResult && !settleResult.success) {
      return NextResponse.json({ 
        error: 'Payment settlement failed', 
        details: (settleResult as any).errorReason || 'Settlement failed'
      }, { status: 400 });
    }

    // Get settlement hash from settleResult if available
    const settlementHash = (settleResult && typeof settleResult === 'object' && 'transaction' in settleResult)
      ? (settleResult as any).transaction
      : validProof.signature;

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
          source: 'payai',
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
