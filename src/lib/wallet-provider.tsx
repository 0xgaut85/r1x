'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { mainnet, base, solana } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';
import { getSolanaRpcUrl } from '@/lib/solana-rpc-config';
import { useEffect, useState } from 'react';

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

// Initialize with default RPC (will be updated at runtime)
const defaultSolanaRpc = 'https://api.mainnet-beta.solana.com';
let solanaRpcUrl = defaultSolanaRpc;
let appKitInitialized = false;

// Configure Solana network with RPC URL (will be updated at runtime)
const solanaNetwork = { 
  ...solana, 
  rpcUrl: solanaRpcUrl 
} as any;

const networks = [base, mainnet, solanaNetwork];

const wagmiAdapter = new WagmiAdapter({
  networks: networks as any,
  projectId,
});

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

// Initialize AppKit (will use default RPC initially, updated below)
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

appKitInitialized = true;

// Fetch RPC URL from Railway at runtime and update network config
if (typeof window !== 'undefined') {
  getSolanaRpcUrl()
    .then((rpcUrl) => {
      solanaRpcUrl = rpcUrl;
      
      // Update the network config
      solanaNetwork.rpcUrl = rpcUrl;
      
      // Log which RPC is being used
      const maskedRpc = rpcUrl.includes('quiknode')
        ? rpcUrl.replace(/\/[^\/]+\/[^\/]+\//, '/***/***/')
        : rpcUrl.includes('api-key')
        ? rpcUrl.replace(/api-key=[^&]+/, 'api-key=***')
        : rpcUrl;
      
      console.log('[WalletProvider] ✅ Solana RPC fetched from Railway:', maskedRpc);
      
      if (rpcUrl === defaultSolanaRpc) {
        console.error('[WalletProvider] ERROR: Using public Solana RPC (will fail). Set SOLANA_RPC_URL in Railway.');
      } else if (rpcUrl.includes('quiknode')) {
        console.log('[WalletProvider] ✅ Using QuickNode RPC from Railway');
      }
      
      // Update AppKit networks if possible (Reown might not support this, but try)
      // Note: Reown might require re-initialization, but this is the best we can do
      if (modal && (modal as any).setNetworks) {
        (modal as any).setNetworks([base, mainnet, solanaNetwork]);
      }
    })
    .catch((error) => {
      console.error('[WalletProvider] Failed to fetch Solana RPC URL:', error);
      console.warn('[WalletProvider] Using default RPC (will fail in browser)');
    });
}

// Export wagmiConfig directly from adapter (per Reown docs)
export const wagmiConfig = wagmiAdapter.wagmiConfig;

export { wagmiAdapter, queryClient };

// Export function to get current RPC URL
export async function getCurrentSolanaRpcUrl(): Promise<string> {
  return await getSolanaRpcUrl();
}
