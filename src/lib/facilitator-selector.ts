/**
 * Facilitator Selector
 * 
 * Selects the appropriate x402 facilitator based on network:
 * - PayAI for EVM networks (Base, Polygon, etc.)
 * - PayAI for Solana network (via x402-solana package)
 * 
 * Following official facilitator APIs:
 * - PayAI: https://docs.payai.network/x402/facilitators/introduction
 * - x402-solana: https://github.com/payainetwork/x402-solana
 */

export type Network = 'base' | 'solana' | 'polygon' | 'base-sepolia';
export type FacilitatorType = 'payai';

export interface FacilitatorConfig {
  type: FacilitatorType;
  url: string;
  network: Network;
  chainId?: number;
  // Optional auth headers creator (for PayAI CDP keys)
  createAuthHeaders?: () => Promise<{
    verify: Record<string, string>;
    settle: Record<string, string>;
    supported: Record<string, string>;
    list?: Record<string, string>;
  }>;
}

/**
 * Get facilitator configuration for a given network
 * Both EVM and Solana networks use PayAI facilitator
 */
export function getFacilitatorConfig(network: Network): FacilitatorConfig {
  // All networks (EVM and Solana) use PayAI facilitator
  const payaiUrl = process.env.FACILITATOR_URL;
  if (!payaiUrl) {
    throw new Error('FACILITATOR_URL not set in Railway. Required for all networks.');
  }
  
  const config: FacilitatorConfig = {
    type: 'payai',
    url: payaiUrl,
    network,
  };

  // Add chain ID for EVM networks (Solana uses chainId 0)
  if (network === 'base') {
    config.chainId = 8453;
  } else if (network === 'base-sepolia') {
    config.chainId = 84532;
  } else if (network === 'polygon') {
    config.chainId = 137;
  } else if (network === 'solana') {
    config.chainId = 0; // Solana uses chainId 0
  }

  // Add CDP API key authentication for PayAI (required for Base mainnet)
  const cdpApiKeyId = process.env.CDP_API_KEY_ID;
  const cdpApiKeySecret = process.env.CDP_API_KEY_SECRET;
  
  if (cdpApiKeyId && cdpApiKeySecret && network === 'base') {
    config.createAuthHeaders = async () => {
      const basicAuth = Buffer.from(`${cdpApiKeyId}:${cdpApiKeySecret}`).toString('base64');
      const header = { Authorization: `Basic ${basicAuth}` };
      return {
        verify: header,
        settle: header,
        supported: header,
        list: header,
      };
    };
  }

  return config;
}

/**
 * Check if a network is EVM-based (uses PayAI)
 */
export function isEVMNetwork(network: Network): boolean {
  return network !== 'solana';
}

/**
 * Check if a network is Solana-based (uses PayAI via x402-solana)
 */
export function isSolanaNetwork(network: Network): boolean {
  return network === 'solana';
}

