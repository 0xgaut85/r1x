'use client';

import dynamicImport from 'next/dynamic';
import Footer from '@/components/Footer';

const Header = dynamicImport(() => import('@/components/Header'), { ssr: false });

// Dynamically import the wallet-dependent component with SSR disabled
const UserPanelContent = dynamicImport(() => import('./UserPanelContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px]">
        <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4D00]"></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  ),
});

export default function UserPanelPage() {
  return <UserPanelContent />;
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

