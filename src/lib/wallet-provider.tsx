'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { mainnet, base, solana } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';

const projectId = 'ac7a5e22564f2698c80f05dbf4811d6a';

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

const networks = [base, mainnet, solana];

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

