'use client';

import DocsPageHero from '@/components/docs/DocsPageHero';
import DocsSection from '@/components/docs/DocsSection';
import DocsNavigation from '@/components/docs/DocsNavigation';
import DocsCallout from '@/components/docs/DocsCallout';
import DocsCodeBlock from '@/components/docs/DocsCodeBlock';
import { FadeInUp } from '@/components/motion';

export const dynamic = 'force-dynamic';

export default function FacilitatorDocsPage() {
  return (
    <>
      <DocsPageHero
        title="r1x Facilitator"
        description="The payment verification layer. Trustless, fast, and agent‑optimized. Coming soon."
      />
      <DocsNavigation />

      <DocsSection>
        <FadeInUp>
          <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.28px',
          }}>
            What is a Facilitator?
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            Facilitators verify x402 payments and route settlements. They're the trusted third party that confirms "yes, this agent paid" without seeing what was purchased. Think Stripe Connect meets zero‑knowledge proofs.
          </p>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            <strong>r1x Facilitator will be optimized for AI agent transactions.</strong> Sub‑second verification. Batch settlement. Agent‑specific fraud detection. This is the payment processor agents need.
          </p>
        </FadeInUp>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-8" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Why Build Our Own?
        </h2>

        <div className="space-y-4 text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.7' }}>
          <p>
            <strong className="text-white">Speed.</strong> Agents make thousands of micro‑transactions. We're building for sub‑100ms verification. Batch settlements every block. Optimized for high throughput.
          </p>
          <p>
            <strong className="text-white">Agent‑native.</strong> Fraud detection trained on agent behavior patterns. Automatic retry logic. Quote caching. Built for how agents actually transact.
          </p>
          <p>
            <strong className="text-white">Economics.</strong> Lower fees at scale. Revenue sharing with service providers. This becomes profitable when agent spending hits billions.
          </p>
        </div>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Current Status
        </h2>

        <DocsCallout variant="info" title="Using PayAI Network">
          r1x currently uses{' '}
          <a href="https://payai.network" target="_blank" rel="noopener noreferrer" className="text-[#FF4D00] underline">
            PayAI facilitator
          </a>
          {' '}for payment verification. We're building r1x Facilitator to handle agent‑scale economics. Migration will be seamless—same x402 protocol, better performance.
        </DocsCallout>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <DocsCallout variant="warning" title="Coming Soon">
          r1x Facilitator roadmap: Q1 2025 testnet, Q2 2025 mainnet. Early adopters get preferential fee rates.
        </DocsCallout>
      </DocsSection>
    </>
  );
}

