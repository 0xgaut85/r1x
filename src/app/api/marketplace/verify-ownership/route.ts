/**
 * Marketplace Ownership Verification API
 * 
 * Verifies that the submitter owns the payTo address from the 402 quote
 * Uses EIP-191 signature verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyMessage } from 'viem';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      signature,
      message,
    } = body;

    if (!serviceId || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, signature, message' },
        { status: 400 }
      );
    }

    // Find service
    const service = await prisma.service.findUnique({
      where: { serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    if (!(service as any).payTo) {
      return NextResponse.json(
        { error: 'Service does not have a payTo address to verify against' },
        { status: 400 }
      );
    }

    // Verify signature matches payTo address
    try {
      const ok = await verifyMessage({
        address: (service as any).payTo as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });

      if (!ok) {
        return NextResponse.json(
          { error: 'Signature does not match payTo address' },
          { status: 400 }
        );
      }

      // Update service to verified
      await prisma.service.update({
        where: { serviceId },
        data: ({
          verified: true,
          metadata: {
            ...(service.metadata as any || {}),
            verifiedAt: new Date().toISOString(),
            verificationMessage: message,
          },
        } as any),
      });

      return NextResponse.json({
        success: true,
        message: 'Ownership verified successfully',
      });
    } catch (verifyError: any) {
      console.error('[Verify Ownership] Signature verification error:', verifyError);
      return NextResponse.json(
        { error: `Signature verification failed: ${verifyError.message || 'Invalid signature'}` },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[Verify Ownership] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify ownership' },
      { status: 500 }
    );
  }
}

