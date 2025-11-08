/**
 * Solana payment verification middleware for Express server
 * Verifies Solana USDC payments via Daydreams facilitator (proper x402 protocol)
 * Runs before PayAI middleware - if Solana payment verified, skips PayAI
 * 
 * Uses Daydreams facilitator /verify and /settle endpoints (same as PayAI for EVM)
 */

import { Request, Response, NextFunction } from 'express';

const DAYDREAMS_FACILITATOR_URL = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';
const SOLANA_FEE_RECIPIENT_ADDRESS = process.env.SOLANA_FEE_RECIPIENT_ADDRESS;
const SOLANA_CHAIN_ID = 0; // Solana uses chainId 0
const USDC_SOLANA_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC on Solana

/**
 * Verify Solana payment with Daydreams facilitator (x402 protocol)
 */
async function verifyPaymentWithDaydreams(
  signature: string,
  from: string,
  to: string,
  amount: string,
  merchant: string
): Promise<{ verified: boolean; error?: string; settlement?: { signature: string } }> {
  try {
    const verifyRequest = {
      signature: signature,
      chainId: SOLANA_CHAIN_ID,
      token: USDC_SOLANA_MINT,
      amount: amount,
      merchant: merchant,
      payer: from,
    };

    const response = await fetch(`${DAYDREAMS_FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'r1x-x402-server/1.0',
      },
      body: JSON.stringify(verifyRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { verified: false, error: `Daydreams verification failed: ${response.status} ${errorText}` };
    }

    const data = await response.json();
    if (data.verified === true || data.success === true || data.status === 'verified') {
      return {
        verified: true,
        settlement: data.settlement || data.settlementHash ? {
          signature: data.settlementHash || data.settlement?.signature || data.settlement?.transactionHash || signature,
        } : undefined,
      };
    }

    return { verified: false, error: data.reason || data.error || 'Verification returned false' };
  } catch (error: any) {
    return { verified: false, error: error.message || 'Failed to verify payment with Daydreams facilitator' };
  }
}

/**
 * Settle Solana payment with Daydreams facilitator (x402 protocol)
 */
async function settlePaymentWithDaydreams(
  signature: string,
  from: string,
  to: string,
  amount: string,
  merchant: string
): Promise<{ settled: boolean; error?: string; settlementHash?: string }> {
  try {
    const settleRequest = {
      signature: signature,
      chainId: SOLANA_CHAIN_ID,
      token: USDC_SOLANA_MINT,
      amount: amount,
      merchant: merchant,
      payer: from,
    };

    const response = await fetch(`${DAYDREAMS_FACILITATOR_URL}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'r1x-x402-server/1.0',
      },
      body: JSON.stringify(settleRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { settled: false, error: `Daydreams settlement failed: ${response.status} ${errorText}` };
    }

    const data = await response.json();
    if (data.settled === true || data.success === true || data.status === 'settled') {
      return {
        settled: true,
        settlementHash: data.settlementHash || data.settlement?.signature || data.settlement?.transactionHash || signature,
      };
    }

    return { settled: false, error: data.reason || data.error || 'Settlement returned false' };
  } catch (error: any) {
    return { settled: false, error: error.message || 'Failed to settle payment with Daydreams facilitator' };
  }
}

/**
 * Get transaction details from Solana network
 * Note: This function is currently unused - we rely on proof from client
 */
async function getSolanaTransaction(signature: string): Promise<{ 
  signature: string; 
  from?: string; 
  to?: string; 
  amount?: string;
  error?: string;
}> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    
    if (!tx) {
      return { signature, error: 'Transaction not found' };
    }
    
    // Extract transfer details from transaction
    // For SPL token transfers, we need to parse the instructions
    // Note: Full parsing of SPL token transfers requires parsing instructions
    // For now, we'll rely on the proof provided by the client
    // The transaction message can be VersionedMessage, so we use getAccountKeys() if available
    let from: string | undefined;
    try {
      const message = tx.transaction.message;
      if ('getAccountKeys' in message && typeof message.getAccountKeys === 'function') {
        const accountKeys = message.getAccountKeys();
        from = accountKeys.staticAccountKeys[0]?.toString();
      }
    } catch (e) {
      // Fallback - rely on client proof
    }
    
    return { signature, from };
  } catch (error: any) {
    return { signature, error: error.message || 'Failed to fetch transaction' };
  }
}

