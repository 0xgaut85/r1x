'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { mainnet, base, solana } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';

// Inspect default solana network to understand its structure
// This helps ensure our custom network matches Reown's expectations
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.log('[WalletProvider] Default solana network from Reown:', {
    id: (solana as any)?.id,
    name: (solana as any)?.name,
    rpcUrl: (solana as any)?.rpcUrl ? 'SET (but may be invalid)' : 'NOT SET',
    hasRpcUrl: !!(solana as any)?.rpcUrl,
    keys: Object.keys(solana || {}),
  });
}

// Railway env vars are case-sensitive; use exact case
// IMPORTANT: NEXT_PUBLIC_* variables MUST be set in Railway BEFORE build
// They are embedded into the client bundle at build time
// If missing at build, the client bundle will have undefined values
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string | undefined;

if (!projectId) {
  // Fail fast at build time - Railway should set this before build
  const errorMsg = 'NEXT_PUBLIC_PROJECT_ID is required and must be set in Railway BEFORE build. NEXT_PUBLIC_* variables are embedded into the client bundle at build time.';
  console.error('[WalletProvider]', errorMsg);
  throw new Error(errorMsg);
}

// Use NEXT_PUBLIC_BASE_URL from Railway - MUST be set before build
// This is embedded into the client bundle at build time
const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : (process.env.NEXT_PUBLIC_BASE_URL || (() => {
      const errorMsg = 'NEXT_PUBLIC_BASE_URL is required and must be set in Railway BEFORE build. NEXT_PUBLIC_* variables are embedded into the client bundle at build time.';
      console.error('[WalletProvider]', errorMsg);
      throw new Error(errorMsg);
    })());

const metadata = {
  name: 'r1x',
  description: 'r1x - Machine Economy Infrastructure',
  url: baseUrl,
  icons: ['/logosvg.svg'],
};

// Solana network setup per Reown docs:
// - SolanaAdapter requires a valid HTTP/HTTPS RPC URL in the network configuration
// - If no override is provided, use public Solana RPC as fallback
// - Only include Solana adapter/network if we have a valid RPC URL
const solanaRpcOverride =
  (typeof window === 'undefined'
    ? (process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL)
    : process.env.NEXT_PUBLIC_SOLANA_RPC_URL) || '';

// Get default solana network RPC URL (may be undefined or invalid)
const defaultSolanaRpcUrl = (solana as any)?.rpcUrl;

// Determine final RPC URL: override > default > public fallback
let finalSolanaRpcUrl: string | null = null;
if (solanaRpcOverride && solanaRpcOverride.trim().startsWith('http')) {
  finalSolanaRpcUrl = solanaRpcOverride.trim();
} else if (defaultSolanaRpcUrl && typeof defaultSolanaRpcUrl === 'string' && defaultSolanaRpcUrl.startsWith('http')) {
  finalSolanaRpcUrl = defaultSolanaRpcUrl;
} else {
  // Fallback to public Solana RPC (rate-limited but works)
  finalSolanaRpcUrl = 'https://api.mainnet-beta.solana.com';
}

// Create Solana network with guaranteed valid RPC URL
const solanaNetwork: any = {
  ...(solana as any),
  rpcUrl: finalSolanaRpcUrl,
};

// Validate RPC URL before proceeding
if (!finalSolanaRpcUrl || !finalSolanaRpcUrl.startsWith('http')) {
  console.error('[WalletProvider] CRITICAL: Solana RPC URL is invalid:', finalSolanaRpcUrl);
  throw new Error('Solana RPC URL must be a valid HTTP/HTTPS URL');
}

// Build networks array - include Solana up-front so the modal can reflect Solana state
const networks: any[] = [base, mainnet, solanaNetwork];

const wagmiAdapter = new WagmiAdapter({
  networks: networks as any,
  projectId, // Must be set in Railway before build
});

// Initialize SolanaAdapter up-front (per Reown docs), so modal can manage Solana connections
// SolanaAdapter reads RPC URL from the network configuration
const solanaAdapter = new SolanaAdapter();

if (typeof window !== 'undefined') {
  const rpcSource = solanaRpcOverride && solanaRpcOverride.trim().startsWith('http')
    ? 'override (NEXT_PUBLIC_SOLANA_RPC_URL)'
    : defaultSolanaRpcUrl && typeof defaultSolanaRpcUrl === 'string' && defaultSolanaRpcUrl.startsWith('http')
    ? 'default (Reown solana network)'
    : 'fallback (public Solana RPC)';
  const maskedRpc = finalSolanaRpcUrl.includes('quiknode')
    ? finalSolanaRpcUrl.replace(/\/[^\/]+\/[^\/]+\//, '/***/***/')
    : finalSolanaRpcUrl.includes('api-key')
    ? finalSolanaRpcUrl.replace(/api-key=[^&]+/, 'api-key=***')
    : finalSolanaRpcUrl;
  console.log('[WalletProvider] ✅ SolanaAdapter initialized:', {
    networkId: (solanaNetwork as any)?.id,
    rpcSource,
    rpcUrl: maskedRpc.substring(0, 50) + (maskedRpc.length > 50 ? '...' : ''),
  });
}

// Create QueryClient with SSR-safe defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Initialize AppKit - include Wagmi + Solana adapters
const adapters: any[] = [wagmiAdapter, solanaAdapter];

export const modal = createAppKit({
  adapters,
  networks: networks as any,
  projectId, // Must be set in Railway before build
  metadata,
  features: {
    analytics: true,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FF4D00',
  },
});

// NOTE: Do not attempt to add adapters dynamically after initialization.
// Per Reown docs, include all adapters and networks up-front so the modal
// can reflect proper account state (including Solana) immediately.

// Export wagmiConfig directly from adapter (per Reown docs)
export const wagmiConfig = wagmiAdapter.wagmiConfig;

export { wagmiAdapter, queryClient };

// Export function to get current RPC URL
export async function getCurrentSolanaRpcUrl(): Promise<string> {
  return finalSolanaRpcUrl || '';
}
