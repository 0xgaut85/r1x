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
      style={{ backgroundColor, paddingTop, paddingBottom, position: 'relative', zIndex: 1 }}
      className={className}
    >
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <div className="docs-section-content">
          {children}
        </div>
      </div>
    </section>
  );
}

