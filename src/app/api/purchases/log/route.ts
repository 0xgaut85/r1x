/**
 * Purchase Logging API
 * 
 * Logs purchases made via x402 payments (both fee and service payments)
 * Creates Transaction records for user panel visibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseUnits } from 'viem';

const USDC_DECIMALS = 6;
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

/**
 * Decode payment receipt from x-payment-response header
 * Handles both base64-encoded and direct JSON formats
 */
function decodePaymentReceipt(headerValue: string | null): any | null {
  if (!headerValue) return null;

  try {
    // Try parsing as direct JSON first
    try {
      return JSON.parse(headerValue);
    } catch {
      // Try base64 decode
      try {
        const decoded = Buffer.from(headerValue, 'base64').toString('utf-8');
        return JSON.parse(decoded);
      } catch {
        // Try URL-safe base64
        try {
          const base64Str = headerValue.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = Buffer.from(base64Str, 'base64').toString('utf-8');
          return JSON.parse(decoded);
        } catch {
          console.warn('[Purchase Log] Failed to decode payment receipt:', headerValue.substring(0, 100));
          return null;
        }
      }
    }
  } catch (error) {
    console.error('[Purchase Log] Error decoding receipt:', error);
    return null;
  }
}

/**
 * Extract transaction hash from payment receipt
 */
function extractTransactionHash(receipt: any): string | null {
  if (!receipt) return null;

  // Try various possible fields
  return receipt.transactionHash ||
         receipt.hash ||
         receipt.txHash ||
         receipt.payload?.authorization?.transactionHash ||
         null;
}

/**
 * Extract payment details from receipt
 */
