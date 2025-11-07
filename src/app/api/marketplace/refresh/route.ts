/**
 * Marketplace Service Refresh API
 * 
 * Re-preflights a service endpoint to check 402 status
 * Updates x402Ready flag based on preflight result
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { preflight402Endpoint } from '@/lib/marketplace/preflight';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing required field: serviceId' },
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

    if (!service.endpoint) {
      return NextResponse.json(
        { error: 'Service has no endpoint to preflight' },
        { status: 400 }
      );
    }

    // Preflight endpoint
    console.log(`[Marketplace Refresh] Preflighting service ${serviceId}: ${service.endpoint}`);
    const preflight = await preflight402Endpoint(service.endpoint);

    // Update service with preflight result
    await prisma.service.update({
      where: { serviceId },
      data: ({
        x402Ready: preflight.success,
        lastPreflightAt: new Date(),
        lastPreflightStatus: preflight.success ? 'success' : 'failed',
        // Update schema if preflight succeeded
        ...(preflight.success && preflight.schema ? {
          method: preflight.method || null,
          outputSchema: preflight.schema.outputSchema || null,
          inputSchema: preflight.schema.outputSchema?.input || null,
          payTo: preflight.payTo || null,
          facilitatorUrl: preflight.facilitatorUrl || null,
          tokenAddress: preflight.tokenAddress || null,
        } : {}),
      } as any), // Cast until migration adds fields
    });

    return NextResponse.json({
      success: true,
      x402Ready: preflight.success,
      message: preflight.success 
        ? 'Service is x402-ready' 
        : `Preflight failed: ${preflight.error || 'Unknown error'}`,
      error: preflight.error || null,
    });
  } catch (error: any) {
    console.error('[Marketplace Refresh] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh service' },
      { status: 500 }
    );
  }
}
