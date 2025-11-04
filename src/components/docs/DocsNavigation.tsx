'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <nav className="sticky top-[138.641px] z-40 docs-nav" style={{ backgroundColor: '#000000', borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]">
        <div className="flex items-center gap-8 overflow-x-auto py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/docs' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-all duration-200 whitespace-nowrap docs-nav-link"
                  style={{
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    position: 'relative',
                    paddingBottom: '8px',
                    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                    }
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
      </div>
    </nav>
  );
}

