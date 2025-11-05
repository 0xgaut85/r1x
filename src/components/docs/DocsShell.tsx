'use client';

import { ReactNode } from 'react';
import DocsNavigation from './DocsNavigation';

interface DocsShellProps {
  children: ReactNode;
}

export default function DocsShell({ children }: DocsShellProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <DocsNavigation />
      <main className="pt-0" style={{ minHeight: 'calc(100vh - 138.641px)' }}>
        {children}
      </main>
    </div>
  );
}

