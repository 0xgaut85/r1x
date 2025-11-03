/**
 * x402 Payment Verification Endpoint
 * 
 * Dedicated endpoint for verifying payment proofs
 */

import { NextRequest, NextResponse } from 'next/server';
import { parsePaymentProof, verifyPaymentWithFacilitator, settlePaymentWithFacilitator, calculateFeeDistribution } from '@/lib/x402';
import { MerchantFeeConfig } from '@/lib/types/x402';
import { prisma } from '@/lib/db';
import { transferFeeToRecipient } from '@/lib/fee-transfer';

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
    // Get merchant address from transaction if exists, otherwise use default
    let merchantAddress = MERCHANT_ADDRESS;
    let transaction = await prisma.transaction.findUnique({
      where: { transactionHash: paymentProof.transactionHash },
    });

    if (transaction) {
      const service = await prisma.service.findUnique({
        where: { id: transaction.serviceId },
      });
      merchantAddress = service?.merchant || MERCHANT_ADDRESS;
    }

    let verification = await verifyPaymentWithFacilitator(paymentProof, merchantAddress);
    
    // Retry once if verification fails
    if (!verification.verified) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      verification = await verifyPaymentWithFacilitator(paymentProof, merchantAddress);
    }
    
    if (!verification.verified) {
      // Update transaction status if exists
      if (transaction) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'failed',
            verificationStatus: 'failed',
          },
        });
      }

      return NextResponse.json(
        { 
          verified: false,
          error: 'Payment verification failed',
          reason: verification.reason 
        },
        { status: 402 }
      );
    }

    // Update or create transaction record for verified payment
    if (!transaction) {
      // Try to find service by merchant address or create a placeholder
      const service = await prisma.service.findFirst({
        where: { merchant: merchantAddress },
      });

      if (service) {
        // Calculate fee distribution
        const { fee, merchantAmount } = calculateFeeDistribution(paymentProof.amount, FEE_CONFIG);
        
        transaction = await prisma.transaction.create({
          data: {
            serviceId: service.id,
            transactionHash: paymentProof.transactionHash,
            blockNumber: paymentProof.blockNumber,
            from: paymentProof.from,
            to: merchantAddress,
            amount: paymentProof.amount,
            token: paymentProof.token,
            chainId: service.chainId, // Use chainId from service
            feeAmount: fee,
            merchantAmount,
            status: 'verified',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
          },
        });
      }
    } else {
      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'verified',
          verificationStatus: 'verified',
          verifiedAt: new Date(),
        },
      });
    }

    // If settle flag is set, also settle the payment
    if (settle) {
      const settlement = await settlePaymentWithFacilitator(paymentProof, merchantAddress);
      
      // Retry settlement once if it fails
      if (!settlement.success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retrySettlement = await settlePaymentWithFacilitator(paymentProof, merchantAddress);
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

      // Update transaction record if exists
      if (transaction) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'settled',
            settlementHash: settlement.settlementHash,
            settledAt: new Date(),
            feeAmount: fee,
            merchantAmount,
          },
        });

        // Create fee record if not exists
        const existingFee = await prisma.fee.findFirst({
          where: {
            transactionId: transaction.id,
          },
        });

        if (!existingFee) {
          await prisma.fee.create({
            data: {
              transactionId: transaction.id,
              feeAmount: fee,
              feeRecipient: FEE_CONFIG.feeRecipient,
            },
          });
        }

        // Transfer fee if not already transferred
        const feeRecord = await prisma.fee.findFirst({
          where: {
            transactionId: transaction.id,
            transferred: false,
          },
        });

        if (feeRecord) {
          await transferFeeToRecipient(paymentProof, fee, FEE_CONFIG.feeRecipient);
        }
      }

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

