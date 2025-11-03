'use client';

import dynamic from 'next/dynamic';

// Dynamically import the component to avoid SSR issues with wagmi hooks
const R1xAgentClient = dynamic(() => import('@/components/r1x-agent-client'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-12 h-12 border-4 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function R1xAgentPage() {
  return <R1xAgentClient />;
}

// Disable SSR and static generation for this page
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
