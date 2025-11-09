/**
 * Daydreams Facilitator Integration for Solana x402 Payments
 * 
 * Daydreams facilitator API: https://facilitator.daydreams.systems
 * Endpoints: /verify, /settle, /supported
 * 
 * Similar to PayAI but for Solana network
 */

import { PaymentProof } from './types/x402';

// Daydreams facilitator URL - Railway env var with official fallback
// Official Daydreams facilitator: https://facilitator.daydreams.systems/
const DAYDREAMS_FACILITATOR_URL = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';
const SOLANA_CHAIN_ID = 0; // Solana uses chainId 0
const USDC_SOLANA_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC on Solana

export interface DaydreamsVerifyRequest {
  signature: string; // Solana transaction signature (instead of transactionHash)
  chainId: number; // 0 for Solana
  token: string; // USDC mint address
  amount: string; // Amount in atomic units (6 decimals for USDC)
  merchant: string; // Merchant Solana address
  payer: string; // Payer Solana address
}

export interface DaydreamsVerifyResponse {
  verified: boolean;
  reason?: string;
  settlement?: {
    signature: string; // Settlement transaction signature
  };
}

export interface DaydreamsSettleRequest {
  signature: string; // Solana transaction signature
  chainId: number;
  token: string;
  amount: string;
  merchant: string;
  payer: string;
}

export interface DaydreamsSettleResponse {
  settled: boolean;
  reason?: string;
  settlementHash?: string;
}

/**
 * Verify Solana payment with Daydreams facilitator
 * 
 * For Solana, the proof uses 'signature' instead of 'transactionHash'
 */
export async function verifyPaymentWithDaydreams(
  proof: PaymentProof & { signature?: string }, // Solana proof includes signature
  merchantAddress: string
): Promise<DaydreamsVerifyResponse> {
  if (!DAYDREAMS_FACILITATOR_URL) {
    console.error('[Daydreams] DAYDREAMS_FACILITATOR_URL not set in Railway');
    return {
      verified: false,
      reason: 'DAYDREAMS_FACILITATOR_URL not configured',
    };
  }
  
  // Validate that payer and merchant are different
  if (proof.from.toLowerCase() === merchantAddress.toLowerCase()) {
    console.error('[Daydreams] Invalid payment: payer and merchant are the same address');
    return {
      verified: false,
      reason: 'Invalid payment: payer and merchant addresses cannot be the same',
    };
  }

  // For Solana, use signature instead of transactionHash
  const signature = proof.signature || proof.transactionHash;
  if (!signature) {
    return {
      verified: false,
      reason: 'Missing transaction signature',
    };
  }

  // Daydreams facilitator verification request format (Solana)
  const verifyRequest: DaydreamsVerifyRequest = {
    signature: signature,
    chainId: SOLANA_CHAIN_ID,
    token: proof.token || USDC_SOLANA_MINT,
    amount: proof.amount,
    merchant: merchantAddress,
    payer: proof.from,
  };

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Daydreams] Verify request:', JSON.stringify(verifyRequest, null, 2));
      console.log('[Daydreams] Proof details:', {
        signature: signature,
        from: proof.from,
        to: proof.to,
        amount: proof.amount,
        token: proof.token || USDC_SOLANA_MINT,
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'r1x/1.0',
    };

    const response = await fetch(`${DAYDREAMS_FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify(verifyRequest),
    });

    const responseText = await response.text();
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Daydreams] Verify response status:', response.status);
      console.log('[Daydreams] Verify response body:', responseText);
    }

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { reason: responseText || `HTTP ${response.status}` };
      }

      console.error('[Daydreams] Verification failed:', {
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

    if (process.env.NODE_ENV !== 'production') {
      console.log('[Daydreams] Verification successful:', data);
    }

    // Daydreams might return different response formats
    // Handle both { verified: true } and { success: true } formats
    if (data.verified === true || data.success === true || data.status === 'verified') {
      return {
        verified: true,
        settlement: data.settlement || data.settlementHash ? {
          signature: data.settlementHash || data.settlement?.signature || data.settlement?.transactionHash,
        } : undefined,
      };
    }

    return {
      verified: false,
      reason: data.reason || data.error || 'Verification returned false',
    };
  } catch (error: any) {
    console.error('[Daydreams] Verification error:', error);
    return {
      verified: false,
      reason: error.message || 'Failed to verify payment',
    };
  }
}

/**
 * Settle Solana payment with Daydreams facilitator
 */
export async function settlePaymentWithDaydreams(
  proof: PaymentProof & { signature?: string },
  merchantAddress: string
): Promise<DaydreamsSettleResponse> {
  if (!DAYDREAMS_FACILITATOR_URL) {
    console.error('[Daydreams] DAYDREAMS_FACILITATOR_URL not set in Railway');
    return {
      settled: false,
      reason: 'DAYDREAMS_FACILITATOR_URL not configured',
    };
  }
  
  const signature = proof.signature || proof.transactionHash;
  if (!signature) {
    return {
      settled: false,
      reason: 'Missing transaction signature',
    };
  }

  const settleRequest: DaydreamsSettleRequest = {
    signature: signature,
    chainId: SOLANA_CHAIN_ID,
    token: proof.token || USDC_SOLANA_MINT,
    amount: proof.amount,
    merchant: merchantAddress,
    payer: proof.from,
  };

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Daydreams] Settle request:', JSON.stringify(settleRequest, null, 2));
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'r1x/1.0',
    };

    const response = await fetch(`${DAYDREAMS_FACILITATOR_URL}/settle`, {
      method: 'POST',
      headers,
      body: JSON.stringify(settleRequest),
    });

    const responseText = await response.text();
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Daydreams] Settle response status:', response.status);
      console.log('[Daydreams] Settle response body:', responseText);
    }

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { reason: responseText || `HTTP ${response.status}` };
      }

      console.error('[Daydreams] Settlement failed:', {
        status: response.status,
        error: errorData,
        request: settleRequest,
      });

      return {
        settled: false,
        reason: errorData.reason || errorData.error || errorData.message || errorData.details || `HTTP ${response.status}: ${responseText}`,
      };
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      if (response.status === 200) {
        data = { settled: true };
      } else {
        throw new Error('Invalid JSON response');
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[Daydreams] Settlement successful:', data);
    }

    // Daydreams might return different response formats
    if (data.settled === true || data.success === true || data.status === 'settled') {
      return {
        settled: true,
        settlementHash: data.settlementHash || data.settlement?.signature || data.settlement?.transactionHash || signature,
      };
    }

    return {
      settled: false,
      reason: data.reason || data.error || 'Settlement returned false',
    };
  } catch (error: any) {
    console.error('[Daydreams] Settlement error:', error);
    return {
      settled: false,
      reason: error.message || 'Failed to settle payment',
    };
  }
}

