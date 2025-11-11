'use client';

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';

// Solana-only modal for staking page
// This avoids conflicts with EVM wallets and focuses on Solana

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string | undefined;

if (!projectId) {
  console.warn('[SolanaWalletProvider] NEXT_PUBLIC_PROJECT_ID is not set. Wallet connection will not work.');
}

const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : (process.env.NEXT_PUBLIC_BASE_URL || 'https://r1xlabs.com');

const metadata = {
  name: 'r1x Staking',
  description: 'Stake R1X tokens on Solana',
  url: baseUrl,
  icons: ['/logosvg.svg'],
};

// Get Solana RPC URL
const solanaRpcOverride =
  (typeof window === 'undefined'
    ? (process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL)
    : process.env.NEXT_PUBLIC_SOLANA_RPC_URL) || '';

// Determine final RPC URL
let finalSolanaRpcUrl: string | null = null;
if (solanaRpcOverride && typeof solanaRpcOverride === 'string' && solanaRpcOverride.trim().startsWith('http')) {
  finalSolanaRpcUrl = solanaRpcOverride.trim();
} else {
  const defaultSolanaRpcUrl = (solana as any)?.rpcUrl;
  if (defaultSolanaRpcUrl && typeof defaultSolanaRpcUrl === 'string' && defaultSolanaRpcUrl.trim().startsWith('http')) {
    finalSolanaRpcUrl = defaultSolanaRpcUrl.trim();
  } else {
    finalSolanaRpcUrl = 'https://api.mainnet-beta.solana.com';
  }
}

// Validate RPC URL
if (!finalSolanaRpcUrl || typeof finalSolanaRpcUrl !== 'string' || !finalSolanaRpcUrl.startsWith('http')) {
  console.error('[SolanaWalletProvider] CRITICAL: Solana RPC URL is invalid:', finalSolanaRpcUrl);
  throw new Error('Solana RPC URL must be a valid HTTP/HTTPS URL');
}

// Create Solana network
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

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Initialize SolanaAdapter ONLY (no EVM adapters)
const solanaAdapter = new SolanaAdapter();

// Create Solana-only AppKit modal
export const solanaModal = createAppKit({
  adapters: [solanaAdapter],
  networks: [solanaNetwork] as any,
  projectId: projectId || 'placeholder-project-id',
  metadata,
  features: {
    analytics: true,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FF4D00',
  },
  customRpcUrls: {
    [(solana as any)?.caipNetworkId || (solanaNetwork as any)?.caipNetworkId || 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']: [
      { url: finalSolanaRpcUrl },
    ],
  },
} as any);

export { queryClient };

