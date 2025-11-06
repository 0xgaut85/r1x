'use client';

import { ReactNode } from 'react';

interface DocsSectionProps {
  children: ReactNode;
  className?: string;
  backgroundColor?: string;
  paddingTop?: string;
  paddingBottom?: string;
}

export default function DocsSection({ 
  children, 
  className = '', 
  backgroundColor = '#F7F7F7',
  paddingTop = '100px',
  paddingBottom = '80px',
}: DocsSectionProps) {
  return (
    <section 
      style={{ 
        backgroundColor, 
        paddingTop: '60px',
        paddingBottom: '60px',
        position: 'relative', 
        zIndex: 1 
      }}
      className={`${className} sm:pt-[80px] sm:pb-[70px] md:pt-[100px] md:pb-[80px]`}
    >
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-[40px] w-full" style={{ maxWidth: 'none' }}>
        <div className="docs-section-content w-full">
          {children}
        </div>
      </div>
    </section>
  );
}

