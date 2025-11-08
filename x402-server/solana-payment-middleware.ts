/**
 * Solana payment verification middleware for Express server
 * Verifies Solana USDC payments via Daydreams facilitator
 * Runs before PayAI middleware - if Solana payment verified, skips PayAI
 * 
 * NOTE: Daydreams facilitator API structure needs verification:
 * - Endpoints: /verify, /settle (confirmed to exist)
 * - Request/response formats: Need to verify from official Daydreams docs
 * - Current implementation uses minimal payload structure - may need adjustment
 */

import { Request, Response, NextFunction } from 'express';

const DAYDREAMS_FACILITATOR_URL = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';
const SOLANA_FEE_RECIPIENT_ADDRESS = process.env.SOLANA_FEE_RECIPIENT_ADDRESS;

/**
 * Verify Solana payment via Daydreams facilitator
 * TODO: Verify exact request/response format from Daydreams facilitator API docs
 */
async function verifySolanaPayment(proof: {
  signature: string;
  from: string;
  to: string;
  amount: string;
  tokenSymbol?: string;
  token?: string;
}, verifyPayload: any): Promise<{ verified: boolean; error?: string }> {
  try {
    // TODO: Verify correct payload structure from Daydreams facilitator API docs
    // Current implementation uses payload from client or constructs minimal payload
    const verifyRes = await fetch(`${DAYDREAMS_FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(verifyPayload),
    });

    if (!verifyRes.ok) {
      const text = await verifyRes.text().catch(() => '');
      return { verified: false, error: `Verification failed: ${text}` };
    }

    const verifyJson = await verifyRes.json().catch(() => ({}));
    return { verified: true };
  } catch (error: any) {
    return { verified: false, error: error.message || 'Verification error' };
  }
}

/**
 * Settle Solana payment via Daydreams facilitator
 * TODO: Verify exact request/response format from Daydreams facilitator API docs
 */
async function settleSolanaPayment(settlePayload: any): Promise<{ settled: boolean; settlementHash?: string; error?: string }> {
  try {
    // TODO: Verify correct payload structure from Daydreams facilitator API docs
    // Current implementation uses payload from client or constructs minimal payload
    const settleRes = await fetch(`${DAYDREAMS_FACILITATOR_URL}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(settlePayload),
    });

    if (!settleRes.ok) {
      const text = await settleRes.text().catch(() => '');
      return { settled: false, error: `Settlement failed: ${text}` };
    }

    const settleJson = await settleRes.json().catch(() => ({}));
    // TODO: Verify correct response field name for settlement hash
    const settlementHash = settleJson.settlementHash || settleJson.transactionHash || settleJson.hash || null;
    return { settled: true, settlementHash: settlementHash || undefined };
  } catch (error: any) {
    return { settled: false, error: error.message || 'Settlement error' };
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

    // Verify payment via Daydreams facilitator
    const verifyPayload = req.body.verifyPayload || { signature: proof.signature, ...proof };
    const verifyResult = await verifySolanaPayment(proof, verifyPayload);
    
    if (!verifyResult.verified) {
      return res.status(400).json({ 
        error: 'Payment verification failed', 
        details: verifyResult.error 
      });
    }

    // Settle payment via Daydreams facilitator
    const settlePayload = req.body.settlePayload || { signature: proof.signature, ...proof };
    const settleResult = await settleSolanaPayment(settlePayload);
    
    if (!settleResult.settled) {
      return res.status(400).json({ 
        error: 'Payment settlement failed', 
        details: settleResult.error 
      });
    }

    // Payment verified and settled - attach proof to request and continue
    (req as any).solanaPaymentVerified = true;
    (req as any).solanaPaymentProof = proof;
    (req as any).solanaSettlementHash = settleResult.settlementHash;
    
    // Set X-Payment-Response header (similar to PayAI middleware)
    res.setHeader('X-Payment-Response', JSON.stringify({
      verified: true,
      settled: true,
      settlementHash: settleResult.settlementHash,
      proof,
    }));

    console.log('[Solana] Payment verified and settled:', {
      signature: proof.signature.substring(0, 20) + '...',
      from: proof.from.substring(0, 10) + '...',
      to: proof.to.substring(0, 10) + '...',
      amount: proof.amount,
      settlementHash: settleResult.settlementHash?.substring(0, 20) + '...',
    });

    next();
  };
}

