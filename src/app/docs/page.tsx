'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocsHero from '@/components/docs/DocsHero';
import WhatR1xDoesSection from '@/components/docs/WhatR1xDoesSection';
import RoadmapSection from '@/components/docs/RoadmapSection';
import TokenSection from '@/components/docs/TokenSection';

export default function DocsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px]">
        <DocsHero />
        <WhatR1xDoesSection />
        <RoadmapSection />
        <TokenSection />
      </main>
      <Footer />
    </div>
  );
}
