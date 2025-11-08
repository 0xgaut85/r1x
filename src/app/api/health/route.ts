import { NextResponse } from 'next/server';

/**
 * Simple health check endpoint for Railway
 * Railway health checks hit this endpoint to verify the service is running
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'r1x-nextjs',
    timestamp: new Date().toISOString(),
  });
}

