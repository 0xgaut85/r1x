import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/anthropic';
import { ChatRequest } from '@/lib/types/chat';
import { parsePaymentProof, verifyPaymentWithFacilitator, calculateFeeDistribution, create402Response, createPaymentSuccessResponse } from '@/lib/x402';
import { MerchantFeeConfig } from '@/lib/types/x402';
import { prisma } from '@/lib/db';

const R1X_AGENT_SERVICE_ID = 'r1x-agent-chat';
const MESSAGE_PRICE_USDC = '0.01'; // 0.01 USDC per message
const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS || '';
const FEE_CONFIG: MerchantFeeConfig = {
  feePercentage: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5'), // 5% default
  feeRecipient: process.env.FEE_RECIPIENT_ADDRESS || '',
  network: 'base',
};

/**
 * Chat API endpoint for r1x Agent with x402 payment integration
 * 
 * Charges 0.01 USDC per message using x402 protocol
 * Requires payment proof via X-PAYMENT header for each message
 */

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }
    
    // Validate messages format
    for (const msg of body.messages) {
      if (!msg.role || !msg.content) {
        return NextResponse.json(
          { error: 'Invalid message format: role and content are required' },
          { status: 400 }
        );
      }
    }

    // Check for payment proof (x402 protocol)
    const xPaymentHeader = request.headers.get('X-PAYMENT');
    
    // Get or create r1x-agent service
    let service = await prisma.service.findUnique({
      where: { serviceId: R1X_AGENT_SERVICE_ID },
    });

    if (!service) {
      // Create the service if it doesn't exist
      service = await prisma.service.create({
        data: {
          serviceId: R1X_AGENT_SERVICE_ID,
          name: 'r1x Agent Chat',
          description: 'AI agent chat service - 0.01 USDC per message',
          category: 'AI Inference',
          merchant: MERCHANT_ADDRESS,
          network: 'base',
          chainId: 8453,
          token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
          tokenSymbol: 'USDC',
          price: (parseFloat(MESSAGE_PRICE_USDC) * 1e6).toString(), // Convert to wei (6 decimals)
          priceDisplay: MESSAGE_PRICE_USDC,
          available: true,
        },
      });
    }

    // If payment proof is provided, verify and process
    if (xPaymentHeader || body.proof) {
      const paymentProof = parsePaymentProof(body, xPaymentHeader);
      
      if (!paymentProof) {
        return NextResponse.json(
          { error: 'Invalid payment proof format' },
          { status: 400 }
        );
      }

      // Verify payment with facilitator
      const verification = await verifyPaymentWithFacilitator(paymentProof, service.merchant);
      
      if (!verification.verified) {
        return NextResponse.json(
          { error: 'Payment verification failed', reason: verification.reason },
          { status: 402 }
        );
      }

      // Calculate fee distribution
      const { fee, merchantAmount } = calculateFeeDistribution(paymentProof.amount, FEE_CONFIG);

      // Store transaction
      await prisma.transaction.upsert({
        where: { transactionHash: paymentProof.transactionHash },
        update: {
          status: 'verified',
          verificationStatus: 'verified',
          verifiedAt: new Date(),
          feeAmount: fee,
          merchantAmount,
        },
        create: {
          serviceId: service.id,
          transactionHash: paymentProof.transactionHash,
          blockNumber: paymentProof.blockNumber,
          from: paymentProof.from,
          to: service.merchant,
          amount: paymentProof.amount,
          token: paymentProof.token,
          chainId: 8453,
          feeAmount: fee,
          merchantAmount,
          status: 'verified',
          verificationStatus: 'verified',
          verifiedAt: new Date(),
        },
      });

      // Create fee record
      await prisma.fee.create({
        data: {
          transactionId: (await prisma.transaction.findUnique({
            where: { transactionHash: paymentProof.transactionHash },
          }))!.id,
          feeAmount: fee,
          feeRecipient: FEE_CONFIG.feeRecipient,
        },
      });

      // Payment verified, process chat request
      const response = await getChatResponse(body.messages);
      
      return createPaymentSuccessResponse(paymentProof.transactionHash, {
        message: response,
        serviceId: R1X_AGENT_SERVICE_ID,
      });
    }

    // No payment proof, return 402 with quote
    const { generatePaymentQuote } = await import('@/lib/x402');
    const quote = generatePaymentQuote(MESSAGE_PRICE_USDC, service.merchant, FEE_CONFIG);
    
    return create402Response(quote, {
      serviceId: R1X_AGENT_SERVICE_ID,
      message: 'Payment required: 0.01 USDC per message',
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    if (error.message?.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'API key not configured. Please set ANTHROPIC_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

