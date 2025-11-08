'use client';

import { FadeInUp } from '@/components/motion';

export default function DocsHero() {
  return (
    <section 
      className="relative min-h-[60vh] flex items-center justify-center overflow-hidden docs-page-hero" 
      style={{ backgroundColor: '#000000', paddingTop: '200px', paddingBottom: '80px' }}
    >
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <FadeInUp>
          <h1 className="text-white text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px] mb-6" style={{ 
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.858px',
            color: 'rgb(255, 255, 255)',
            textAlign: 'start',
          }}>
            Documentation
          </h1>
          <p className="text-white text-lg sm:text-xl md:text-[22px] mb-8" style={{ 
            fontWeight: 400,
            fontFamily: 'TWKEverettMono-Regular, monospace',
            color: 'rgb(255, 255, 255)',
          }}>
            Everything you need to know about r1x and the machine economy
          </p>
        </FadeInUp>
      </div>
    </section>
  );
}

