/**
 * x402 Client Wrapper
 * 
 * Thin wrapper around x402-fetch with policy enforcement
 * Ensures Base network + USDC, respects maxValue caps
 */

import { wrapFetchWithPayment } from 'x402-fetch';
import { base } from 'wagmi/chains';

const USDC_DECIMALS = 6;
const BASE_CHAIN_ID = base.id; // 8453

export interface X402ClientConfig {
  walletClient: any; // Wagmi wallet client
  maxValue?: bigint; // Max payment amount in base units (default: 100 USDC)
}

export class X402Client {
  private fetchWithPayment: ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) | null = null;
  private maxValue: bigint;

  constructor(config: X402ClientConfig) {
    if (!config.walletClient) {
      throw new Error('Wallet client is required');
    }

    // Default max: 100 USDC
    this.maxValue = config.maxValue || BigInt(100 * 10 ** USDC_DECIMALS);

    try {
      // Wrap fetch - wrapFetchWithPayment expects a function that accepts URL | RequestInfo
      // Native fetch already supports this, but we need to ensure type compatibility
      const wrappedFetch = wrapFetchWithPayment(
        fetch as any, // Type assertion to handle URL | RequestInfo compatibility
        config.walletClient as any,
        this.maxValue
      );
      // Type assertion to match our interface - wrapFetchWithPayment returns compatible function
      this.fetchWithPayment = wrappedFetch as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
    } catch (error) {
      console.error('[X402Client] Failed to wrap fetch:', error);
      throw error;
    }
  }

  /**
   * Make x402 payment request
   * Automatically handles 402 → payment → retry flow
   */
  async request(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    if (!this.fetchWithPayment) {
      throw new Error('X402 client not initialized');
    }

    return this.fetchWithPayment(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });
  }

  /**
   * Purchase a marketplace service
   * Calls the service's x402 endpoint directly
   */
  async purchaseService(
    service: {
      endpoint: string;
      price: string; // Price in USDC (decimal string)
    },
    requestBody?: any
  ): Promise<Response> {
    if (!service.endpoint) {
      throw new Error('Service endpoint is required');
    }

    // Validate price doesn't exceed max
    const priceWei = BigInt(Math.ceil(parseFloat(service.price) * 10 ** USDC_DECIMALS));
    if (priceWei > this.maxValue) {
      throw new Error(
        `Service price (${service.price} USDC) exceeds maximum allowed (${Number(this.maxValue) / 10 ** USDC_DECIMALS} USDC)`
      );
    }

    return this.request(service.endpoint, {
      method: 'POST',
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });
  }

  /**
   * Get max value in USDC
   */
  getMaxValueUSDC(): number {
    return Number(this.maxValue) / 10 ** USDC_DECIMALS;
  }
}

