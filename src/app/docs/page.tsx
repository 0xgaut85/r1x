'use client';

import OverviewHero from '@/components/docs/OverviewHero';
import OverviewFeatures from '@/components/docs/OverviewFeatures';
import OverviewRoadmap from '@/components/docs/OverviewRoadmap';
import TokenSection from '@/components/docs/TokenSection';

export default function DocsPage() {
  return (
    <>
      <OverviewHero />
      <OverviewFeatures />
      <OverviewRoadmap />
      <TokenSection />
    </>
  );
}
