'use client';

import DocsPageHero from '@/components/docs/DocsPageHero';
import DocsSection from '@/components/docs/DocsSection';
import DocsCallout from '@/components/docs/DocsCallout';
import { FadeInUp } from '@/components/motion';

export const dynamic = 'force-dynamic';

export default function AgentBuilderDocsPage() {
  return (
    <>
      <DocsPageHero
        title="r1x Agent Builder"
        description="No‑code platform for building AI agents with built‑in x402 payment capabilities."
      />

      <DocsSection>
        <FadeInUp>
          <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.28px',
          }}>
            Vision
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            Build custom AI agents with payment superpowers. No coding required. Connect your LLM, define workflows, add x402 services, deploy. Your agent automatically discovers services, quotes prices, and pays in USDC.
          </p>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            <strong>This is Zapier meets AutoGPT meets crypto wallets.</strong> The missing platform that turns AI agents into economic actors.
          </p>
        </FadeInUp>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-8" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Planned Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Visual workflow builder
            </h3>
            <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Drag‑and‑drop agent logic. Connect x402 services. Build complex agent workflows without code.
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Wallet management
            </h3>
            <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Set spending limits, auto‑approve trusted services, track agent expenses in real‑time.
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Service discovery
            </h3>
            <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Agents automatically find and evaluate x402 services. Compare prices. Choose providers. All autonomous.
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              One‑click deployment
            </h3>
            <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Deploy agents to cloud or edge. Automatic scaling. Built‑in monitoring. Production‑ready from day one.
            </p>
          </div>
        </div>
      </DocsSection>

      <DocsSection>
        <DocsCallout variant="warning" title="Status">
          r1x Agent Builder is currently in development. Join our{' '}
          <a href="https://t.me/r1xbuilders" className="text-[#FF4D00] underline">Telegram</a>
          {' '}to be notified when early access opens.
        </DocsCallout>
      </DocsSection>
    </>
  );
}

