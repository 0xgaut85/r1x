/**
 * x402 Merchant Payment Endpoint
 * 
 * Handles payment requests and returns HTTP 402 with payment quote
 * or processes payment proof and fulfills the request
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePaymentQuote, parsePaymentProof, verifyPaymentWithFacilitator, calculateFeeDistribution, create402Response, createPaymentSuccessResponse } from '@/lib/x402';
import { MerchantFeeConfig, PaymentProof } from '@/lib/types/x402';

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
    
    if (!serviceId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId and amount' },
        { status: 400 }
      );
    }

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
      const verification = await verifyPaymentWithFacilitator(paymentProof, MERCHANT_ADDRESS);
      
      if (!verification.verified) {
        return NextResponse.json(
          { error: 'Payment verification failed', reason: verification.reason },
          { status: 402 }
        );
      }

      // Calculate fee distribution
      const { fee, merchantAmount } = calculateFeeDistribution(paymentProof.amount, FEE_CONFIG);

      // Log transaction for admin dashboard
      await logTransaction({
        serviceId,
        paymentProof,
        fee,
        merchantAmount,
        status: 'verified',
      });

      // Transfer fee to fee recipient wallet
      await transferFeeToRecipient(paymentProof, fee);

      // Payment verified, fulfill the request
      const fulfillmentData = await fulfillServiceRequest(serviceId);
      
      return createPaymentSuccessResponse(paymentProof.transactionHash, fulfillmentData);
    }

    // No payment proof, return 402 with quote
    const quote = generatePaymentQuote(amount, MERCHANT_ADDRESS, FEE_CONFIG);
    
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
 * Log transaction for admin dashboard
 */
async function logTransaction(data: {
  serviceId: string;
  paymentProof: PaymentProof;
  fee: string;
  merchantAmount: string;
  status: string;
}) {
  // TODO: Implement database logging
  // For now, log to console
  console.log('[Transaction Log]', {
    timestamp: new Date().toISOString(),
    ...data,
  });
}

/**
 * Transfer fee to fee recipient wallet
 */
async function transferFeeToRecipient(proof: PaymentProof, fee: string) {
  // TODO: Implement on-chain fee transfer
  // This would use the wallet utilities to transfer USDC
  // For now, this is a placeholder
  console.log('[Fee Transfer]', {
    recipient: FEE_CONFIG.feeRecipient,
    amount: fee,
    transactionHash: proof.transactionHash,
  });
}

/**
 * Fulfill service request after payment verification
 */
async function fulfillServiceRequest(serviceId: string): Promise<any> {
  // Fetch service metadata
  const servicesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/marketplace/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId }),
  });

  if (!servicesResponse.ok) {
    throw new Error('Service not found');
  }

  const { service } = await servicesResponse.json();

  if (!service || !service.endpoint) {
    return {
      serviceId,
      fulfilled: true,
      timestamp: Date.now(),
      message: 'Service access granted',
    };
  }

  // Call the actual service endpoint
  try {
    const serviceResponse = await fetch(service.endpoint, {
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

