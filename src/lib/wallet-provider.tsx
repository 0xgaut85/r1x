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
// - Always include Solana in the networks list so the modal can manage Solana accounts
// - If an override RPC URL is provided, apply it; otherwise use the default 'solana' network
const solanaRpcOverride =
  (typeof window === 'undefined'
    ? (process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL)
    : process.env.NEXT_PUBLIC_SOLANA_RPC_URL) || '';
const solanaNetwork: any =
  solanaRpcOverride && solanaRpcOverride.trim().startsWith('http')
    ? { ...(solana as any), rpcUrl: solanaRpcOverride.trim() }
    : (solana as any);

// Build networks array - include Solana up-front so the modal can reflect Solana state
const networks: any[] = [base, mainnet, solanaNetwork];

const wagmiAdapter = new WagmiAdapter({
  networks: networks as any,
  projectId, // Must be set in Railway before build
});

// Initialize SolanaAdapter up-front (per Reown docs), so modal can manage Solana connections
const solanaAdapter = new SolanaAdapter();

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.log('[WalletProvider] ✅ SolanaAdapter initialized with network:', (solanaNetwork as any)?.id);
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
  return solanaRpcOverride?.trim() || '';
}
