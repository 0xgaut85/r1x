'use client';

import { FadeInUp, StaggerChildren, StaggerChild } from '@/components/motion';
import DocsSection from './DocsSection';

const roadmapItems = [
  {
    phase: 'Q4 2025',
    title: 'Current Focus',
    items: [
      'Enterprise features & SSO‑less wallet flows',
      'White‑label marketplace & payouts',
      'Governance & fee configuration',
      '$R1X token launch on Solana',
      'Cross‑chain settlement research',
      'Strategic ecosystem partnerships',
    ],
  },
  {
    phase: 'Q1 2026',
    title: 'Expansion & Scale',
    items: [
      'r1x SDK public release',
      'RX1 Builder (no‑code) beta',
      'Service templates: inference, data window, compute job',
      'Enhanced analytics & receipts export',
      'Developer documentation & examples',
      'Agent budgets (per‑cap, per‑task)',
    ],
  },
  {
    phase: 'Q2 2026',
    title: 'Machine Economy',
    items: [
      'Pre‑authorized spend windows & allowances',
      'Machine‑to‑machine flows (X‑PAYMENT patterns)',
      'RX1 Builder marketplace publishing',
      'Robot & IoT integration kits',
      'Multi‑tenant billing & fee splits',
      'Advanced routing & fallback strategies',
    ],
  },
  {
    phase: 'Q3 2026',
    title: 'Global Adoption',
    items: [
      'DeFi treasury & yield routing',
      'Cross‑chain settlement implementation',
      'Enterprise partnerships',
      'Global market expansion',
      'Advanced governance features',
      'Ecosystem growth initiatives',
    ],
  },
];

export default function OverviewRoadmap() {
  return (
    <DocsSection backgroundColor="#000000">
      <h2 className="text-white text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px] mb-4" style={{
        fontWeight: 400,
        fontFamily: 'TWKEverett-Regular, sans-serif',
        letterSpacing: '-1.858px',
        color: 'rgb(255, 255, 255)',
        textAlign: 'start'
      }}>
        Roadmap
      </h2>
      <p className="text-white text-lg sm:text-xl mb-12" style={{ 
        fontWeight: 400,
        fontFamily: 'TWKEverettMono-Regular, monospace',
        color: 'rgb(255, 255, 255)',
      }}>
        Building the future of autonomous transactions
      </p>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        {roadmapItems.map((item, idx) => (
          <StaggerChild key={idx}>
            <div className="border border-gray-800 hover:border-[#FF4D00] transition-all duration-300 bg-[#0a0a0a] h-full" style={{ borderRadius: '0px', padding: '32px' }}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#FF4D00',
                  }}
                />
                <span className="text-[#FF4D00] text-sm font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  {item.phase}
                </span>
              </div>
              <h3 className="text-white text-xl sm:text-2xl md:text-[24px] mb-6" style={{
                fontWeight: 400,
                fontFamily: 'TWKEverett-Regular, sans-serif',
                letterSpacing: '-0.96px',
              }}>
                {item.title}
              </h3>
              <ul className="space-y-3">
                {item.items.map((listItem, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-[#FF4D00] mt-2 flex-shrink-0" />
                    <span className="text-white text-base sm:text-lg" style={{
                      fontWeight: 400,
                      fontFamily: 'BaselGrotesk-Regular, sans-serif',
                      lineHeight: '1.4',
                    }}>
                      {listItem}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerChild>
        ))}
      </StaggerChildren>
    </DocsSection>
  );
}



