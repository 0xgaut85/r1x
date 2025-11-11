'use client';

import dynamicImport from 'next/dynamic';

// Dynamically import the wallet-dependent component with SSR disabled
const AgentBuilderContent = dynamicImport(() => import('./AgentBuilderContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4D00]"></div>
    </div>
  ),
});

export default function AgentBuilderPage() {
  return <AgentBuilderContent />;
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

