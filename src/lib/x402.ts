/**
 * x402 Merchant Server Utilities
 * 
 * Handles HTTP 402 Payment Required responses, payment verification,
 * and PayAI facilitator integration
 */

import { PaymentQuote, PaymentProof, FacilitatorVerifyRequest, FacilitatorVerifyResponse, FacilitatorSettleRequest, FacilitatorSettleResponse, MerchantFeeConfig, PaymentStatus } from './types/x402';

const PAYAI_FACILITATOR_URL = 'https://facilitator.payai.network';
const BASE_CHAIN_ID = 8453;
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base

/**
 * Generate a payment quote for a request
 */
export function generatePaymentQuote(
  amount: string, // Amount in USDC (human-readable, e.g., "1.5")
  merchantAddress: string,
  feeConfig: MerchantFeeConfig
): PaymentQuote {
  const amountWei = parseFloat(amount) * 1e6; // USDC has 6 decimals
  
  // Calculate total amount including fee
  const feeAmount = (amountWei * feeConfig.feePercentage) / 100;
  const totalAmount = amountWei + feeAmount;
  
  return {
    amount: totalAmount.toString(),
    token: USDC_BASE_ADDRESS,
    merchant: merchantAddress,
    deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    nonce: generateNonce(),
    chainId: BASE_CHAIN_ID,
  };
}

/**
 * Generate a unique nonce for payment
 */
function generateNonce(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Verify payment with PayAI facilitator
 */
export async function verifyPaymentWithFacilitator(
  proof: PaymentProof,
  merchantAddress: string
): Promise<FacilitatorVerifyResponse> {
  const verifyRequest: FacilitatorVerifyRequest = {
    transactionHash: proof.transactionHash,
    chainId: BASE_CHAIN_ID,
    token: proof.token,
    amount: proof.amount,
    merchant: merchantAddress,
    payer: proof.from,
  };

  try {
    const response = await fetch(`${PAYAI_FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ reason: 'Unknown error' }));
      return {
        verified: false,
        reason: errorData.reason || `HTTP ${response.status}`,
      };
    }

    return await response.json();
  } catch (error: any) {
    return {
      verified: false,
      reason: error.message || 'Failed to verify payment',
    };
  }
}

/**
 * Settle payment with PayAI facilitator
 */
export async function settlePaymentWithFacilitator(
  proof: PaymentProof,
  merchantAddress: string
): Promise<FacilitatorSettleResponse> {
  const settleRequest: FacilitatorSettleRequest = {
    transactionHash: proof.transactionHash,
    chainId: BASE_CHAIN_ID,
    token: proof.token,
    amount: proof.amount,
    merchant: merchantAddress,
    payer: proof.from,
  };

  try {
    const response = await fetch(`${PAYAI_FACILITATOR_URL}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settleRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ reason: 'Unknown error' }));
      return {
        success: false,
        reason: errorData.reason || `HTTP ${response.status}`,
      };
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      reason: error.message || 'Failed to settle payment',
    };
  }
}

/**
 * Calculate fee and merchant amount
 */
export function calculateFeeDistribution(
  totalAmount: string,
  feeConfig: MerchantFeeConfig
): { fee: string; merchantAmount: string } {
  const amount = BigInt(totalAmount);
  const fee = (amount * BigInt(Math.floor(feeConfig.feePercentage * 100))) / BigInt(10000);
  const merchantAmount = amount - fee;

  return {
    fee: fee.toString(),
    merchantAmount: merchantAmount.toString(),
  };
}

/**
 * Parse payment proof from request body or X-PAYMENT header
 */
export function parsePaymentProof(body: any, xPaymentHeader?: string | null): PaymentProof | null {
  let proof: any = null;

  // Try X-PAYMENT header first (x402 spec)
  if (xPaymentHeader) {
    try {
      proof = JSON.parse(xPaymentHeader);
    } catch (e) {
      // Invalid JSON in header
      return null;
    }
  }

  // Fallback to body.proof
  if (!proof && body.proof) {
    proof = body.proof;
  }

  if (!proof || !proof.transactionHash || !proof.from || !proof.to || !proof.amount) {
    return null;
  }

  return {
    transactionHash: proof.transactionHash,
    blockNumber: proof.blockNumber || 0,
    from: proof.from,
    to: proof.to,
    amount: proof.amount,
    token: proof.token || USDC_BASE_ADDRESS,
    timestamp: proof.timestamp || Date.now(),
  };
}

/**
 * Create HTTP 402 Payment Required response (x402 spec format)
 */
export function create402Response(quote: PaymentQuote, body?: any): Response {
  const responseBody = {
    error: 'Payment Required',
    payment: {
      amount: quote.amount,
      token: quote.token,
      merchant: quote.merchant,
      deadline: quote.deadline,
      nonce: quote.nonce,
      chainId: quote.chainId,
    },
    message: 'This resource requires payment. Please approve the transaction in your wallet.',
    ...(body || {}),
  };

  return new Response(
    JSON.stringify(responseBody),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Required': 'true',
        'X-Payment-Quote': JSON.stringify(quote),
      },
    }
  );
}

/**
 * Create payment success response with X-PAYMENT-RESPONSE header
 */
export function createPaymentSuccessResponse(
  transactionHash: string,
  data: any
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      transactionHash,
      data,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Response': JSON.stringify({
          transactionHash,
          verified: true,
        }),
      },
    }
  );
}

