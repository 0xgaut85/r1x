'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { mainnet, base, solana } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';
import { getSolanaRpcUrl } from '@/lib/solana-rpc-config';

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

// Get Solana RPC URL - hardcoded in Dockerfile, available at build time
// NEXT_PUBLIC_SOLANA_RPC_URL is hardcoded in Dockerfile with QuickNode URL
const getSolanaRpcUrlSync = (): string | null => {
  // Server-side: use env var directly (from Railway or Dockerfile default)
  if (typeof window === 'undefined') {
    const rpcUrl = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (!rpcUrl || !rpcUrl.trim().startsWith('http')) {
      console.error('[WalletProvider] SOLANA_RPC_URL not set or invalid');
      return null;
    }
    return rpcUrl.trim();
  }
  
  // Client-side: NEXT_PUBLIC_SOLANA_RPC_URL is hardcoded in Dockerfile and embedded at build time
  const publicRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (publicRpcUrl && publicRpcUrl.trim().startsWith('http')) {
    return publicRpcUrl.trim();
  }
  
  // Should not happen if Dockerfile is correct, but fallback to async fetch
  console.warn('[WalletProvider] NEXT_PUBLIC_SOLANA_RPC_URL not available at build time - will fetch async');
  return null;
};

let solanaRpcUrl: string | null = getSolanaRpcUrlSync();

// Debug logging to verify RPC URL is available
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.log('[WalletProvider] NEXT_PUBLIC_SOLANA_RPC_URL:', process.env.NEXT_PUBLIC_SOLANA_RPC_URL ? 'SET' : 'NOT SET');
  console.log('[WalletProvider] solanaRpcUrl from sync:', solanaRpcUrl ? solanaRpcUrl.substring(0, 50) + '...' : 'NULL');
}

// Only initialize Solana network if we have a valid RPC URL from Railway
// IMPORTANT: Don't spread ...solana as it might have an invalid default RPC URL
// Create a fresh network object with ONLY our valid RPC URL
let solanaNetwork: any = null;
if (solanaRpcUrl && solanaRpcUrl.trim().startsWith('http')) {
  // Ensure RPC URL is trimmed and valid
  const cleanRpcUrl = solanaRpcUrl.trim();
  
  // Create network object explicitly - don't spread solana to avoid inheriting bad defaults
  solanaNetwork = {
    id: 'solana',
    name: 'Solana',
    nativeCurrency: {
      name: 'SOL',
      symbol: 'SOL',
      decimals: 9,
    },
    rpcUrl: cleanRpcUrl, // Explicitly set our QuickNode RPC URL
  } as any;
  
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.log('[WalletProvider] ✅ Solana network initialized with RPC URL:', cleanRpcUrl.substring(0, 50) + '...');
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn('[WalletProvider] ⚠️ Solana network NOT initialized - RPC URL not available:', solanaRpcUrl);
  }
}

// Build networks array - only include Solana if we have RPC URL
const networks: any[] = [base, mainnet];
if (solanaNetwork) {
  networks.push(solanaNetwork);
}

const wagmiAdapter = new WagmiAdapter({
  networks: networks as any,
  projectId, // Must be set in Railway before build
});

// Only initialize SolanaAdapter if we have a valid RPC URL AND network
// This prevents "Endpoint URL must start with http:" errors
// SolanaAdapter reads RPC URL from the networks array passed to createAppKit
// If solanaNetwork is null, SolanaAdapter won't be initialized, preventing errors
const solanaAdapter = solanaNetwork && solanaNetwork.rpcUrl && solanaNetwork.rpcUrl.startsWith('http') 
  ? new SolanaAdapter() 
  : null;

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  if (solanaAdapter) {
    console.log('[WalletProvider] ✅ SolanaAdapter initialized');
  } else {
    console.warn('[WalletProvider] ⚠️ SolanaAdapter NOT initialized - no valid RPC URL');
  }
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

// Initialize AppKit - projectId must be set in Railway before build
// Only include SolanaAdapter if we have a valid RPC URL
const adapters: any[] = [wagmiAdapter];
if (solanaAdapter) {
  adapters.push(solanaAdapter);
}

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

// Client-side: Fetch RPC URL from Railway and add Solana network/adapter if not already added
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
        // Create network object explicitly - don't spread solana to avoid inheriting bad defaults
        const newSolanaNetwork = {
          id: 'solana',
          name: 'Solana',
          nativeCurrency: {
            name: 'SOL',
            symbol: 'SOL',
            decimals: 9,
          },
          rpcUrl: solanaRpcUrl, // Explicitly set our QuickNode RPC URL
        } as any;
        
        const maskedRpc = rpcUrl.includes('quiknode')
          ? rpcUrl.replace(/\/[^\/]+\/[^\/]+\//, '/***/***/')
          : rpcUrl.includes('api-key')
          ? rpcUrl.replace(/api-key=[^&]+/, 'api-key=***')
          : rpcUrl;
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('[WalletProvider] ✅ Solana RPC fetched from Railway:', maskedRpc);
        }
        
        // Initialize SolanaAdapter now that we have a valid RPC URL
        const newSolanaAdapter = new SolanaAdapter();
        
        // Update AppKit with Solana network and adapter
        if ((modal as any).setNetworks) {
          (modal as any).setNetworks([base, mainnet, newSolanaNetwork]);
        }
        // Note: Reown AppKit doesn't support adding adapters dynamically after initialization
        // The adapter will be available on next page load when NEXT_PUBLIC_SOLANA_RPC_URL is set
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
            
            if (process.env.NODE_ENV !== 'production') {
              console.log('[WalletProvider] ✅ Solana RPC updated from Railway:', maskedRpc);
            }
            
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
