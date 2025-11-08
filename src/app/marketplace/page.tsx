'use client';

import dynamic from 'next/dynamic';

// Export dynamically to prevent SSR issues with wagmi hooks
export default dynamic(() => import('./MarketplaceContent'), { ssr: false });
