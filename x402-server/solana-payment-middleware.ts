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
      network: 'solana', // Use mainnet (as per official docs: 'solana' | 'solana-devnet')
      treasuryAddress: SOLANA_FEE_RECIPIENT_ADDRESS,
      facilitatorUrl: FACILITATOR_URL,
      // defaultToken is optional - omit it since TypeScript types may be incorrect
      // The asset address will be specified in createPaymentRequirements instead
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
    // Use req.path or req.url (without query string) for matching
    const requestPath = req.path || req.url?.split('?')[0] || '';
    if (requestPath !== routeConfig.route || req.method !== 'POST') {
      return next();
    }

    // Check if this is a Solana request
    const network = req.body?.network || req.headers['x-network'] || 'solana'; // Default to 'solana' for /solana route
    if (network !== 'solana') {
      // Not Solana - let PayAI EVM middleware handle it
      console.warn('[x402-solana] Request to /solana route but network is not solana:', network);
      return next();
    }

    // If x402 handler not initialized, return error
    if (!x402Handler) {
      console.error('[x402-solana] Payment handler not initialized:', {
        hasFacilitatorUrl: !!FACILITATOR_URL,
        hasSolanaFeeRecipient: !!SOLANA_FEE_RECIPIENT_ADDRESS,
        path: requestPath,
      });
      return res.status(500).json({ 
        error: 'Solana payment handler not configured',
        details: 'FACILITATOR_URL or SOLANA_FEE_RECIPIENT_ADDRESS missing'
      });
    }

    try {
      console.log('[x402-solana] Processing payment request:', {
        path: requestPath,
        method: req.method,
        hasBody: !!req.body,
        hasXPayment: !!req.headers['x-payment'],
        network,
      });

      // Extract X-Payment header using official package (per official docs)
      // Convert Express headers to plain object if needed (x402-solana expects standard headers)
      const headers = typeof req.headers === 'object' ? req.headers : {};
      const paymentHeader = x402Handler.extractPayment(headers);
      
      if (!paymentHeader) {
        // No payment header - return 402 Payment Required using official x402-solana package
        const priceAmount = parseFloat(routeConfig.price.replace('$', ''));
        const amountMicroUsdc = Math.ceil(priceAmount * 1_000_000).toString(); // USDC has 6 decimals
        
        const paymentRequirements = await x402Handler.createPaymentRequirements({
          price: {
            amount: amountMicroUsdc, // String in micro-units per official docs
            asset: {
              address: USDC_SOLANA_MINT as any, // USDC mint address (Solana addresses don't use 0x prefix)
              decimals: 6, // USDC on Solana has 6 decimals
            },
          },
          network: 'solana',
          config: {
            description: 'r1x Agent Chat - Solana',
            resource: `${req.protocol}://${req.get('host')}${req.path}`,
            mimeType: 'application/json',
          },
        });

        // Use official create402Response method from x402-solana
        // Returns { body, status } per official docs
        const response402 = x402Handler.create402Response(paymentRequirements);
        
        // Log the response to debug format
        console.log('[x402-solana] 402 response:', JSON.stringify(response402, null, 2));
        
        res.status(response402.status).json(response402.body);
        return;
      }

      // Create payment requirements for verification
      const priceAmount = parseFloat(routeConfig.price.replace('$', ''));
      const amountMicroUsdc = Math.ceil(priceAmount * 1_000_000).toString();
      
      const paymentRequirements = await x402Handler.createPaymentRequirements({
        price: {
          amount: amountMicroUsdc, // String in micro-units per official docs
          asset: {
            address: USDC_SOLANA_MINT as any, // USDC mint address (Solana addresses don't use 0x prefix)
            decimals: 6, // USDC on Solana has 6 decimals
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
      // Per official docs: returns boolean or result object
      const verified = await x402Handler.verifyPayment(paymentHeader, paymentRequirements);
      
      // Handle both boolean and object return types (checking actual implementation)
      const isValid = typeof verified === 'boolean' ? verified : (verified as any)?.isValid ?? false;
      if (!isValid) {
        const reason = typeof verified === 'object' && verified !== null 
          ? (verified as any).invalidReason || 'Verification failed'
          : 'Verification failed';
        return res.status(402).json({ 
          error: 'Invalid payment',
          details: reason
        });
      }

      // Settle payment using official x402-solana package
      // Per official docs: settlePayment may return result object
      const settleResult = await x402Handler.settlePayment(paymentHeader, paymentRequirements);
      
      // Handle settlement errors if result object is returned
      if (settleResult && typeof settleResult === 'object' && 'success' in settleResult && !settleResult.success) {
        return res.status(400).json({ 
          error: 'Payment settlement failed', 
          details: (settleResult as any).errorReason || 'Settlement failed'
        });
      }

      // Payment proof already extracted above
      const paymentProof = paymentHeader;
      
      // Get settlement hash from settleResult if available, otherwise from paymentProof
      const settlementHash = (settleResult && typeof settleResult === 'object' && 'transaction' in settleResult)
        ? (settleResult as any).transaction
        : paymentProof || '';

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
        name: error.name,
        code: error.code,
        stack: error.stack?.substring(0, 500),
        path: req.path,
        headers: {
          'x-payment': req.headers['x-payment'] ? 'present' : 'missing',
          'x-network': req.headers['x-network'],
        },
      });
      
      if (!res.headersSent) {
        // Provide more detailed error in development
        const errorDetails = process.env.NODE_ENV === 'development' 
          ? {
              error: 'Payment processing error',
              message: error.message,
              name: error.name,
              code: error.code,
            }
          : {
              error: 'Payment processing error',
              details: 'Internal server error',
            };
        
        res.status(500).json(errorDetails);
      }
    }
  };
}
