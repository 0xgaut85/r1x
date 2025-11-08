/**
 * x402 Merchant Server Utilities
 * 
 * Handles HTTP 402 Payment Required responses, payment verification,
 * and PayAI facilitator integration
 */

import { PaymentQuote, PaymentProof, FacilitatorVerifyRequest, FacilitatorVerifyResponse, FacilitatorSettleRequest, FacilitatorSettleResponse, MerchantFeeConfig, PaymentStatus } from './types/x402';

const PAYAI_FACILITATOR_URL = process.env.FACILITATOR_URL; // Railway env only; no fallback
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

  if (!PAYAI_FACILITATOR_URL) {
    console.warn('FACILITATOR_URL not configured; cannot fetch facilitator address');
    return null;
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
  
  console.log('[Payment] Generating quote:', {
    amount,
    amountWei,
    totalAmount,
    merchantAddress,
    facilitatorAddress,
    hasFacilitator: !!facilitatorAddress,
  });
  
  if (!facilitatorAddress) {
    console.warn('[Payment] No facilitator address found - payments will go directly to merchant');
  }
  
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
  if (!PAYAI_FACILITATOR_URL) {
    console.error('[PayAI] FACILITATOR_URL not configured in environment (Railway).');
    return {
      verified: false,
      reason: 'FACILITATOR_URL not configured',
    };
  }
  // Validate that payer and merchant are different
  if (proof.from.toLowerCase() === merchantAddress.toLowerCase()) {
    console.error('[PayAI] Invalid payment: payer and merchant are the same address');
    return {
      verified: false,
      reason: 'Invalid payment: payer and merchant addresses cannot be the same',
    };
  }

  // PayAI facilitator verification request format
  // Based on x402 spec and PayAI facilitator API documentation
  // For Base network, PayAI expects transaction verification format
  const verifyRequest: FacilitatorVerifyRequest = {
    transactionHash: proof.transactionHash,
    chainId: BASE_CHAIN_ID,
    token: proof.token.toLowerCase(), // Ensure lowercase for consistency
    amount: proof.amount,
    merchant: merchantAddress.toLowerCase(), // Ensure lowercase
    payer: proof.from.toLowerCase(), // Ensure lowercase - must be different from merchant
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
    
    // Validate transaction recipient
    // If facilitator is used, 'to' should be facilitator address
    // If not, 'to' should be merchant address
    const expectedRecipient = proof.to.toLowerCase();
    const merchantLower = merchantAddress.toLowerCase();
    
    console.log('[PayAI] Transaction recipient check:', {
      actualTo: expectedRecipient,
      merchant: merchantLower,
      facilitatorExpected: !!process.env.PAYAI_FACILITATOR_ADDRESS,
    });
    
    // For Base mainnet, PayAI facilitator requires CDP API keys for authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Add CDP API key authentication if available (required for Base mainnet)
    const cdpApiKeyId = process.env.CDP_API_KEY_ID;
    const cdpApiKeySecret = process.env.CDP_API_KEY_SECRET;
    
    if (cdpApiKeyId && cdpApiKeySecret) {
      // PayAI facilitator authentication using CDP API keys
      const auth = Buffer.from(`${cdpApiKeyId}:${cdpApiKeySecret}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
      console.log('[PayAI] Using CDP API key authentication');
    } else {
      console.warn('[PayAI] No CDP API keys found - verification may fail for Base mainnet');
    }
    
    const response = await fetch(`${PAYAI_FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers,
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
  if (!PAYAI_FACILITATOR_URL) {
    console.error('[PayAI] FACILITATOR_URL not configured in environment (Railway).');
    return {
      success: false,
      reason: 'FACILITATOR_URL not configured',
    };
  }
  const settleRequest: FacilitatorSettleRequest = {
    transactionHash: proof.transactionHash,
    chainId: BASE_CHAIN_ID,
    token: proof.token.toLowerCase(),
    amount: proof.amount,
    merchant: merchantAddress.toLowerCase(),
    payer: proof.from.toLowerCase(),
  };

  try {
    console.log('[PayAI] Settle request:', JSON.stringify(settleRequest, null, 2));
    
    // For Base mainnet, PayAI facilitator requires CDP API keys for authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Add CDP API key authentication if available (required for Base mainnet)
    const cdpApiKeyId = process.env.CDP_API_KEY_ID;
    const cdpApiKeySecret = process.env.CDP_API_KEY_SECRET;
    
    if (cdpApiKeyId && cdpApiKeySecret) {
      const auth = Buffer.from(`${cdpApiKeyId}:${cdpApiKeySecret}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
      console.log('[PayAI] Using CDP API key authentication for settlement');
    } else {
      console.warn('[PayAI] No CDP API keys found - settlement may fail for Base mainnet');
    }
    
    const response = await fetch(`${PAYAI_FACILITATOR_URL}/settle`, {
      method: 'POST',
      headers,
      body: JSON.stringify(settleRequest),
    });

    const responseText = await response.text();
    console.log('[PayAI] Settle response status:', response.status);
    console.log('[PayAI] Settle response headers:', Object.fromEntries(response.headers.entries()));
    console.log('[PayAI] Settle response body:', responseText);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { reason: responseText || `HTTP ${response.status}` };
      }
      
      console.error('[PayAI] Settlement failed:', {
        status: response.status,
        error: errorData,
        request: settleRequest,
      });
      return {
        success: false,
        reason: errorData.reason || errorData.error || errorData.message || `HTTP ${response.status}: ${responseText}`,
      };
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      if (response.status === 200) {
        data = { success: true };
      } else {
        throw new Error('Invalid JSON response');
      }
    }
    
    console.log('[PayAI] Settlement successful:', data);
    return data;
  } catch (error: any) {
    console.error('[PayAI] Settlement error:', error);
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
 * Compatible with PayAI facilitator format
 */
export function create402Response(quote: PaymentQuote, body?: any): Response {
  // PayAI x402 format: amount in human-readable format (USDC with $ prefix)
  const amountInUSDC = (parseFloat(quote.amount) / 1e6).toFixed(6);
  
  const responseBody = {
    error: 'Payment Required',
    payment: {
      // PayAI format: amount as string in human-readable format
      amount: `$${amountInUSDC}`,
      // Also include raw amount for compatibility
      amountRaw: quote.amount,
      token: quote.token,
      merchant: quote.merchant,
      facilitator: quote.facilitator, // Include facilitator if available
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

