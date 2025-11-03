import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ThesisSection from '@/components/ThesisSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import AnatomyOfNodeSection from '@/components/AnatomyOfNodeSection';
import DemosSection from '@/components/DemosSection';
import EventSection from '@/components/EventSection';
import LatestSection from '@/components/LatestSection';
import CareersSection from '@/components/CareersSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px]">
        <HeroSection />
        <ThesisSection />
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
