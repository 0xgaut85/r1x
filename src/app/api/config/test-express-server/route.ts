/**
 * Diagnostic endpoint to test Express server connectivity
 * Helps diagnose 502 errors by testing the connection directly
 */

import { NextResponse } from 'next/server';
import { getX402ServerUrl } from '@/lib/x402-server-url';

export async function GET() {
  try {
    const expressServerUrl = getX402ServerUrl();
    
    if (!expressServerUrl || expressServerUrl.includes('localhost')) {
      return NextResponse.json({
        error: 'Express server URL not configured for production',
        expressServerUrl: expressServerUrl || 'not set',
        message: 'X402_SERVER_URL must be set to your Railway Express service URL',
      }, { status: 500 });
    }

    const healthUrl = `${expressServerUrl}/health`;
    
    console.log('[Test Express Server] Testing connection to:', healthUrl);
    
    // Test health endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'r1x-diagnostics/1.0',
        },
      });
      
      clearTimeout(timeoutId);
      
      const responseText = await response.text().catch(() => 'Could not read response');
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
      
      return NextResponse.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        expressServerUrl: expressServerUrl,
        healthUrl: healthUrl,
        response: responseData,
        headers: Object.fromEntries(response.headers.entries()),
        message: response.ok 
          ? 'Express server is reachable and responding'
          : `Express server returned status ${response.status}`,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      const isTimeout = fetchError.name === 'AbortError';
      const isConnectionError = fetchError.message?.includes('ECONNREFUSED') || 
                                fetchError.message?.includes('ENOTFOUND') ||
                                fetchError.message?.includes('getaddrinfo') ||
                                fetchError.code === 'ECONNREFUSED' ||
                                fetchError.code === 'ENOTFOUND';
      
      return NextResponse.json({
        success: false,
        error: fetchError.name || 'Unknown error',
        message: fetchError.message || 'Failed to connect',
        code: fetchError.code,
        expressServerUrl: expressServerUrl,
        healthUrl: healthUrl,
        isTimeout: isTimeout,
        isConnectionError: isConnectionError,
        troubleshooting: isConnectionError ? [
          '1. Verify X402_SERVER_URL is set correctly in Railway',
          '2. Check Express service is running (Railway → Express Service → Status)',
          '3. Verify Express service URL matches X402_SERVER_URL',
          '4. Check Railway Express service logs for errors',
        ] : isTimeout ? [
          '1. Express server is not responding (may be down or overloaded)',
          '2. Check Railway Express service logs',
          '3. Restart Express service if needed',
        ] : [
          '1. Check Express server logs',
          '2. Verify network connectivity between services',
        ],
      }, { status: 502 });
    }
  } catch (error: any) {
    console.error('[Test Express Server] Unexpected error:', error);
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

