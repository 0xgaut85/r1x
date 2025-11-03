/**
 * x402 Payment Handler for r1x Agent
 * 
 * Extends the agent to handle payment requests for paid services
 * NOTE: This file is kept for potential future use, but payments are now handled by Express Railway server
 */

import { PaymentQuote, PaymentProof } from '@/lib/types/x402';
import { getX402ServerUrl } from './x402-server-url';

export interface AgentPaymentRequest {
  serviceId: string;
  amount: string;
  description?: string;
}

export interface AgentPaymentResponse {
  requiresPayment: boolean;
  quote?: PaymentQuote;
  proof?: PaymentProof;
  data?: any;
}

/**
 * Request access to a paid service via x402
 * Now uses Express Railway server
 */
export async function requestPaidService(
  serviceId: string,
  amount: string,
  paymentProof?: PaymentProof
): Promise<AgentPaymentResponse> {
  try {
    const requestBody: any = {
      serviceId,
      amount,
    };

    // Add payment proof if provided
    if (paymentProof) {
      requestBody.proof = paymentProof;
    }

    const x402ServerUrl = getX402ServerUrl();
    const response = await fetch(`${x402ServerUrl}/api/x402/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(paymentProof ? {
          'X-Payment': JSON.stringify(paymentProof),
        } : {}),
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 402) {
      // Payment required
      const data = await response.json();
      return {
        requiresPayment: true,
        quote: data.payment,
      };
    }

    if (response.ok) {
      // Payment verified, service fulfilled
      const data = await response.json();
      return {
        requiresPayment: false,
        data: data.data,
      };
    }

    throw new Error(`Service request failed: ${response.status}`);
  } catch (error: any) {
    console.error('Paid service request error:', error);
    throw error;
  }
}

/**
 * Generate payment message for agent chat
 */
export function generatePaymentMessage(quote: PaymentQuote, serviceName: string): string {
  const amount = parseFloat(quote.amount) / 1e6; // Convert from wei to USDC
  return `To access ${serviceName}, please approve a payment of ${amount} USDC on Base network.\n\n` +
    `Merchant: ${quote.merchant}\n` +
    `Amount: ${amount} USDC\n` +
    `Network: Base (Chain ID: ${quote.chainId})\n` +
    `\nAfter payment, retry your request with the transaction hash.`;
}

