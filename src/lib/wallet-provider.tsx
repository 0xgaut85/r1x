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
  // Only warn, don't throw - allow build to complete
  // In production runtime, wallet features will fail gracefully
  const errorMsg = 'NEXT_PUBLIC_PROJECT_ID is not set. Wallet connection will not work. Set NEXT_PUBLIC_PROJECT_ID in Railway BEFORE build.';
  console.warn('[WalletProvider]', errorMsg);
}

// Use NEXT_PUBLIC_BASE_URL from Railway - MUST be set before build
// This is embedded into the client bundle at build time
const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : (process.env.NEXT_PUBLIC_BASE_URL || 'https://r1xlabs.com');

const metadata = {
  name: 'r1x',
  description: 'r1x - Machine Economy Infrastructure',
  url: baseUrl,
  icons: ['/logosvg.svg'],
};

// Solana network setup per Reown docs:
// - SolanaAdapter accepts optional rpcUrl parameter
// - If provided, use NEXT_PUBLIC_SOLANA_RPC_URL; otherwise use default solana network
// - Always ensure we have a valid HTTP/HTTPS RPC URL
const solanaRpcOverride =
  (typeof window === 'undefined'
    ? (process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL)
    : process.env.NEXT_PUBLIC_SOLANA_RPC_URL) || '';

// Determine final RPC URL: override > default > public fallback
let finalSolanaRpcUrl: string | null = null;
if (solanaRpcOverride && typeof solanaRpcOverride === 'string' && solanaRpcOverride.trim().startsWith('http')) {
  finalSolanaRpcUrl = solanaRpcOverride.trim();
} else {
  // Check default solana network RPC URL
  const defaultSolanaRpcUrl = (solana as any)?.rpcUrl;
  if (defaultSolanaRpcUrl && typeof defaultSolanaRpcUrl === 'string' && defaultSolanaRpcUrl.trim().startsWith('http')) {
    finalSolanaRpcUrl = defaultSolanaRpcUrl.trim();
  } else {
    // Fallback to public Solana RPC (rate-limited but works)
    finalSolanaRpcUrl = 'https://api.mainnet-beta.solana.com';
  }
}

// Validate RPC URL before proceeding
if (!finalSolanaRpcUrl || typeof finalSolanaRpcUrl !== 'string' || !finalSolanaRpcUrl.startsWith('http')) {
  console.error('[WalletProvider] CRITICAL: Solana RPC URL is invalid:', finalSolanaRpcUrl);
  throw new Error('Solana RPC URL must be a valid HTTP/HTTPS URL');
}

// Create Solana network with guaranteed valid RPC URL
// Construct explicitly to avoid inheriting stale defaults
const solanaNetwork: any = {
  id: (solana as any)?.id || 'solana',
  name: (solana as any)?.name || 'Solana',
  nativeCurrency: (solana as any)?.nativeCurrency || {
    name: 'SOL',
    symbol: 'SOL',
    decimals: 9,
  },
  rpcUrl: finalSolanaRpcUrl,
  ...(((solana as any)?.blockExplorerUrl && typeof (solana as any).blockExplorerUrl === 'string')
    ? { blockExplorerUrl: (solana as any).blockExplorerUrl }
    : {}),
};

// Build networks array - include Solana up-front so the modal can reflect Solana state
const networks: any[] = [base, mainnet, solanaNetwork];

const wagmiAdapter = new WagmiAdapter({
  networks: networks as any,
  projectId: projectId || 'placeholder-project-id', // Must be set in Railway before build
});

// Initialize SolanaAdapter (per Reown docs)
// SolanaAdapter reads RPC URL from the network configuration in createAppKit
// We ensure solanaNetwork has a valid rpcUrl above
// Configure SolanaAdapter to prioritize Phantom wallet
const solanaAdapter = new SolanaAdapter({
  // Prioritize Phantom wallet for better UX
  preferredWallets: ['phantom', 'solflare'],
});

if (typeof window !== 'undefined') {
  const defaultSolanaRpcUrl = (solana as any)?.rpcUrl;
  const rpcSource = solanaRpcOverride && typeof solanaRpcOverride === 'string' && solanaRpcOverride.trim().startsWith('http')
    ? 'override (NEXT_PUBLIC_SOLANA_RPC_URL)'
    : defaultSolanaRpcUrl && typeof defaultSolanaRpcUrl === 'string' && defaultSolanaRpcUrl.trim().startsWith('http')
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

// Final validation before creating AppKit - ensure Solana network has valid RPC URL
const solanaNetworkInArray = networks.find((n: any) => n?.id === 'solana' || n?.id === (solana as any)?.id);
if (solanaNetworkInArray) {
  const networkRpcUrl = solanaNetworkInArray.rpcUrl;
  if (!networkRpcUrl || typeof networkRpcUrl !== 'string' || !networkRpcUrl.startsWith('http')) {
    console.error('[WalletProvider] CRITICAL: Solana network in array has invalid RPC URL:', networkRpcUrl);
    solanaNetworkInArray.rpcUrl = finalSolanaRpcUrl; // Force fix it
  }
}

// Initialize AppKit - include Wagmi + Solana adapters
const adapters: any[] = [wagmiAdapter, solanaAdapter];

export const modal = createAppKit({
  adapters,
  networks: networks as any,
  projectId: projectId || 'placeholder-project-id', // Must be set in Railway before build
  metadata,
  features: {
    analytics: true,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FF4D00',
  },
  // Ensure AppKit uses our RPC at runtime as well (per Reown docs)
  // customRpcUrls expects CAIP-2 format and array of { url, config? }
  // Solana mainnet CAIP-2 ID: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
  customRpcUrls: {
    // Use the actual CAIP-2 network ID from Reown's solana network object
    [(solana as any)?.caipNetworkId || (solanaNetwork as any)?.caipNetworkId || 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']: [
      { url: finalSolanaRpcUrl },
    ],
  },
} as any);

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