function extractPaymentDetails(receipt: any): {
  from: string | null;
  to: string | null;
  amount: string | null;
  token: string | null;
} {
  if (!receipt) {
    return { from: null, to: null, amount: null, token: null };
  }

  const auth = receipt.payload?.authorization || receipt.authorization || {};
  
  return {
    from: auth.from || receipt.from || null,
    to: auth.to || receipt.to || null,
    amount: auth.value || auth.amount || receipt.amount || null,
    token: auth.asset || receipt.token || USDC_BASE_ADDRESS,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      serviceName,
      payer,
      feeReceipt,
      serviceReceipt,
      feeAmount,
      servicePrice,
      type, // 'external' or 'internal'
    } = body;

    if (!serviceId || !serviceName || !payer) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, serviceName, payer' },
        { status: 400 }
      );
    }

    // Decode receipts
    const decodedFeeReceipt = decodePaymentReceipt(feeReceipt);
    const decodedServiceReceipt = decodePaymentReceipt(serviceReceipt);

    // Ensure service exists - handle migration not applied
    let service;
    try {
      service = await prisma.service.findUnique({
        where: { serviceId },
      });
    } catch (error: any) {
      // If migration not applied, query with select
      if (error.code === 'P2022' || error.message?.includes('does not exist')) {
        service = await prisma.service.findUnique({
          where: { serviceId },
          select: {
            id: true,
            serviceId: true,
            name: true,
            description: true,
            category: true,
            merchant: true,
            network: true,
            chainId: true,
            token: true,
            tokenSymbol: true,
            price: true,
            priceDisplay: true,
            endpoint: true,
            available: true,
            metadata: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      } else {
        throw error;
      }
    }

    if (!service) {
      // Create service if it doesn't exist
      const priceWei = parseUnits(servicePrice || '0', USDC_DECIMALS).toString();
      service = await prisma.service.create({
        data: {
          serviceId,
          name: serviceName,
          description: `Purchased service: ${serviceName}`,
          category: 'Other',
          merchant: payer.toLowerCase(), // Use payer as merchant for now
          network: 'base',
          chainId: 8453,
          token: USDC_BASE_ADDRESS,
          tokenSymbol: 'USDC',
          price: priceWei,
          priceDisplay: servicePrice || '0',
          available: true,
        },
      });
    }

    const transactions: any[] = [];

    // Log fee transaction (if external service)
    if (type === 'external' && decodedFeeReceipt && feeAmount) {
      const feeHash = extractTransactionHash(decodedFeeReceipt);
      const feeDetails = extractPaymentDetails(decodedFeeReceipt);

      if (feeHash) {
        // Check if transaction already exists
        const existingFeeTx = await prisma.transaction.findUnique({
          where: { transactionHash: feeHash },
        });

        if (!existingFeeTx) {
          const feeAmountWei = parseUnits(feeAmount, USDC_DECIMALS).toString();
          
          // Create platform fee service if needed - handle migration not applied
          let feeService;
          try {
            feeService = await prisma.service.findUnique({
              where: { serviceId: 'platform-fee' },
            });
          } catch (error: any) {
            // If migration not applied, query with select
            if (error.code === 'P2022' || error.message?.includes('does not exist')) {
              feeService = await prisma.service.findUnique({
                where: { serviceId: 'platform-fee' },
                select: {
                  id: true,
                  serviceId: true,
                  name: true,
                  description: true,
                  category: true,
                  merchant: true,
                  network: true,
                  chainId: true,
                  token: true,
                  tokenSymbol: true,
                  price: true,
                  priceDisplay: true,
                  endpoint: true,
                  available: true,
                  metadata: true,
                  createdAt: true,
                  updatedAt: true,
                },
              });
            } else {
              throw error;
            }
          }

          if (!feeService) {
            feeService = await prisma.service.create({
              data: {
                serviceId: 'platform-fee',
                name: 'Platform Fee',
                description: 'Platform fee collection',
                category: 'Fee',
                merchant: process.env.MERCHANT_ADDRESS || payer.toLowerCase(),
                network: 'base',
                chainId: 8453,
                token: USDC_BASE_ADDRESS,
                tokenSymbol: 'USDC',
                price: feeAmountWei,
                priceDisplay: feeAmount,
                available: true,
              },
            });
          }

          const feeTx = await prisma.transaction.create({
            data: {
              serviceId: feeService.id,
              transactionHash: feeHash,
              from: feeDetails.from?.toLowerCase() || payer.toLowerCase(),
              to: feeDetails.to?.toLowerCase() || process.env.MERCHANT_ADDRESS?.toLowerCase() || payer.toLowerCase(),
              amount: feeDetails.amount || feeAmountWei,
              token: feeDetails.token || USDC_BASE_ADDRESS,
              chainId: 8453,
              feeAmount: feeAmountWei,
              merchantAmount: '0', // All goes to platform
              status: 'verified',
              verificationStatus: 'verified',
              verifiedAt: new Date(),
            },
          });

          transactions.push({ type: 'fee', id: feeTx.id });
        }
      }
    }

    // Log service transaction
    if (decodedServiceReceipt) {
      const serviceHash = extractTransactionHash(decodedServiceReceipt);
      const serviceDetails = extractPaymentDetails(decodedServiceReceipt);

      if (serviceHash) {
        // Check if transaction already exists
        const existingServiceTx = await prisma.transaction.findUnique({
          where: { transactionHash: serviceHash },
        });

        if (!existingServiceTx) {
          const servicePriceWei = parseUnits(servicePrice || '0', USDC_DECIMALS).toString();
          
          const serviceTx = await prisma.transaction.create({
            data: {
              serviceId: service.id,
              transactionHash: serviceHash,
              from: serviceDetails.from?.toLowerCase() || payer.toLowerCase(),
              to: serviceDetails.to?.toLowerCase() || service.merchant.toLowerCase(),
              amount: serviceDetails.amount || servicePriceWei,
              token: serviceDetails.token || USDC_BASE_ADDRESS,
              chainId: 8453,
              feeAmount: '0', // Fee handled separately for external services
              merchantAmount: serviceDetails.amount || servicePriceWei,
              status: 'verified',
              verificationStatus: 'verified',
              verifiedAt: new Date(),
            },
          });

          transactions.push({ type: 'service', id: serviceTx.id });
        }
      }
    }

    return NextResponse.json({
      success: true,
      transactions,
      message: `Logged ${transactions.length} transaction(s)`,
    });
  } catch (error: any) {
    console.error('[Purchase Log] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log purchase' },
      { status: 500 }
    );
  }
}

