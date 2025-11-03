/**
 * x402 Payment Integration Types
 * 
 * Based on HTTP 402 Payment Required standard and PayAI facilitator integration
 * Network: Base (chainId: 8453)
 * Token: USDC
 */

export interface PaymentQuote {
  amount: string; // Amount in USDC (wei units)
  token: string; // Token contract address (USDC on Base)
  merchant: string; // Merchant address
  facilitator?: string; // PayAI facilitator contract address (if payments go through facilitator)
  deadline: number; // Unix timestamp
  nonce: string; // Unique payment identifier
  chainId: number; // Base chain ID: 8453
}

export interface PaymentProof {
  transactionHash: string;
  blockNumber: number;
  from: string;
  to: string;
  amount: string;
  token: string;
  timestamp: number;
}

export interface PaymentRequest {
  quote: PaymentQuote;
  proof?: PaymentProof; // If retrying with payment proof
}

export interface FacilitatorVerifyRequest {
  transactionHash: string;
  chainId: number;
  token: string;
  amount: string;
  merchant: string;
  payer: string;
}

export interface FacilitatorVerifyResponse {
  verified: boolean;
  reason?: string;
  settlement?: {
    transactionHash: string;
    blockNumber: number;
  };
}

export interface FacilitatorSettleRequest {
  transactionHash: string;
  chainId: number;
  token: string;
  amount: string;
  merchant: string;
  payer: string;
}

export interface FacilitatorSettleResponse {
  success: boolean;
  settlementHash?: string;
  reason?: string;
}

export interface MerchantFeeConfig {
  feePercentage: number; // Fee percentage (e.g., 5 for 5%)
  feeRecipient: string; // r1x wallet address to receive fees
  network: 'base'; // Network identifier
}

export interface PaymentStatus {
  status: 'pending' | 'verified' | 'settled' | 'failed';
  transactionHash?: string;
  settlementHash?: string;
  amount: string;
  fee: string;
  merchantAmount: string; // Amount after fee deduction
  timestamp: number;
}

export interface MarketplaceService {
  id: string;
  name: string;
  description: string;
  price: string; // Price in USDC
  merchant: string; // Service provider address
  category: string;
  endpoint?: string; // API endpoint if applicable
  available: boolean;
}

