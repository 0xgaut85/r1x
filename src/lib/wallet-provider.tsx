'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { mainnet, base, solana } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';
import { getSolanaRpcUrl } from '@/lib/solana-rpc-config';

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

// Fetch Solana RPC URL synchronously if possible, otherwise use fallback
let solanaRpcUrl = 'https://api.mainnet-beta.solana.com'; // Fallback

// Try to fetch RPC URL immediately (client-side only)
if (typeof window !== 'undefined') {
  // Fetch synchronously using cached value if available
  getSolanaRpcUrl()
    .then((rpcUrl) => {
      solanaRpcUrl = rpcUrl;
      console.log('[WalletProvider] ✅ Solana RPC fetched:', rpcUrl.includes('quiknode') ? 'QuickNode' : 'Other');
    })
    .catch(() => {
      console.warn('[WalletProvider] Using fallback RPC (will fetch async)');
    });
}

// Configure Solana network with RPC URL
// Note: This will be updated when RPC URL is fetched, but Reown reads it at init
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

// Initialize AppKit
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

// Update RPC URL after initialization (Reown might re-read it on connection)
if (typeof window !== 'undefined') {
  getSolanaRpcUrl()
    .then((rpcUrl) => {
      if (rpcUrl !== solanaRpcUrl) {
        solanaRpcUrl = rpcUrl;
        solanaNetwork.rpcUrl = rpcUrl;
        
        const maskedRpc = rpcUrl.includes('quiknode')
          ? rpcUrl.replace(/\/[^\/]+\/[^\/]+\//, '/***/***/')
          : rpcUrl.includes('api-key')
          ? rpcUrl.replace(/api-key=[^&]+/, 'api-key=***')
          : rpcUrl;
        
        console.log('[WalletProvider] ✅ Solana RPC updated from Railway:', maskedRpc);
        
        // Try to update AppKit networks (may not work, but worth trying)
        if ((modal as any).setNetworks) {
          (modal as any).setNetworks([base, mainnet, solanaNetwork]);
        }
      }
    })
    .catch((error) => {
      console.error('[WalletProvider] Failed to fetch Solana RPC URL:', error);
    });
}

// Export wagmiConfig directly from adapter (per Reown docs)
export const wagmiConfig = wagmiAdapter.wagmiConfig;

export { wagmiAdapter, queryClient };

// Export function to get current RPC URL
export async function getCurrentSolanaRpcUrl(): Promise<string> {
  return await getSolanaRpcUrl();
}
