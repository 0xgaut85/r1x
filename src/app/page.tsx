import type { Metadata } from 'next';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ThesisSection from '@/components/ThesisSection';
import RoboticsUseCasesSection from '@/components/RoboticsUseCasesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import AnatomyOfNodeSection from '@/components/AnatomyOfNodeSection';
import DemosSection from '@/components/DemosSection';
import EventSection from '@/components/EventSection';
import CareersSection from '@/components/CareersSection';
import Footer from '@/components/Footer';

// Explicit metadata for this page to ensure x402scan can scrape it
export const metadata: Metadata = {
  title: "server.r1xlabs.com",
  description: "From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy.",
  openGraph: {
    title: "server.r1xlabs.com",
    description: "From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy.",
    siteName: 'R1X Labs',
    type: 'website',
    url: 'https://server.r1xlabs.com/',
    images: [
      {
        url: 'https://server.r1xlabs.com/api/logo',
        width: 1200,
        height: 630,
        alt: 'R1X Labs',
      },
    ],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px] overflow-x-hidden">
        <HeroSection />
        <ThesisSection />
        <RoboticsUseCasesSection />
        <HowItWorksSection />
        <AnatomyOfNodeSection />
        <DemosSection />
        <EventSection />
        <CareersSection />
      </main>
      <Footer />
    </div>
  );
}
