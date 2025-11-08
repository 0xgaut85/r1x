/**
 * Purchase Result Logging API
 * 
 * Logs service results/outputs after successful purchase
 * Creates ServiceResult records linked to transactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
          console.warn('[Purchase Result Log] Failed to decode payment receipt:', headerValue.substring(0, 100));
          return null;
        }
      }
    }
  } catch (error) {
    console.error('[Purchase Result Log] Error decoding receipt:', error);
    return null;
  }
}

/**
 * Extract transaction hash from payment receipt
 */
function extractTransactionHash(receipt: any): string | null {
  if (!receipt) return null;
  return receipt.settlementHash ||
         receipt.settlement?.transactionHash ||
         receipt.transactionHash ||
         receipt.hash ||
         receipt.txHash ||
         receipt.payload?.authorization?.transactionHash ||
         null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      payer,
      serviceReceipt,
      contentType,
      resultJson,
      resultText,
      filename,
      metadata,
    } = body;

    if (!serviceId || !payer || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, payer, contentType' },
        { status: 400 }
      );
    }

    // Decode receipt to extract transaction hash
    const decodedReceipt = decodePaymentReceipt(serviceReceipt);
    const transactionHash = extractTransactionHash(decodedReceipt);

    // Ensure service exists
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
      return NextResponse.json(
        { error: `Service not found: ${serviceId}` },
        { status: 404 }
      );
    }

    // Try to find linked transaction by transactionHash
    let transactionId: string | null = null;
    if (transactionHash) {
      try {
        const transaction = await prisma.transaction.findUnique({
          where: { transactionHash },
          select: { id: true },
        });
        if (transaction) {
          transactionId = transaction.id;
        }
      } catch (error) {
        // Transaction may not exist yet, that's okay
        console.warn('[Purchase Result Log] Transaction not found yet:', transactionHash);
      }
    }

    // Truncate resultText if too long (keep first 50KB)
    const MAX_TEXT_LENGTH = 50 * 1024;
    const truncatedText = resultText && resultText.length > MAX_TEXT_LENGTH
      ? resultText.substring(0, MAX_TEXT_LENGTH) + '... [truncated]'
      : resultText;

    // Create ServiceResult
    const serviceResult = await (prisma as any).serviceResult.create({
      data: {
        transactionId,
        transactionHash,
        serviceId: service.id,
        payer: payer.toLowerCase(),
        contentType,
        resultText: truncatedText || null,
        resultJson: resultJson || null,
        filename: filename || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({
      success: true,
      resultId: serviceResult.id,
      message: 'Service result logged successfully',
    });
  } catch (error: any) {
    console.error('[Purchase Result Log] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log service result' },
      { status: 500 }
    );
  }
}

