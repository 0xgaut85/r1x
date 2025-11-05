'use client';

import dynamicImport from 'next/dynamic';
import HeroSection from '@/components/HeroSection';
import ThesisSection from '@/components/ThesisSection';
import RoboticsUseCasesSection from '@/components/RoboticsUseCasesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import AnatomyOfNodeSection from '@/components/AnatomyOfNodeSection';
import DemosSection from '@/components/DemosSection';
import EventSection from '@/components/EventSection';
import LatestSection from '@/components/LatestSection';
import CareersSection from '@/components/CareersSection';
import Footer from '@/components/Footer';

const Header = dynamicImport(() => import('@/components/Header'), { ssr: false });

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px] overflow-x-hidden">
        <HeroSection />
        <ThesisSection />
        <RoboticsUseCasesSection />
        <HowItWorksSection />
        <AnatomyOfNodeSection />
        <DemosSection />
        <EventSection />
        <LatestSection />
        <CareersSection />
      </main>
      <Footer />
    </div>
  );
}
