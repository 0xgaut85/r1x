/**
 * Save transaction to database after payment verification
 * 
 * This module handles saving transaction records to the PostgreSQL database
 * after PayAI middleware has verified the payment.
 */

import { PrismaClient } from '@prisma/client';

// Initialize Prisma client with proper error handling
let prisma: PrismaClient | null = null;

try {
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    console.log('[Save Transaction] Prisma client initialized');
  } else {
    console.warn('[Save Transaction] DATABASE_URL not set, transaction saving disabled');
  }
} catch (error) {
  console.error('[Save Transaction] Failed to initialize Prisma client:', error);
  prisma = null;
}

const USDC_DECIMALS = 6;
const BASE_CHAIN_ID = 8453;
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

interface PaymentProof {
  transactionHash: string;
  blockNumber?: number;
  from: string;
  to: string;
  amount: string;
  token: string;
  timestamp?: number;
  chainId?: number;
}

interface SaveTransactionParams {
  proof: PaymentProof;
  serviceId: string; // Service identifier (e.g., 'r1x-agent-chat')
  serviceName: string;
  price: string; // Price in USDC (e.g., '0.25')
  feePercentage?: number; // Platform fee percentage (default: 5%)
}

/**
 * Parse payment proof from X-Payment header
 * Handles both JSON string and base64-encoded JSON
 */
export function parsePaymentProof(xPaymentHeader: string | undefined): PaymentProof | null {
  if (!xPaymentHeader) return null;

  try {
    let proof: any;
    
    // Try parsing as JSON first
    try {
      proof = JSON.parse(xPaymentHeader);
    } catch (jsonError) {
      // If JSON parse fails, try base64 decode
      try {
        // x402-fetch sends base64-encoded payment proof
        const decoded = Buffer.from(xPaymentHeader, 'base64').toString('utf-8');
        proof = JSON.parse(decoded);
        console.log('[Save Transaction] Decoded base64 payment proof');
      } catch (base64Error) {
        console.error('[Save Transaction] Failed to parse payment proof (both JSON and base64 failed):', {
          jsonError: jsonError instanceof Error ? jsonError.message : jsonError,
          base64Error: base64Error instanceof Error ? base64Error.message : base64Error,
          headerPreview: xPaymentHeader.substring(0, 50),
        });
        return null;
      }
    }
    
    // Validate required fields
    if (!proof.transactionHash || !proof.from || !proof.to || !proof.amount) {
      console.error('[Save Transaction] Invalid payment proof structure:', {
        hasTransactionHash: !!proof.transactionHash,
        hasFrom: !!proof.from,
        hasTo: !!proof.to,
        hasAmount: !!proof.amount,
        proofKeys: Object.keys(proof),
      });
      return null;
    }

    return {
      transactionHash: proof.transactionHash,
      blockNumber: proof.blockNumber || undefined,
      from: proof.from.toLowerCase(),
      to: proof.to.toLowerCase(),
      amount: proof.amount.toString(),
      token: proof.token || USDC_BASE_ADDRESS,
      timestamp: proof.timestamp || Date.now(),
      chainId: proof.chainId || BASE_CHAIN_ID,
    };
  } catch (error) {
    console.error('[Save Transaction] Failed to parse payment proof:', error);
    return null;
  }
}

/**
 * Calculate fee distribution
 */
function calculateFees(
  amount: string,
  feePercentage: number = 5
): { feeAmount: string; merchantAmount: string } {
  const amountBigInt = BigInt(amount);
  const feeAmount = (amountBigInt * BigInt(feePercentage)) / BigInt(100);
  const merchantAmount = amountBigInt - feeAmount;

  return {
    feeAmount: feeAmount.toString(),
    merchantAmount: merchantAmount.toString(),
  };
}

/**
 * Ensure service exists in database
 */
async function ensureService(
  serviceId: string,
  serviceName: string,
  merchantAddress: string,
  price: string,
  priceDisplay: string
): Promise<string> {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  // Try to find existing service
  const existing = await prisma.service.findUnique({
    where: { serviceId },
  });

  if (existing) {
    return existing.id;
  }

  // Create new service
  const service = await prisma.service.create({
    data: {
      serviceId,
      name: serviceName,
      description: `Paid service: ${serviceName}`,
      category: 'AI Agent',
      merchant: merchantAddress.toLowerCase(),
      network: 'base',
      chainId: BASE_CHAIN_ID,
      token: USDC_BASE_ADDRESS,
      tokenSymbol: 'USDC',
      price: price,
      priceDisplay: priceDisplay,
      available: true,
    },
  });

  console.log('[Save Transaction] Created service:', service.id);
  return service.id;
}

/**
 * Save transaction to database
 */
export async function saveTransaction(params: SaveTransactionParams): Promise<void> {
  // Check if Prisma is initialized
  if (!prisma) {
    console.warn('[Save Transaction] Prisma client not initialized, skipping transaction save');
    return;
  }

  const {
    proof,
    serviceId,
    serviceName,
    price,
    feePercentage = 5,
  } = params;

  try {
    const merchantAddress = process.env.MERCHANT_ADDRESS;
    const feeRecipient = process.env.FEE_RECIPIENT_ADDRESS;

    if (!merchantAddress) {
      console.error('[Save Transaction] MERCHANT_ADDRESS not configured');
      return;
    }

    // Calculate fees
    const { feeAmount, merchantAmount } = calculateFees(proof.amount, feePercentage);

    // Ensure service exists
    const dbServiceId = await ensureService(
      serviceId,
      serviceName,
      merchantAddress,
      proof.amount,
      price
    );

    // Check if transaction already exists
    try {
      const existingTx = await prisma.transaction.findUnique({
        where: { transactionHash: proof.transactionHash },
      });

      if (existingTx) {
        console.log('[Save Transaction] Transaction already exists:', proof.transactionHash);
        
        // Update status if needed
        if (existingTx.status === 'pending') {
          await prisma.transaction.update({
            where: { id: existingTx.id },
            data: {
              status: 'verified',
              verificationStatus: 'verified',
              verifiedAt: new Date(),
              blockNumber: proof.blockNumber || existingTx.blockNumber,
            },
          });
          console.log('[Save Transaction] Updated transaction status to verified');
        }
        return;
      }
    } catch (error) {
      console.error('[Save Transaction] Error checking existing transaction:', error);
      // Continue to create new transaction
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        serviceId: dbServiceId,
        transactionHash: proof.transactionHash,
        blockNumber: proof.blockNumber || null,
        from: proof.from,
        to: proof.to,
        amount: proof.amount,
        token: proof.token,
        chainId: proof.chainId || BASE_CHAIN_ID,
        feeAmount,
        merchantAmount,
        status: 'verified', // Payment already verified by middleware
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        timestamp: new Date(proof.timestamp || Date.now()),
      },
    });

    console.log('[Save Transaction] Created transaction:', transaction.id);

    // Create fee record if fee recipient is configured
    if (feeRecipient && feeAmount !== '0') {
      await prisma.fee.create({
        data: {
          transactionId: transaction.id,
          feeAmount,
          feeRecipient: feeRecipient.toLowerCase(),
          transferred: false,
        },
      });
      console.log('[Save Transaction] Created fee record');
    }

    console.log('[Save Transaction] Transaction saved successfully:', {
      transactionHash: proof.transactionHash,
      from: proof.from,
      amount: proof.amount,
      serviceId,
    });
  } catch (error: any) {
    console.error('[Save Transaction] Error saving transaction:', error);
    // Don't throw - we don't want to break the payment flow if DB save fails
  }
}

/**
 * Close Prisma connection (call on server shutdown)
 */
export async function closeConnection(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

