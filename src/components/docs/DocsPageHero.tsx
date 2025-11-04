'use client';

interface DocsPageHeroProps {
  title: string;
  description: string;
}

export default function DocsPageHero({ title, description }: DocsPageHeroProps) {
  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden" 
      style={{ backgroundColor: '#000000', paddingTop: '60px', paddingBottom: '60px' }}
    >
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <h1 className="text-white text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px] mb-4" style={{ 
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.858px',
          color: '#FFFFFF',
          textAlign: 'start',
        }}>
          {title}
        </h1>
        <p className="text-white/85 text-lg sm:text-xl max-w-3xl" style={{ 
          fontWeight: 400,
          fontFamily: 'TWKEverettMono-Regular, monospace',
          color: 'rgba(255, 255, 255, 0.85)',
        }}>
          {description}
        </p>
      </div>
    </section>
  );
}

