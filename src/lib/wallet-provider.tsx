'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, base } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

const projectId = 'ac7a5e22564f2698c80f05dbf4811d6a';

const metadata = {
  name: 'r1x',
  description: 'r1x - Machine Economy Infrastructure',
  url: 'https://r1x.vercel.app',
  icons: ['/logo.svg'],
};

const networks = [base, mainnet];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});

const queryClient = new QueryClient();

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
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

export { wagmiAdapter, queryClient };

