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

    // Initialize PayAI x402-solana payment handler (same as Express server)
    const x402Handler = new X402PaymentHandler({
      network: 'solana',
      treasuryAddress: solanaFeeRecipient,
      facilitatorUrl: facilitatorUrl,
      ...(solanaRpcUrl && solanaRpcUrl.startsWith('http') ? { rpcUrl: solanaRpcUrl } : {}),
    });

    // Create payment requirements for verification (per x402-solana docs)
    const paymentRequirements = await x402Handler.createPaymentRequirements({
      price: {
        amount: amountAtomic, // Amount in micro-units (string)
        asset: {
          address: USDC_SOLANA_MINT,
          decimals: 6,
        },
      },
      network: 'solana',
      config: {
        description: 'Platform Fee (Solana)',
        resource: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/x402/solana/fee`,
        mimeType: 'application/json',
      },
    });

    // Extract payment proof from X-Payment header format
    const paymentHeader = {
      signature: proofParsed.data.signature,
      from: proofParsed.data.from,
      to: proofParsed.data.to,
      amount: amountAtomic,
      token: proofParsed.data.token || USDC_SOLANA_MINT,
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
      : proofParsed.data.signature;

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
          source: 'payai',
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
