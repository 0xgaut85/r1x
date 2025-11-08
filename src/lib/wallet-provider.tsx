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

// Ensure Solana RPC URL is always valid (never empty/undefined)
// Use QuickNode URL from Railway if available, otherwise fallback
const getInitialSolanaRpcUrl = (): string => {
  // Server-side: use env var directly (available at runtime)
  if (typeof window === 'undefined') {
    return process.env.SOLANA_RPC_URL || 
           process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
           'https://api.mainnet-beta.solana.com';
  }
  
  // Client-side: use fallback that's guaranteed to be valid
  // The real RPC URL will be fetched async and updated
  const fallback = 'https://api.mainnet-beta.solana.com';
  
  // Validate fallback is a proper URL
  if (!fallback.startsWith('http://') && !fallback.startsWith('https://')) {
    console.error('[WalletProvider] Invalid fallback RPC URL:', fallback);
    return 'https://api.mainnet-beta.solana.com'; // Force valid URL
  }
  
  return fallback;
};

let solanaRpcUrl = getInitialSolanaRpcUrl();

// Validate RPC URL before using it
if (!solanaRpcUrl || (!solanaRpcUrl.startsWith('http://') && !solanaRpcUrl.startsWith('https://'))) {
  console.error('[WalletProvider] Invalid RPC URL detected:', solanaRpcUrl);
  solanaRpcUrl = 'https://api.mainnet-beta.solana.com'; // Force valid URL
}

// Configure Solana network with RPC URL (always valid)
const solanaNetwork = { 
  ...solana, 
  rpcUrl: solanaRpcUrl.trim() // Ensure no whitespace
} as any;

// Validate network object before passing to Reown
if (!solanaNetwork.rpcUrl || (!solanaNetwork.rpcUrl.startsWith('http://') && !solanaNetwork.rpcUrl.startsWith('https://'))) {
  console.error('[WalletProvider] Invalid RPC URL in network config:', solanaNetwork.rpcUrl);
  solanaNetwork.rpcUrl = 'https://api.mainnet-beta.solana.com';
}

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
      // Validate fetched RPC URL
      if (!rpcUrl || (!rpcUrl.startsWith('http://') && !rpcUrl.startsWith('https://'))) {
        console.error('[WalletProvider] Invalid RPC URL fetched:', rpcUrl);
        return; // Don't update if invalid
      }
      
      if (rpcUrl !== solanaRpcUrl) {
        solanaRpcUrl = rpcUrl.trim();
        solanaNetwork.rpcUrl = solanaRpcUrl;
        
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
      // Keep using fallback RPC URL
    });
}

// Export wagmiConfig directly from adapter (per Reown docs)
export const wagmiConfig = wagmiAdapter.wagmiConfig;

export { wagmiAdapter, queryClient };

// Export function to get current RPC URL
export async function getCurrentSolanaRpcUrl(): Promise<string> {
  return await getSolanaRpcUrl();
}
