'use client';

import { ReactNode } from 'react';
import { FadeInUp } from '@/components/motion';

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
  paddingTop = '80px',
  paddingBottom = '80px',
}: DocsSectionProps) {
  return (
    <section 
      style={{ backgroundColor, paddingTop, paddingBottom }}
      className={className}
    >
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <FadeInUp>
          {children}
        </FadeInUp>
      </div>
    </section>
  );
}

