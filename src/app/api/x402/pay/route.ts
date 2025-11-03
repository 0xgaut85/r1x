/**
 * x402 Merchant Payment Endpoint
 * 
 * Handles payment requests and returns HTTP 402 with payment quote
 * or processes payment proof and fulfills the request
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePaymentQuote, parsePaymentProof, verifyPaymentWithFacilitator, calculateFeeDistribution, create402Response, createPaymentSuccessResponse } from '@/lib/x402';
import { MerchantFeeConfig, PaymentProof } from '@/lib/types/x402';
import { prisma } from '@/lib/db';
import { transferFeeToRecipient } from '@/lib/fee-transfer';

// Merchant configuration
const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS || '';
const FEE_CONFIG: MerchantFeeConfig = {
  feePercentage: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5'), // 5% default
  feeRecipient: process.env.FEE_RECIPIENT_ADDRESS || '', // r1x wallet address
  network: 'base',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check for X-PAYMENT header (x402 spec)
    const xPaymentHeader = request.headers.get('X-PAYMENT');
    
    // Extract service identifier and amount from request
    const { serviceId, amount } = body;
    
    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing required field: serviceId' },
        { status: 400 }
      );
    }

    // Fetch service from database
    const service = await prisma.service.findUnique({
      where: { serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    if (!service.available) {
      return NextResponse.json(
        { error: 'Service is not available' },
        { status: 403 }
      );
    }

    const requestedAmount = amount || service.price;
    const merchantAddress = service.merchant || MERCHANT_ADDRESS;

    // If payment proof is provided (via header or body), verify and process
    if (xPaymentHeader || body.proof) {
      const paymentProof = parsePaymentProof(body, xPaymentHeader);
      
      if (!paymentProof) {
        return NextResponse.json(
          { error: 'Invalid payment proof format' },
          { status: 400 }
        );
      }

      // Verify payment with facilitator
      const verification = await verifyPaymentWithFacilitator(paymentProof, merchantAddress);
      
      if (!verification.verified) {
        // Log failed verification
        await prisma.transaction.updateMany({
          where: { transactionHash: paymentProof.transactionHash },
          data: {
            status: 'failed',
            verificationStatus: 'failed',
          },
        });

        return NextResponse.json(
          { error: 'Payment verification failed', reason: verification.reason },
          { status: 402 }
        );
      }

      // Calculate fee distribution
      const { fee, merchantAmount } = calculateFeeDistribution(paymentProof.amount, FEE_CONFIG);

      // Find or create transaction record
      let transaction = await prisma.transaction.findUnique({
        where: { transactionHash: paymentProof.transactionHash },
      });

      if (!transaction) {
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
            quoteNonce: body.quote?.nonce,
            quoteDeadline: body.quote?.deadline,
            feeAmount: fee,
            merchantAmount,
            status: 'verified',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
          },
        });
      } else {
        transaction = await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'verified',
            verificationStatus: 'verified',
            verifiedAt: new Date(),
            feeAmount: fee,
            merchantAmount,
          },
        });
      }

      // Create fee record
      await prisma.fee.create({
        data: {
          transactionId: transaction.id,
          feeAmount: fee,
          feeRecipient: FEE_CONFIG.feeRecipient,
        },
      });

      // Transfer fee to fee recipient wallet (on-chain)
      await transferFeeToRecipient(paymentProof, fee, FEE_CONFIG.feeRecipient);

      // Payment verified, fulfill the request
      const fulfillmentData = await fulfillServiceRequest(serviceId);
      
      return createPaymentSuccessResponse(paymentProof.transactionHash, fulfillmentData);
    }

    // No payment proof, return 402 with quote
    const quote = await generatePaymentQuote(requestedAmount, merchantAddress, FEE_CONFIG);
    
    // Store quote in transaction record (pending status)
    const { fee: quoteFee, merchantAmount: quoteMerchantAmount } = calculateFeeDistribution(quote.amount, FEE_CONFIG);
    
    await prisma.transaction.create({
      data: {
        serviceId: service.id,
        transactionHash: `quote-${quote.nonce}`, // Temporary hash for quote
        from: '', // Will be filled when payment comes in
        to: merchantAddress,
        amount: quote.amount,
        token: quote.token,
        chainId: service.chainId,
        quoteNonce: quote.nonce,
        quoteDeadline: quote.deadline,
        feeAmount: quoteFee,
        merchantAmount: quoteMerchantAmount,
        status: 'pending',
      },
    });
    
    return create402Response(quote, { serviceId });
  } catch (error: any) {
    console.error('Merchant payment error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred processing payment' },
      { status: 500 }
    );
  }
}

/**
 * Fulfill service request after payment verification
 */
async function fulfillServiceRequest(serviceId: string): Promise<any> {
  // Fetch service from database
  const service = await prisma.service.findUnique({
    where: { serviceId },
  });

  if (!service) {
    throw new Error('Service not found');
  }

  if (!service.endpoint) {
    return {
      serviceId,
      fulfilled: true,
      timestamp: Date.now(),
      message: 'Service access granted',
    };
  }

  // Call the actual service endpoint
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const serviceResponse = await fetch(`${baseUrl}${service.endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Access': 'granted',
      },
    });

    if (serviceResponse.ok) {
      const serviceData = await serviceResponse.json();
      return {
        serviceId,
        fulfilled: true,
        timestamp: Date.now(),
        data: serviceData,
      };
    }
  } catch (error) {
    console.error('Service fulfillment error:', error);
  }

  return {
    serviceId,
    fulfilled: true,
    timestamp: Date.now(),
    message: 'Service access granted',
  };
}

