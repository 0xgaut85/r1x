'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { mainnet, base, solana } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'ac7a5e22564f2698c80f05dbf4811d6a';

// Use NEXT_PUBLIC_BASE_URL or default to production URL
const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_BASE_URL || 'https://r1xlabs.com';

const metadata = {
  name: 'r1x',
  description: 'r1x - Machine Economy Infrastructure',
  url: baseUrl,
  icons: ['/logosvg.svg'],
};

// Ensure Solana network has a valid RPC URL to avoid "Endpoint URL must start with http/https"
const solanaRpcFromEnv = (process.env.NEXT_PUBLIC_SOLANA_RPC_URL || '').trim();
// Remove trailing slash if present (can cause issues)
const cleanedRpc = solanaRpcFromEnv.endsWith('/') ? solanaRpcFromEnv.slice(0, -1) : solanaRpcFromEnv;
// Ensure we always have a valid URL string (never empty or undefined)
const validSolanaRpc = cleanedRpc && (cleanedRpc.startsWith('http://') || cleanedRpc.startsWith('https://'))
  ? cleanedRpc
  : 'https://api.mainnet-beta.solana.com'; // fallback (will fail in browser - needs QuickNode)

// Log RPC being used (for debugging) - ALWAYS log to help debug build-time issues
if (typeof window !== 'undefined') {
  const maskedRpc = validSolanaRpc.includes('quiknode')
    ? validSolanaRpc.replace(/\/[^\/]+\/[^\/]+\//, '/***/***/')
    : validSolanaRpc.includes('api-key')
    ? validSolanaRpc.replace(/api-key=[^&]+/, 'api-key=***')
    : validSolanaRpc;
  console.log('[WalletProvider] Solana RPC from env:', process.env.NEXT_PUBLIC_SOLANA_RPC_URL ? 'SET (masked)' : 'NOT SET');
  console.log('[WalletProvider] Solana RPC being used:', maskedRpc);
  
  if (validSolanaRpc === 'https://api.mainnet-beta.solana.com') {
    console.error('[WalletProvider] ERROR: Using public Solana RPC (will fail). NEXT_PUBLIC_SOLANA_RPC_URL is not set or invalid. Set it in Railway and trigger a rebuild.');
  } else if (validSolanaRpc.includes('quiknode')) {
    console.log('[WalletProvider] ✅ Using QuickNode RPC');
  }
}

// Configure Solana network with RPC URL
const solanaNetwork = { 
  ...solana, 
  rpcUrl: validSolanaRpc 
} as any;

const networks = [base, mainnet, solanaNetwork];

const wagmiAdapter = new WagmiAdapter({
  networks: networks as any,
  projectId,
});

// SolanaAdapter reads RPC from the network object passed to createAppKit
// Ensure the network has rpcUrl set (which we do above)
const solanaAdapter = new SolanaAdapter();

// Create QueryClient with SSR-safe defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  networks: networks as any,
  projectId,
  metadata,
  features: {
    analytics: true,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FF4D00',
  },
});

// Export wagmiConfig directly from adapter (per Reown docs)
export const wagmiConfig = wagmiAdapter.wagmiConfig;

export { wagmiAdapter, queryClient };

