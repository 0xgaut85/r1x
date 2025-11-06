'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/docs', label: 'Overview' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: '/docs/r1x-agent', label: 'r1x Agent' },
  { href: '/docs/marketplace', label: 'Marketplace' },
  { href: '/docs/r1x-token', label: '$R1X Token' },
  { href: '/docs/agent-builder', label: 'Agent Builder' },
  { href: '/docs/sdk', label: 'SDK' },
  { href: '/docs/facilitator', label: 'Facilitator' },
  { href: '/docs/x402-creator', label: 'x402 Creator' },
  { href: '/docs/panels', label: 'Panels' },
  { href: '/docs/api', label: 'API Reference' },
];

export default function DocsNavigation() {
  const pathname = usePathname();

  return (
    <nav className="docs-subnav" style={{ backgroundColor: 'transparent', borderBottom: '1px solid #E5E7EB' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]">
        <div className="flex items-center gap-8 overflow-x-auto py-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/docs' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="transition-all duration-200 whitespace-nowrap docs-subnav-link"
                style={{
                  fontFamily: 'TWKEverettMono-Regular, monospace',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  position: 'relative',
                  paddingBottom: '10px',
                  color: isActive ? '#000000' : 'rgba(0, 0, 0, 0.6)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(0, 0, 0, 0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(0, 0, 0, 0.6)';
                  }
                }}
              >
                {item.label}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ height: '2px', backgroundColor: '#FF4D00' }}
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