/**
 * Solana payment verification middleware
 * Checks if request is for Solana network and verifies payment via Daydreams facilitator
 */
export function solanaPaymentMiddleware(
  routeConfig: {
    route: string;
    price: string;
  }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only handle requests matching this route
    if (req.path !== routeConfig.route || req.method !== 'POST') {
      return next();
    }

    // Check if this is a Solana request
    const network = req.body?.network || req.headers['x-network'] || 'base';
    if (network !== 'solana') {
      // Not Solana - let PayAI middleware handle it
      return next();
    }

    // Check for Solana payment proof
    const xPaymentHeader = typeof req.headers['x-payment'] === 'string' ? req.headers['x-payment'] as string : undefined;
    if (!xPaymentHeader) {
      // No payment header - return 402 Payment Required
      const price = routeConfig.price;
      const amountWei = Math.ceil(parseFloat(price.replace('$', '')) * 1_000_000).toString(); // USDC has 6 decimals
      
      res.status(402).json({
        error: 'Payment required',
        accepts: [{
          network: 'solana',
          asset: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC on Solana
          amount: amountWei,
          maxAmountRequired: amountWei,
          payTo: SOLANA_FEE_RECIPIENT_ADDRESS || '',
          tokenSymbol: 'USDC',
        }],
      });
      return;
    }

    // Parse payment proof
    let proof: any;
    try {
      proof = JSON.parse(xPaymentHeader);
    } catch {
      return res.status(400).json({ error: 'Invalid X-Payment header format' });
    }

    // Validate proof structure
    if (!proof.signature || !proof.from || !proof.to || !proof.amount) {
      return res.status(400).json({ error: 'Invalid payment proof: missing required fields' });
    }

    // Validate recipient matches expected address
    const expectedRecipient = SOLANA_FEE_RECIPIENT_ADDRESS;
    if (expectedRecipient && proof.to.toLowerCase() !== expectedRecipient.toLowerCase()) {
      return res.status(400).json({ 
        error: `Recipient mismatch: expected ${expectedRecipient}, got ${proof.to}` 
      });
    }

    // Verify payment with Daydreams facilitator (proper x402 protocol)
    const verifyResult = await verifyPaymentWithDaydreams(
      proof.signature,
      proof.from,
      proof.to,
      proof.amount,
      expectedRecipient || proof.to
    );
    
    if (!verifyResult.verified) {
      return res.status(400).json({ 
        error: 'Payment verification failed', 
        details: verifyResult.error 
      });
    }

    // Settle payment with Daydreams facilitator (proper x402 protocol)
    const settleResult = await settlePaymentWithDaydreams(
      proof.signature,
      proof.from,
      proof.to,
      proof.amount,
      expectedRecipient || proof.to
    );
    
    if (!settleResult.settled) {
      return res.status(400).json({ 
        error: 'Payment settlement failed', 
        details: settleResult.error 
      });
    }

    const settlementHash = settleResult.settlementHash || proof.signature;

    // Payment verified and settled via Daydreams facilitator - attach proof to request and continue
    (req as any).solanaPaymentVerified = true;
    (req as any).solanaPaymentProof = proof;
    (req as any).solanaSettlementHash = settlementHash;
    
    // Set X-Payment-Response header (similar to PayAI middleware)
    res.setHeader('X-Payment-Response', JSON.stringify({
      verified: true,
      settled: true,
      settlementHash: settlementHash,
      proof,
    }));

    console.log('[Solana] Payment verified and settled via Daydreams facilitator:', {
      signature: proof.signature.substring(0, 20) + '...',
      from: proof.from.substring(0, 10) + '...',
      to: proof.to.substring(0, 10) + '...',
      amount: proof.amount,
      settlementHash: settlementHash.substring(0, 20) + '...',
    });

    next();
  };
}

