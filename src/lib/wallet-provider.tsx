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

// Get Solana RPC URL from Railway env vars ONLY (no hardcoded fallbacks)
// Client-side: fetch from Railway API route at runtime
// Server-side: use env var directly
const getSolanaRpcUrlSync = (): string | null => {
  // Server-side: use env var directly
  if (typeof window === 'undefined') {
    const rpcUrl = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (!rpcUrl || !rpcUrl.trim().startsWith('http')) {
      console.error('[WalletProvider] SOLANA_RPC_URL not set or invalid in Railway');
      return null;
    }
    return rpcUrl.trim();
  }
  
  // Client-side: try NEXT_PUBLIC_* first (available at build time)
  const publicRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (publicRpcUrl && publicRpcUrl.trim().startsWith('http')) {
    return publicRpcUrl.trim();
  }
  
  // Not available synchronously - will fetch async
  return null;
};

let solanaRpcUrl: string | null = getSolanaRpcUrlSync();

// Only initialize Solana network if we have a valid RPC URL from Railway
// Otherwise, initialize without Solana and add it later when RPC URL is fetched
let solanaNetwork: any = null;
if (solanaRpcUrl && solanaRpcUrl.startsWith('http')) {
  solanaNetwork = { 
    ...solana, 
    rpcUrl: solanaRpcUrl
  } as any;
}

// Build networks array - only include Solana if we have RPC URL
const networks: any[] = [base, mainnet];
if (solanaNetwork) {
  networks.push(solanaNetwork);
}

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

// Client-side: Fetch RPC URL from Railway and add Solana network if not already added
if (typeof window !== 'undefined') {
  // If Solana network wasn't added initially, fetch RPC URL and add it
  if (!solanaNetwork) {
    getSolanaRpcUrl()
      .then((rpcUrl) => {
        if (!rpcUrl || !rpcUrl.startsWith('http')) {
          console.error('[WalletProvider] Invalid RPC URL from Railway:', rpcUrl);
          return;
        }
        
        solanaRpcUrl = rpcUrl.trim();
        const newSolanaNetwork = { 
          ...solana, 
          rpcUrl: solanaRpcUrl
        } as any;
        
        const maskedRpc = rpcUrl.includes('quiknode')
          ? rpcUrl.replace(/\/[^\/]+\/[^\/]+\//, '/***/***/')
          : rpcUrl.includes('api-key')
          ? rpcUrl.replace(/api-key=[^&]+/, 'api-key=***')
          : rpcUrl;
        
        console.log('[WalletProvider] ✅ Solana RPC fetched from Railway:', maskedRpc);
        
        // Try to update AppKit networks
        if ((modal as any).setNetworks) {
          (modal as any).setNetworks([base, mainnet, newSolanaNetwork]);
        }
      })
      .catch((error) => {
        console.error('[WalletProvider] Failed to fetch Solana RPC URL from Railway:', error);
        console.error('[WalletProvider] Make sure SOLANA_RPC_URL is set in Railway');
      });
  } else {
    // Solana network already added, but verify RPC URL is correct
    getSolanaRpcUrl()
      .then((rpcUrl) => {
        if (rpcUrl && rpcUrl.startsWith('http') && rpcUrl !== solanaRpcUrl) {
          solanaRpcUrl = rpcUrl.trim();
          if (solanaNetwork) {
            solanaNetwork.rpcUrl = solanaRpcUrl;
            
            const maskedRpc = rpcUrl.includes('quiknode')
              ? rpcUrl.replace(/\/[^\/]+\/[^\/]+\//, '/***/***/')
              : rpcUrl.includes('api-key')
              ? rpcUrl.replace(/api-key=[^&]+/, 'api-key=***')
              : rpcUrl;
            
            console.log('[WalletProvider] ✅ Solana RPC updated from Railway:', maskedRpc);
            
            // Try to update AppKit networks
            if ((modal as any).setNetworks) {
              (modal as any).setNetworks([base, mainnet, solanaNetwork]);
            }
          }
        }
      })
      .catch((error) => {
        console.error('[WalletProvider] Failed to fetch Solana RPC URL from Railway:', error);
      });
  }
}

// Export wagmiConfig directly from adapter (per Reown docs)
export const wagmiConfig = wagmiAdapter.wagmiConfig;

export { wagmiAdapter, queryClient };

// Export function to get current RPC URL
export async function getCurrentSolanaRpcUrl(): Promise<string> {
  return await getSolanaRpcUrl();
}
