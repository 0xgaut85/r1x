/**
 * Solana payment verification middleware for Express server
 * Uses official PayAI x402-solana package
 * COMPLETELY ISOLATED from EVM/PayAI routes - only handles /api/r1x-agent/chat/solana
 * 
 * Based on: https://github.com/payainetwork/x402-solana
 */

import { Request, Response, NextFunction } from 'express';
import { X402PaymentHandler } from 'x402-solana/server';

// Configuration from environment variables
const FACILITATOR_URL = process.env.FACILITATOR_URL; // PayAI facilitator (same as EVM)
const SOLANA_FEE_RECIPIENT_ADDRESS = process.env.SOLANA_FEE_RECIPIENT_ADDRESS;
const USDC_SOLANA_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC on Solana mainnet

// Initialize PayAI x402-solana payment handler
let x402Handler: X402PaymentHandler | null = null;

if (FACILITATOR_URL && SOLANA_FEE_RECIPIENT_ADDRESS) {
  try {
    x402Handler = new X402PaymentHandler({
      network: 'solana', // Use mainnet
      treasuryAddress: SOLANA_FEE_RECIPIENT_ADDRESS as any, // Solana addresses are base58, not hex
      facilitatorUrl: FACILITATOR_URL,
      defaultToken: {
        address: USDC_SOLANA_MINT,
        decimals: 6, // USDC has 6 decimals on Solana
      },
    });
    console.log('[x402-solana] Payment handler initialized for Solana');
  } catch (error: any) {
    console.error('[x402-solana] Failed to initialize payment handler:', error.message);
  }
} else {
  console.warn('[x402-solana] Missing configuration - FACILITATOR_URL or SOLANA_FEE_RECIPIENT_ADDRESS not set');
}

/**
 * Solana payment verification middleware using official x402-solana package
 * COMPLETELY ISOLATED from EVM/PayAI routes - only handles /api/r1x-agent/chat/solana
 */
export function solanaPaymentMiddleware(
  routeConfig: {
    route: string;
    price: string;
  }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only handle requests matching this route - COMPLETE ISOLATION
    if (req.path !== routeConfig.route || req.method !== 'POST') {
      return next();
    }

    // Check if this is a Solana request
    const network = req.body?.network || req.headers['x-network'] || 'base';
    if (network !== 'solana') {
      // Not Solana - let PayAI EVM middleware handle it
      return next();
    }

    // If x402 handler not initialized, return error
    if (!x402Handler) {
      return res.status(500).json({ 
        error: 'Solana payment handler not configured',
        details: 'FACILITATOR_URL or SOLANA_FEE_RECIPIENT_ADDRESS missing'
      });
    }

    try {
      // Extract X-Payment header using official package
      const xPaymentHeader = req.headers['x-payment'] as string | undefined;
      
      if (!xPaymentHeader) {
        // No payment header - return 402 Payment Required using official package
        const priceAmount = parseFloat(routeConfig.price.replace('$', ''));
        const amountMicroUsdc = Math.ceil(priceAmount * 1_000_000).toString(); // USDC has 6 decimals
        
        const paymentRequirements = await x402Handler.createPaymentRequirements({
          price: {
            amount: amountMicroUsdc,
            asset: {
              address: USDC_SOLANA_MINT as any, // Solana addresses are base58, not hex
            },
          },
          network: 'solana',
          config: {
            description: 'r1x Agent Chat - Solana',
            resource: `${req.protocol}://${req.get('host')}${req.path}`,
            mimeType: 'application/json',
          },
        });

        const response402 = x402Handler.create402Response(paymentRequirements);
        
        res.status(402).json(response402);
        return;
      }

      // Create payment requirements for verification
      const priceAmount = parseFloat(routeConfig.price.replace('$', ''));
      const amountMicroUsdc = Math.ceil(priceAmount * 1_000_000).toString();
      
      const paymentRequirements = await x402Handler.createPaymentRequirements({
        price: {
          amount: amountMicroUsdc,
          asset: {
            address: USDC_SOLANA_MINT as any, // Solana addresses are base58, not hex
          },
        },
        network: 'solana',
        config: {
          description: 'r1x Agent Chat - Solana',
          resource: `${req.protocol}://${req.get('host')}${req.path}`,
          mimeType: 'application/json',
        },
      });

      // Verify payment using official x402-solana package
      const verifyResult = await x402Handler.verifyPayment(xPaymentHeader, paymentRequirements);
      
      if (!verifyResult.isValid) {
        return res.status(400).json({ 
          error: 'Payment verification failed', 
          details: verifyResult.invalidReason || 'Verification failed'
        });
      }

      // Settle payment using official x402-solana package
      const settleResult = await x402Handler.settlePayment(xPaymentHeader, paymentRequirements);
      
      if (!settleResult.success) {
        return res.status(400).json({ 
          error: 'Payment settlement failed', 
          details: settleResult.errorReason || 'Settlement failed'
        });
      }

      // Extract payment proof from header for downstream processing
      const paymentProof = x402Handler.extractPayment({ 'x-payment': xPaymentHeader });
      const settlementHash = settleResult.transaction || paymentProof || '';

      // Payment verified and settled via PayAI x402-solana - attach proof to request and continue
      // COMPLETELY ISOLATED from EVM/PayAI routes - this only handles Solana
      (req as any).solanaPaymentVerified = true;
      (req as any).solanaPaymentProof = paymentProof;
      (req as any).solanaSettlementHash = settlementHash;
      
      // Set X-Payment-Response header (similar to PayAI EVM middleware)
      res.setHeader('X-Payment-Response', JSON.stringify({
        verified: true,
        settled: true,
        settlementHash: settlementHash,
        proof: paymentProof,
      }));

      console.log('[x402-solana] Payment verified and settled:', {
        signature: typeof settlementHash === 'string' ? settlementHash.substring(0, 20) + '...' : settlementHash,
        amount: amountMicroUsdc,
        network: 'solana',
      });

      next();
    } catch (error: any) {
      console.error('[x402-solana] Payment middleware error:', {
        message: error.message,
        stack: error.stack?.substring(0, 500),
        path: req.path,
      });
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Payment processing error',
          details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
      }
    }
  };
}
