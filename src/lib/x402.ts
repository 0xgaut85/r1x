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
 * Get PayAI facilitator contract address for Base network
 * This should be fetched from PayAI facilitator API or configured via env var
 */
async function getPayAIFacilitatorAddress(): Promise<string | null> {
  // Try to get from environment variable first
  const envAddress = process.env.PAYAI_FACILITATOR_ADDRESS;
  if (envAddress) {
    return envAddress;
  }

  try {
    // Try to fetch from PayAI facilitator API
    const response = await fetch(`${PAYAI_FACILITATOR_URL}/config`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // PayAI might return facilitator address in different formats
      return data.facilitatorAddress || data.address || data.contract || null;
    }
  } catch (error) {
    console.warn('Could not fetch PayAI facilitator address:', error);
  }

  return null;
}

/**
 * Generate a payment quote for a request
 * With PayAI facilitator, payments may need to go through facilitator contract
 */
export async function generatePaymentQuote(
  amount: string, // Amount in USDC (human-readable, e.g., "1.5")
  merchantAddress: string,
  feeConfig: MerchantFeeConfig
): Promise<PaymentQuote> {
  const amountWei = parseFloat(amount) * 1e6; // USDC has 6 decimals
  
  // Calculate total amount including fee
  const feeAmount = (amountWei * feeConfig.feePercentage) / 100;
  const totalAmount = amountWei + feeAmount;
  
  // Try to get PayAI facilitator address (for payments through facilitator)
  const facilitatorAddress = await getPayAIFacilitatorAddress();
  
  return {
    amount: totalAmount.toString(),
    token: USDC_BASE_ADDRESS,
    merchant: merchantAddress,
    facilitator: facilitatorAddress || undefined,
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
  // PayAI facilitator verification request format
  // Based on x402 spec and PayAI facilitator API documentation
  const verifyRequest: FacilitatorVerifyRequest = {
    transactionHash: proof.transactionHash,
    chainId: BASE_CHAIN_ID,
    token: proof.token.toLowerCase(), // Ensure lowercase for consistency
    amount: proof.amount,
    merchant: merchantAddress.toLowerCase(), // Ensure lowercase
    payer: proof.from.toLowerCase(), // Ensure lowercase
  };

  try {
    console.log('[PayAI] Verify request:', JSON.stringify(verifyRequest, null, 2));
    console.log('[PayAI] Proof details:', {
      transactionHash: proof.transactionHash,
      blockNumber: proof.blockNumber,
      from: proof.from,
      to: proof.to,
      amount: proof.amount,
      token: proof.token,
    });
    
    const response = await fetch(`${PAYAI_FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(verifyRequest),
    });

    const responseText = await response.text();
    console.log('[PayAI] Verify response status:', response.status);
    console.log('[PayAI] Verify response headers:', Object.fromEntries(response.headers.entries()));
    console.log('[PayAI] Verify response body:', responseText);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { reason: responseText || `HTTP ${response.status}` };
      }
      
      console.error('[PayAI] Verification failed:', {
        status: response.status,
        error: errorData,
        request: verifyRequest,
      });
      
      return {
        verified: false,
        reason: errorData.reason || errorData.error || errorData.message || errorData.details || `HTTP ${response.status}: ${responseText}`,
      };
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      // If response is not JSON, treat as success if status is 200
      if (response.status === 200) {
        data = { verified: true };
      } else {
        throw new Error('Invalid JSON response');
      }
    }
    
    console.log('[PayAI] Verification successful:', data);
    
    // PayAI might return different response formats
    // Handle both { verified: true } and { success: true } formats
    if (data.verified === true || data.success === true || data.status === 'verified') {
      return {
        verified: true,
        settlement: data.settlement || data.settlementHash ? {
          transactionHash: data.settlementHash || data.settlement?.transactionHash,
          blockNumber: data.settlement?.blockNumber || data.blockNumber,
        } : undefined,
      };
    }
    
    return {
      verified: false,
      reason: data.reason || data.error || 'Verification returned false',
    };
  } catch (error: any) {
    console.error('[PayAI] Verification error:', error);
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
    console.log('PayAI settle request:', JSON.stringify(settleRequest, null, 2));
    
    const response = await fetch(`${PAYAI_FACILITATOR_URL}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(settleRequest),
    });

    const responseText = await response.text();
    console.log('PayAI settle response status:', response.status);
    console.log('PayAI settle response body:', responseText);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { reason: responseText || `HTTP ${response.status}` };
      }
      
      console.error('PayAI settlement failed:', errorData);
      return {
        success: false,
        reason: errorData.reason || errorData.error || errorData.message || `HTTP ${response.status}: ${responseText}`,
      };
    }

    const data = JSON.parse(responseText);
    console.log('PayAI settlement successful:', data);
    return data;
  } catch (error: any) {
    console.error('PayAI settlement error:', error);
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

