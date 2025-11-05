'use client';

import dynamicImport from 'next/dynamic';
import { metadata } from './metadata';

// Dynamically import the wallet-dependent component with SSR disabled
const R1xAgentContent = dynamicImport(() => import('./R1xAgentContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4D00]"></div>
    </div>
  ),
});

export default function R1xAgentPage() {
  return <R1xAgentContent />;
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
