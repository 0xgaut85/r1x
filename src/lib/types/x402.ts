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

/**
 * Solana-specific payment proof (signature-based)
 */
export interface SolanaPaymentProof {
  signature: string;
  from: string;
  to: string;
  amount: string; // atomic units (USDC = 6 decimals)
  token: string; // mint address (e.g., USDC mint)
  tokenSymbol?: string;
  timestamp?: number;
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
  network: 'base' | 'solana' | 'polygon' | 'base-sepolia'; // Network identifier
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
  price: string; // Base price in USDC (before fee)
  priceWithFee?: string; // Total price with 5% platform fee (for external services)
  merchant: string; // Service provider address
  category: string;
  endpoint?: string; // API endpoint if applicable
  websiteUrl?: string; // Website URL for screenshot preview
  screenshotUrl?: string; // Cached APIFLASH screenshot URL
  available: boolean;
  isExternal?: boolean; // true if from PayAI facilitator (external merchant)
  token?: string; // Token contract address
  tokenSymbol?: string; // Token symbol (e.g., "USDC")
  network?: string; // Network identifier (e.g., "base", "solana")
  chainId?: number; // Chain ID (e.g., 8453 for Base, undefined for Solana)
  x402Ready?: boolean; // true if endpoint returns valid 402
  verified?: boolean; // true if ownership verified
  source?: string; // Source: payai, x402scan, selfserve
}

