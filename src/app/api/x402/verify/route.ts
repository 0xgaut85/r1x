/**
 * x402 Payment Verification Endpoint
 * 
 * Dedicated endpoint for verifying payment proofs
 */

import { NextRequest, NextResponse } from 'next/server';
import { parsePaymentProof, verifyPaymentWithFacilitator, settlePaymentWithFacilitator, calculateFeeDistribution } from '@/lib/x402';
import { MerchantFeeConfig } from '@/lib/types/x402';

const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS || '';
const FEE_CONFIG: MerchantFeeConfig = {
  feePercentage: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5'),
  feeRecipient: process.env.FEE_RECIPIENT_ADDRESS || '',
  network: 'base',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proof, settle } = body;

    // Also check X-PAYMENT header
    const xPaymentHeader = request.headers.get('X-PAYMENT');
    
    if (!proof && !xPaymentHeader) {
      return NextResponse.json(
        { error: 'Payment proof is required' },
        { status: 400 }
      );
    }

    const paymentProof = parsePaymentProof({ proof }, xPaymentHeader);
    
    if (!paymentProof) {
      return NextResponse.json(
        { error: 'Invalid payment proof format' },
        { status: 400 }
      );
    }

    // Verify payment with retry logic
    let verification = await verifyPaymentWithFacilitator(paymentProof, MERCHANT_ADDRESS);
    
    // Retry once if verification fails
    if (!verification.verified) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      verification = await verifyPaymentWithFacilitator(paymentProof, MERCHANT_ADDRESS);
    }
    
    if (!verification.verified) {
      return NextResponse.json(
        { 
          verified: false,
          error: 'Payment verification failed',
          reason: verification.reason 
        },
        { status: 402 }
      );
    }

    // If settle flag is set, also settle the payment
    if (settle) {
      const settlement = await settlePaymentWithFacilitator(paymentProof, MERCHANT_ADDRESS);
      
      // Retry settlement once if it fails
      if (!settlement.success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retrySettlement = await settlePaymentWithFacilitator(paymentProof, MERCHANT_ADDRESS);
        if (retrySettlement.success) {
          settlement.success = true;
          settlement.settlementHash = retrySettlement.settlementHash;
        }
      }
      
      if (!settlement.success) {
        return NextResponse.json(
          { 
            verified: true,
            settled: false,
            error: 'Settlement failed',
            reason: settlement.reason 
          },
          { status: 500 }
        );
      }

      const { fee, merchantAmount } = calculateFeeDistribution(paymentProof.amount, FEE_CONFIG);

      return NextResponse.json({
        verified: true,
        settled: true,
        payment: {
          transactionHash: paymentProof.transactionHash,
          settlementHash: settlement.settlementHash,
          amount: paymentProof.amount,
          fee,
          merchantAmount,
        },
      });
    }

    return NextResponse.json({
      verified: true,
      payment: {
        transactionHash: paymentProof.transactionHash,
        amount: paymentProof.amount,
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred verifying payment' },
      { status: 500 }
    );
  }
}

