'use client';

import DocsPageHero from '@/components/docs/DocsPageHero';
import DocsSection from '@/components/docs/DocsSection';
import DocsNavigation from '@/components/docs/DocsNavigation';
import DocsCallout from '@/components/docs/DocsCallout';
import { FadeInUp, StaggerChildren, StaggerChild } from '@/components/motion';

export const dynamic = 'force-dynamic';

export default function PanelsDocsPage() {
  return (
    <>
      <DocsPageHero
        title="User & Platform Panels"
        description="Real‑time analytics for users and platform operators. Monitor agent spending, track revenue, verify on‑chain settlements."
      />
      <DocsNavigation />

      <DocsSection>
        <FadeInUp>
          <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.28px',
          }}>
            User Panel
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            Track your agent's spending across all x402 services. View transaction history, analyze usage patterns, verify on‑chain receipts. Your personal dashboard for the autonomous economy.
          </p>

          <div className="bg-gray-50 border border-gray-200 p-6 space-y-3" style={{ borderRadius: '0px' }}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#FF4D00]" />
              <span style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>Total transactions across all services</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#FF4D00]" />
              <span style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>USDC spent breakdown by category</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#FF4D00]" />
              <span style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>On‑chain verification for every payment</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#FF4D00]" />
              <span style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>Real‑time usage charts and trends</span>
            </div>
          </div>
        </FadeInUp>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Platform Panel
        </h2>

        <p className="text-white/90 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          Monitor your x402 services' performance. Track agent adoption, analyze revenue, see which services agents prefer. The analytics dashboard for service operators.
        </p>

        <div className="border border-white/20 p-6 space-y-3" style={{ borderRadius: '0px' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#FF4D00]" />
            <span className="text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>Platform‑wide transaction volume</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#FF4D00]" />
            <span className="text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>Fee revenue tracking and analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#FF4D00]" />
            <span className="text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>Service performance metrics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#FF4D00]" />
            <span className="text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>Agent behavior insights</span>
          </div>
        </div>
      </DocsSection>

      <DocsSection>
        <DocsCallout variant="info" title="Access">
          User Panel requires wallet connection. Platform Panel requires admin wallet address. All data is real‑time from on‑chain and database sources.
        </DocsCallout>
      </DocsSection>
    </>
  );
}

