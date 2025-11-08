'use client';

import OverviewHero from '@/components/docs/OverviewHero';
import DocsNavigation from '@/components/docs/DocsNavigation';
import OverviewFeatures from '@/components/docs/OverviewFeatures';
import OverviewRoadmap from '@/components/docs/OverviewRoadmap';
import TokenSection from '@/components/docs/TokenSection';

export const dynamic = 'force-dynamic';

export default function DocsPage() {
  return (
    <>
      <OverviewHero />
      <DocsNavigation />
      <OverviewFeatures />
      <OverviewRoadmap />
      <TokenSection />
    </>
  );
}
