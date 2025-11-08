/**
 * Server-side 402 preflight utility
 * Preflights x402 endpoints to extract schema and payment requirements
 */

export interface PreflightResult {
  success: boolean;
  schema?: any; // accepts[0] from 402 response
  method?: 'GET' | 'POST';
  payTo?: string;
  facilitatorUrl?: string;
  tokenAddress?: string;
  network?: string;
  chainId?: number;
  maxAmountRequired?: string;
  error?: string;
}

/**
 * Preflight an x402 endpoint (try POST then GET)
 * Returns the accepts[0] schema if 402 is returned
 */
export async function preflight402Endpoint(endpoint: string): Promise<PreflightResult> {
  try {
    // Validate endpoint URL
    let url: URL;
    try {
      url = new URL(endpoint);
    } catch {
      return {
        success: false,
        error: 'Invalid endpoint URL format',
      };
    }

    // Must be HTTPS
    if (url.protocol !== 'https:') {
      return {
        success: false,
        error: 'Endpoint must use HTTPS',
      };
    }

    // Try POST first
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(10000), // 10s timeout
      });
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
        return {
          success: false,
          error: 'Preflight timeout (endpoint did not respond within 10s)',
        };
      }
      return {
        success: false,
        error: `Preflight failed: ${fetchError.message || 'Network error'}`,
      };
    }

    // If not 402 on POST, try GET
    if (response.status !== 402) {
      try {
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
          return {
            success: false,
            error: 'Preflight timeout (endpoint did not respond within 10s)',
          };
        }
        return {
          success: false,
          error: `Preflight failed: ${fetchError.message || 'Network error'}`,
        };
      }
    }

    // Must return 402
    if (response.status !== 402) {
      return {
        success: false,
        error: `Endpoint did not return 402 Payment Required (got ${response.status}). This endpoint is not x402-compatible.`,
      };
    }

    // Parse 402 response body
    const raw = await response.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      // Try parsing x402 headers as fallback
      const xPaymentRequired = response.headers.get('x-payment-required') || response.headers.get('X-Payment-Required');
      const wwwAuthenticate = response.headers.get('www-authenticate') || response.headers.get('WWW-Authenticate');
      
      if (xPaymentRequired || wwwAuthenticate) {
        // Try to decode base64 if present
        try {
          const headerValue = xPaymentRequired || wwwAuthenticate;
          if (!headerValue) throw new Error('Missing x402 headers');
          if (headerValue.startsWith('x402 ')) {
            const base64Part = headerValue.substring(5);
            const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
            data = JSON.parse(decoded);
          } else {
            data = JSON.parse(headerValue);
          }
        } catch {
          return {
            success: false,
            error: 'Could not parse 402 response (neither body nor headers contain valid JSON)',
          };
        }
      } else {
        return {
          success: false,
          error: '402 response body is not valid JSON and no x402 headers found',
        };
      }
    }

    // Extract accepts[0] which contains the schema
    if (!data.accepts || !Array.isArray(data.accepts) || data.accepts.length === 0) {
      return {
        success: false,
        error: '402 response missing accepts array',
      };
    }

    const accept = data.accepts[0];

    // Extract key fields
    const network = accept.network || undefined;
    const chainId = accept.chainId || (network === 'base' ? 8453 : network === 'solana' ? 0 : undefined);

    const result: PreflightResult = {
      success: true,
      schema: accept,
      payTo: accept.payTo,
      facilitatorUrl: accept.facilitatorUrl || accept.facilitator,
      tokenAddress: accept.asset || accept.token,
      network,
      chainId,
      maxAmountRequired: accept.maxAmountRequired || accept.amount,
    };

    // Token warnings (do not fail)
    const USDC_BASE = '0x833589fCD6eDb6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase();
    if (result.network === 'base' && result.tokenAddress && result.tokenAddress.toLowerCase() !== USDC_BASE) {
      console.warn(`[Preflight] Base token is not USDC: ${result.tokenAddress}`);
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown preflight error',
    };
  }
}

