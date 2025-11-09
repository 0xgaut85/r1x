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

    // Extract payment from X-Payment header first (per x402-solana docs)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    
    let paymentHeader = x402Handler.extractPayment(headers);
    
    // If not in header, check body (for backward compatibility with custom clients)
    if (!paymentHeader && proof) {
      const parsed = ProofSchema.safeParse(proof);
      if (parsed.success) {
        const validProof = parsed.data;
        const amountStr: string = String(validProof.amount);
        
        // Construct payment header from body proof (x402-solana format)
        // Note: This is a fallback - proper x402 clients send X-Payment header
        paymentHeader = {
          signature: validProof.signature,
          from: validProof.from,
          to: validProof.to,
          amount: amountStr,
          token: validProof.token || USDC_SOLANA_MINT,
        } as any;
      } else {
        return NextResponse.json({ error: 'Invalid proof', details: parsed.error.flatten() }, { status: 400 });
      }
    }

    if (!paymentHeader) {
      return NextResponse.json({ error: 'Missing payment proof' }, { status: 400 });
    }

    // Get amount from payment header or body
    const amountStr: string = (() => {
      if (paymentHeader && typeof paymentHeader === 'object' && 'amount' in paymentHeader) {
        return String((paymentHeader as any).amount);
      }
      if (proof && typeof proof === 'object' && 'amount' in proof) {
        return String((proof as any).amount);
      }
      return '0';
    })();

    // Create payment requirements for verification (per x402-solana docs)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resourceUrl = baseUrl.startsWith('http') ? `${baseUrl}/api/x402/solana/pay` : `http://${baseUrl}/api/x402/solana/pay`;
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
        resource: resourceUrl as any,
        mimeType: 'application/json',
      },
    });

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
      : (paymentHeader && typeof paymentHeader === 'object' && 'signature' in paymentHeader 
          ? (paymentHeader as any).signature 
          : null);

    // Extract payment details for database
    const paymentDetails = (paymentHeader && typeof paymentHeader === 'object') ? paymentHeader as any : null;
    const proofObj = proof && typeof proof === 'object' ? proof as any : null;
    const signature = paymentDetails?.signature || proofObj?.signature || null;
    const from = paymentDetails?.from || proofObj?.from || null;
    const to = paymentDetails?.to || proofObj?.to || solanaFeeRecipient;
    const tokenSymbol: string = proofObj?.tokenSymbol || 'USDC';
    const tokenString: string = paymentDetails?.token || proofObj?.token || USDC_SOLANA_MINT;

    if (!serviceId || !serviceName) {
      return NextResponse.json({ error: 'Missing required fields: serviceId and serviceName' }, { status: 400 });
    }

    // Ensure service exists (Solana)
    let dbService = await prisma.service.findUnique({ where: { serviceId } });
    if (!dbService) {
      dbService = await prisma.service.create({
        data: {
          serviceId,
          name: serviceName,
          description: `Paid service: ${serviceName}`,
          category: 'Other',
          merchant: String(to),
          network: 'solana',
          chainId: 0,
          token: tokenString,
          tokenSymbol: tokenSymbol,
          price: amountStr,
          priceDisplay: formatUSDC(amountStr),
          available: true,
          facilitatorUrl: facilitatorUrl,
          source: 'payai',
        },
      });
    }

    const feePct = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5');
    const { feeAmount, merchantAmount } = calculateFees(amountStr, isFinite(feePct) ? feePct : 5);

    await prisma.transaction.create({
      data: {
        serviceId: dbService.id,
        transactionHash: String(signature || settlementHash),
        settlementHash: settlementHash || signature,
        blockNumber: null,
        from: String(from || ''),
        to: String(to),
        amount: amountStr,
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
      settlementHash: settlementHash || signature,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
