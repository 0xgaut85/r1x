/**
 * PayAI Services Sync API Route
 * 
 * Syncs services from PayAI facilitator to database
 * Can be called manually or via cron job
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncPayAIServices } from '@/lib/payai-sync';

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization check here
    const authHeader = request.headers.get('authorization');
    if (process.env.SYNC_SECRET && authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting PayAI service sync...');
    const result = await syncPayAIServices();

    return NextResponse.json({
      success: true,
      synced: result.synced,
      errors: result.errors,
      message: result.synced > 0 
        ? `Synced ${result.synced} services, ${result.errors} errors`
        : `No services found. ${result.errors > 0 ? `${result.errors} errors. ` : ''}Seeded with example services.`,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync services' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Allow GET for testing purposes
  return POST(request);
}

