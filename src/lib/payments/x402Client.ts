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
   * For external services: calls service endpoint directly via x402
   * For internal services: uses Next.js API proxy (/api/x402/pay)
   */
  async purchaseService(
    service: {
      id: string; // Service ID
      name: string; // Service name
      endpoint: string; // Service endpoint
      price: string; // Price in USDC (decimal string)
      priceWithFee?: string; // Total price with fee
      isExternal?: boolean; // Whether service is external
    },
    requestBody?: any,
    queryParams?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<Response> {
    if (!service.endpoint) {
      throw new Error('Service endpoint is required');
    }

    if (!service.id || !service.name) {
      throw new Error('Service ID and name are required');
    }

    // Validate price doesn't exceed max
    const totalPrice = service.priceWithFee || service.price;
    const priceWei = BigInt(Math.ceil(parseFloat(totalPrice) * 10 ** USDC_DECIMALS));
    if (priceWei > this.maxValue) {
      throw new Error(
        `Service price (${totalPrice} USDC) exceeds maximum allowed (${Number(this.maxValue) / 10 ** USDC_DECIMALS} USDC)`
      );
    }

    // Build URL with query params if provided
    let url = service.endpoint;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      url = `${service.endpoint}${service.endpoint.includes('?') ? '&' : '?'}${params.toString()}`;
    }

    // For external services: call endpoint directly via x402
    // For internal services: use our proxy
    if (service.isExternal) {
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };
      
      return this.request(url, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody ? JSON.stringify(requestBody) : undefined,
      });
    } else {
      // Use Next.js API proxy for our services
      const basePrice = parseFloat(service.price);
      
      return this.request('/api/x402/pay', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          price: totalPrice,
          basePrice: basePrice.toString(),
          isExternal: false,
          endpoint: service.endpoint,
          ...(requestBody ? { requestBody } : {}),
          ...(queryParams ? { queryParams } : {}),
          ...(headers ? { headers } : {}),
        }),
      });
    }
  }

  /**
   * Get max value in USDC
   */
  getMaxValueUSDC(): number {
    return Number(this.maxValue) / 10 ** USDC_DECIMALS;
  }

  /**
   * Pay fee then purchase service (dual x402 payments)
   * Returns both responses with headers for receipt decoding
   */
  async payFeeThenPurchase(params: {
    feeEndpoint: string; // Full URL to fee endpoint (e.g., /api/fees/collect)
    feeAmount: string; // Fee amount in USDC (decimal string)
    service: {
      id: string;
      name: string;
      endpoint: string;
      price: string;
      priceWithFee?: string;
      isExternal?: boolean;
    };
    requestBody?: any;
    queryParams?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<{
    feeResponse: Response;
    serviceResponse: Response;
  }> {
    // Step 1: Pay fee via x402
    const feeResponse = await this.request(params.feeEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        feeAmount: params.feeAmount,
      }),
    });

    if (!feeResponse.ok) {
      throw new Error(`Fee payment failed: ${feeResponse.status} ${feeResponse.statusText}`);
    }

    // Step 2: Purchase service via x402
    const serviceResponse = await this.purchaseService(
      params.service, 
      params.requestBody,
      params.queryParams,
      params.headers
    );

    return {
      feeResponse,
      serviceResponse,
    };
  }
}

