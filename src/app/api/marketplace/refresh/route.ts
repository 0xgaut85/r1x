/**
 * Admin Marketplace Refresh Endpoint
 * 
 * POST /api/marketplace/refresh
 * Triggers refresh of services from PayAI facilitator and x402scan
 * Admin-only (can add auth later)
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncPayAIServices } from '@/lib/payai-sync';

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // For now, allow anyone to trigger refresh (can be secured later)
    
    console.log('[Marketplace Refresh] Triggering service sync...');
    
    const syncResult = await syncPayAIServices();
    
    return NextResponse.json({
      success: true,
      message: 'Marketplace refresh completed',
      synced: syncResult.synced,
      errors: syncResult.errors,
    });
  } catch (error: any) {
    console.error('[Marketplace Refresh] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to refresh marketplace',
      },
      { status: 500 }
    );
  }
}

