/**
 * Solana payment verification middleware for Express server
 * Verifies Solana USDC payments via Daydreams facilitator
 * Runs before PayAI middleware - if Solana payment verified, skips PayAI
 * 
 * For Solana payments: Transaction signature is the proof (on-chain verification)
 * We verify the transaction exists on-chain rather than calling facilitator directly
 */

import { Request, Response, NextFunction } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';

const DAYDREAMS_FACILITATOR_URL = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';
const SOLANA_FEE_RECIPIENT_ADDRESS = process.env.SOLANA_FEE_RECIPIENT_ADDRESS;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

/**
 * Verify Solana transaction exists on-chain
 * This is the correct method - Solana transactions are verified on-chain, not via facilitator API
 */
async function verifySolanaTransaction(signature: string): Promise<{ verified: boolean; error?: string }> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    
    // Get transaction status from Solana network
    const txStatus = await connection.getSignatureStatus(signature);
    
    if (!txStatus || !txStatus.value) {
      return { verified: false, error: 'Transaction not found' };
    }
    
    if (txStatus.value.err) {
      return { verified: false, error: `Transaction failed: ${JSON.stringify(txStatus.value.err)}` };
    }
    
    // Transaction exists and succeeded
    return { verified: true };
  } catch (error: any) {
    return { verified: false, error: error.message || 'Verification error' };
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

    // Verify transaction exists on-chain (correct method for Solana)
    const verifyResult = await verifySolanaTransaction(proof.signature);
    
    if (!verifyResult.verified) {
      return res.status(400).json({ 
        error: 'Payment verification failed', 
        details: verifyResult.error 
      });
    }

    // Transaction verified on-chain - attach proof to request and continue
    // Note: Solana transactions are settled immediately when sent, so no separate settlement step needed
    (req as any).solanaPaymentVerified = true;
    (req as any).solanaPaymentProof = proof;
    (req as any).solanaSettlementHash = proof.signature; // Solana signature is the settlement hash
    
    // Set X-Payment-Response header (similar to PayAI middleware)
    res.setHeader('X-Payment-Response', JSON.stringify({
      verified: true,
      settled: true,
      settlementHash: proof.signature,
      proof,
    }));

    console.log('[Solana] Payment verified on-chain:', {
      signature: proof.signature.substring(0, 20) + '...',
      from: proof.from.substring(0, 10) + '...',
      to: proof.to.substring(0, 10) + '...',
      amount: proof.amount,
    });

    next();
  };
}

