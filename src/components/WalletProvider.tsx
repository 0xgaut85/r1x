'use client';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/wallet-provider';
import { useEffect, useState, useMemo } from 'react';

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Create QueryClient as a singleton per component instance
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: false,
          staleTime: 60 * 1000, // 1 minute
        },
      },
    });
  }, []);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Return children without providers during SSR to avoid hydration issues
  if (!mounted) {
    return <>{children}</>;
  }
  
  // Only render providers on client-side after mount
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

