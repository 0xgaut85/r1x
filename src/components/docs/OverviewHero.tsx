'use client';

import HeroBackground from '@/components/hero/HeroBackground';

export default function OverviewHero() {
  return (
    <section 
      className="relative min-h-[60vh] flex items-center justify-center overflow-hidden" 
      style={{ 
        backgroundColor: '#000000', 
        paddingTop: '120px', // Account for header (138.641px) + nav bar (~56px)
        paddingBottom: '80px',
        scrollMarginTop: '200px',
      }}
    >
      <HeroBackground />
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-[40px] relative z-10" style={{ maxWidth: 'none' }}>
        <h1 className="text-white text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px] mb-6" style={{ 
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.858px',
          color: '#FFFFFF',
          textAlign: 'start',
        }}>
          Documentation
        </h1>
        <p className="text-white text-lg sm:text-xl md:text-[22px] mb-8 max-w-3xl" style={{ 
          fontWeight: 400,
          fontFamily: 'TWKEverettMono-Regular, monospace',
          color: '#FFFFFF',
        }}>
          Everything you need to know about r1x and the machine economy. Build on x402, powered by Base, secured by blockchain. The infrastructure for autonomous machines.
        </p>
      </div>
    </section>
  );
}

