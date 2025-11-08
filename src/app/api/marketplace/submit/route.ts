/**
 * Marketplace Service Submission API
 * 
 * Allows merchants to submit their x402 services for listing
 * Validates endpoint via 402 preflight and creates service record
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { preflight402Endpoint } from '@/lib/marketplace/preflight';
import { parseUnits } from 'viem';

const USDC_DECIMALS = 6;
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      endpoint,
      name,
      description,
      category,
      websiteUrl,
      ownerAddress, // Wallet address of submitter
    } = body;

    // Validate required fields
    if (!endpoint || !name || !ownerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: endpoint, name, ownerAddress' },
        { status: 400 }
      );
    }

    // Validate endpoint format
    let endpointUrl: URL;
    try {
      endpointUrl = new URL(endpoint);
    } catch {
      return NextResponse.json(
        { error: 'Invalid endpoint URL format' },
        { status: 400 }
      );
    }

    if (endpointUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Endpoint must use HTTPS' },
        { status: 400 }
      );
    }

    // Check if service already exists (by endpoint)
    const existing = await prisma.service.findFirst({
      where: {
        endpoint: endpoint,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A service with this endpoint already exists', serviceId: existing.serviceId },
        { status: 409 }
      );
    }

    // Preflight 402 endpoint
    console.log(`[Marketplace Submit] Preflighting endpoint: ${endpoint}`);
    const preflight = await preflight402Endpoint(endpoint);

    if (!preflight.success || !preflight.schema) {
      return NextResponse.json(
        { 
          error: preflight.error || 'Preflight failed',
          details: 'The endpoint must return 402 Payment Required with a valid x402 schema. Please ensure your endpoint is x402-compatible.',
        },
        { status: 400 }
      );
    }

    // Extract price from maxAmountRequired
    const maxAmountWei = preflight.maxAmountRequired || '0';
    const priceDisplay = maxAmountWei !== '0' 
      ? (Number(maxAmountWei) / 10 ** USDC_DECIMALS).toFixed(6)
      : '0';

    // Generate serviceId from endpoint (sanitized)
    const serviceId = endpoint
      .replace(/^https?:\/\//, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Create service record
    const service = await prisma.service.create({
      data: ({
        serviceId,
        name,
        description: description || null,
        category: category || 'Other',
        merchant: preflight.payTo || ownerAddress.toLowerCase(),
        network: preflight.network || 'base',
        chainId: preflight.chainId || 8453,
        token: preflight.tokenAddress || USDC_BASE_ADDRESS,
        tokenSymbol: 'USDC',
        price: maxAmountWei,
        priceDisplay,
        endpoint,
        available: true,
        isExternal: true,
        source: 'selfserve',
        method: preflight.method || null,
        outputSchema: preflight.schema.outputSchema || null,
        inputSchema: preflight.schema.outputSchema?.input || null,
        ownerAddress: ownerAddress.toLowerCase(),
        approvalStatus: 'approved', // Auto-approve if preflight succeeds
        verified: false, // Will be set to true after ownership verification
        x402Ready: true,
        lastPreflightAt: new Date(),
        lastPreflightStatus: 'success',
        facilitatorUrl: preflight.facilitatorUrl || null,
        tokenAddress: preflight.tokenAddress || USDC_BASE_ADDRESS,
        payTo: preflight.payTo || null,
        websiteUrl: websiteUrl || null,
        metadata: {
          submittedAt: new Date().toISOString(),
          preflightResult: {
            method: preflight.method,
            network: preflight.network,
            chainId: preflight.chainId,
          },
        },
      } as any), // Cast until migration adds new fields to Prisma types
    });

    console.log(`[Marketplace Submit] Service created: ${service.serviceId}`);

    return NextResponse.json({
      success: true,
      serviceId: service.serviceId,
      message: 'Service submitted and approved successfully',
      verificationHint: preflight.payTo 
        ? `To verify ownership, sign a message with the address ${preflight.payTo} and submit via /api/marketplace/verify-ownership`
        : null,
    });
  } catch (error: any) {
    console.error('[Marketplace Submit] Error:', error);
    
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A service with this identifier already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to submit service' },
      { status: 500 }
    );
  }
}

