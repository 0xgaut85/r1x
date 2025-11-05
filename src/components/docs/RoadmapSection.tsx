'use client';

import { FadeInUp, StaggerChildren, StaggerChild } from '@/components/motion';
import { Rocket } from 'lucide-react';

const roadmapItems = [
  {
    phase: 'Q1 2025',
    title: 'Core Infrastructure',
    items: [
      'Express x402 server deployment on Railway',
      'PayAI facilitator integration complete',
      'r1x Agent with Claude 3 Opus',
      'Marketplace with PayAI services',
      'User & Platform panels',
      'Base network support',
    ],
  },
  {
    phase: 'Q2 2025',
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
    phase: 'Q3 2025',
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
    phase: 'Q4 2025',
    title: 'Global Adoption',
    items: [
      'Enterprise features & SSO‑less wallet flows',
      'White‑label marketplace & payouts',
      'Governance & fee configuration',
      'Cross‑chain settlement research',
      'DeFi treasury & yield routing (research)',
      'Strategic ecosystem partnerships',
    ],
  },
];

export default function RoadmapSection() {
  return (
    <section style={{ backgroundColor: '#000000', paddingTop: '80px', paddingBottom: '120px' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <FadeInUp>
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
        </FadeInUp>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {roadmapItems.map((item, idx) => (
            <StaggerChild key={idx}>
              <div className="border border-gray-800 hover:border-[#FF4D00] transition-all duration-300 bg-[#0a0a0a] h-full" style={{ borderRadius: '0px', padding: '32px' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Rocket className="w-6 h-6 text-[#FF4D00]" />
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
      </div>
    </section>
  );
}

