'use client';

interface DocsPageHeroProps {
  title: string;
  description: string;
}

export default function DocsPageHero({ title, description }: DocsPageHeroProps) {
  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden docs-page-hero pt-24 pb-12 sm:pt-32 sm:pb-16 md:pt-[180px] md:pb-20" 
      style={{ 
        backgroundColor: '#000000', 
        scrollMarginTop: '120px',
      }}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-[40px] max-w-full" style={{ opacity: 1, visibility: 'visible', position: 'relative', zIndex: 10 }}>
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[46.45px] leading-tight md:leading-[51.095px] mb-3 sm:mb-4" style={{ 
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-0.8px',
          color: '#FFFFFF',
          textAlign: 'start',
          opacity: 1,
          visibility: 'visible',
        }}>
          {title}
        </h1>
        <p className="text-white/85 text-base sm:text-lg md:text-xl max-w-3xl" style={{ 
          fontWeight: 400,
          fontFamily: 'TWKEverettMono-Regular, monospace',
          color: 'rgba(255, 255, 255, 0.85)',
          opacity: 1,
          visibility: 'visible',
        }}>
          {description}
        </p>
      </div>
    </section>
  );
}

