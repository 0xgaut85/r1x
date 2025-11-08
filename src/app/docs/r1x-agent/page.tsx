'use client';

import DocsPageHero from '@/components/docs/DocsPageHero';
import DocsSection from '@/components/docs/DocsSection';
import DocsNavigation from '@/components/docs/DocsNavigation';
import DocsCallout from '@/components/docs/DocsCallout';
import DocsCodeBlock from '@/components/docs/DocsCodeBlock';
import { FadeInUp, StaggerChildren, StaggerChild } from '@/components/motion';

export const dynamic = 'force-dynamic';

export default function R1xAgentDocsPage() {
  return (
    <>
      <DocsPageHero
        title="r1x Agent"
        description="The first AI agent that actually pays. Built to prove AI agents can be economically autonomous."
      />
      <DocsNavigation />

      <DocsSection>
        <FadeInUp>
          <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.28px',
          }}>
            What is r1x Agent?
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            r1x Agent is an AI assistant powered by Claude 3.5 Sonnet that understands x402 payment protocols. When it encounters a paid service, it automatically generates a payment quote, guides you through wallet approval, and retries the request with proof.
          </p>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            <strong>This is the proof of concept for the autonomous economy.</strong> Every conversation that requires a paid service demonstrates how agents will spend billions in the coming years.
          </p>
        </FadeInUp>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-8" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          How it Works
        </h2>

        <StaggerChildren className="space-y-6">
          <StaggerChild>
            <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                [01] Agent detects x402
              </h3>
              <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                When a service returns HTTP 402, r1x Agent parses the payment quote, extracts the price, and presents it to you.
              </p>
            </div>
          </StaggerChild>
          
          <StaggerChild>
            <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                [02] Wallet approval
              </h3>
              <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Agent guides you to approve USDC payment on Base network. Transaction settles in seconds with sub‑cent fees.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                [03] Auto‑retry with proof
              </h3>
              <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                After payment, agent automatically retries the request with payment proof in X‑PAYMENT header. Service unlocks. You get the result.
              </p>
            </div>
          </StaggerChild>
        </StaggerChildren>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Try it Now
        </h2>

        <DocsCallout variant="info" title="Live Demo">
          r1x Agent is live at{' '}
          <a href="/r1x-agent" className="text-[#FF4D00] underline" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
            /r1x-agent
          </a>
          . Connect your wallet and chat. Every message costs $0.25 USDC on Base.
        </DocsCallout>

        <div className="mt-8">
          <h3 className="text-black text-lg mb-4" style={{
            fontFamily: 'TWKEverett-Regular, sans-serif',
          }}>
            Example Interaction
          </h3>
          <DocsCodeBlock language="text">
{`You: "What can you help me with?"

r1x Agent: "I'm an AI assistant that can help with questions, analysis, and tasks.
This service costs $0.25 USDC per message on Base network."

[Payment quote appears]
[Wallet approval]
[Payment settles]

r1x Agent: [Continues conversation with full response]`}
          </DocsCodeBlock>
        </div>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Why This Matters
        </h2>
        
        <div className="space-y-4 text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.7', fontSize: '16px' }}>
          <p>
            <strong className="text-white">Agents need to pay.</strong> As AI becomes more autonomous, it needs to purchase services independently. API keys don't scale. OAuth doesn't work for machines. Credit cards require humans.
          </p>
          <p>
            <strong className="text-white">x402 + wallets solve this.</strong> Agents use wallets like humans use credit cards. Services return 402 quotes. Agents pay in USDC. On‑chain settlement. Verifiable receipts. This is the missing piece.
          </p>
          <p>
            <strong className="text-white">r1x Agent is the proof.</strong> Every conversation demonstrates autonomous payment. Every transaction shows this works at scale. This is what the trillion‑dollar agent economy will look like.
          </p>
        </div>
      </DocsSection>
    </>
  );
}

