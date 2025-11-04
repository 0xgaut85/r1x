'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FadeInUp } from '@/components/motion';

const navItems = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: '/docs/utilities', label: 'Utilities' },
  { href: '/docs/tutorials', label: 'Tutorials' },
  { href: '/docs/api', label: 'API Reference' },
];

export default function DocsNavigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-[138.641px] z-40" style={{ backgroundColor: '#000000', borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]">
        <FadeInUp>
          <div className="flex items-center gap-8 overflow-x-auto py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/docs' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/90'
                  }`}
                  style={{
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    position: 'relative',
                    paddingBottom: '8px',
                  }}
                >
                  {item.label}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: '2px',
                        backgroundColor: '#FF4D00',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </FadeInUp>
      </div>
    </nav>
  );
}

