'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from '@/components/motion';
import DocsSection from './DocsSection';

const features = [
  {
    title: 'x402 Payment Protocol',
    description: 'HTTP 402 Payment Required, revived. Quote a price, pay from wallet, retry with proof. No accounts, no API keys. Just pay and access. Built on Base network with USDC. Fully compliant with PayAI facilitator for payment verification and settlement.',
  },
  {
    title: 'r1x Agent',
    description: 'AI agent that understands x402, fetches paid resources, and guides you through wallet approval. Chat with Claude 3 Opus. Pay-per-message. Create and sell your own resources. Integrated with PayAI for seamless payment handling.',
  },
  {
    title: 'Marketplace',
    description: 'Browse and purchase x402 services. AI inference, compute resources, data streams, digital content. All services powered by PayAI facilitator on Base network. Real-time service discovery and automatic synchronization.',
  },
  {
    title: 'User & Platform Panels',
    description: 'Monitor everything from one place: quotes, payments, receipts, and explorer links. Create resources, set prices, track transactions in real time. Complete analytics with Prisma database integration.',
  },
  {
    title: 'PayAI Integration',
    description: 'Seamless integration with PayAI facilitator for payment verification and settlement. CDP API authentication for Base mainnet. Automatic fee distribution. Express middleware support with x402-express.',
  },
  {
    title: 'SDK & APIs',
    description: 'Developer tools for building on r1x. Express server with PayAI middleware. Public APIs for service discovery. Transaction tracking and verification. Wallet integration utilities for Base network.',
  },
];

export default function OverviewFeatures() {
  return (
    <DocsSection>
      <h2 className="text-black max-w-5xl text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px] mb-12" style={{
        fontWeight: 400,
        fontFamily: 'TWKEverett-Regular, sans-serif',
        letterSpacing: '-1.858px',
        color: 'rgb(0, 0, 0)',
      }}>
        What r1x does
      </h2>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
        {features.map((feature, idx) => (
          <StaggerChild key={idx}>
            <ScaleOnHover>
              <div className="border border-gray-200 hover:border-[#FF4D00] transition-all duration-300 card-hover group bg-white h-full" style={{ borderRadius: '0px', padding: '32px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '2px',
                    backgroundColor: '#FF4D00',
                    marginBottom: '16px',
                  }}
                />
                <h3 className="text-black text-xl sm:text-2xl md:text-[24px] mb-3" style={{
                  fontWeight: 400,
                  fontFamily: 'TWKEverettMono-Regular, monospace',
                  lineHeight: '1.4',
                  letterSpacing: '-0.96px',
                  color: 'rgb(0, 0, 0)'
                }}>{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed text-base sm:text-lg" style={{
                  fontWeight: 400,
                  fontFamily: 'BaselGrotesk-Regular, sans-serif',
                  lineHeight: '1.4',
                  color: 'rgb(0, 0, 0)'
                }}>
                  {feature.description}
                </p>
              </div>
            </ScaleOnHover>
          </StaggerChild>
        ))}
      </StaggerChildren>

      <FadeInUp>
        <div className="bg-black text-white p-8 sm:p-12 mt-12" style={{ borderRadius: '0px' }}>
          <h3 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.28px',
          }}>
            The machine economy infrastructure
          </h3>
          <p className="text-white leading-relaxed text-base sm:text-lg mb-4" style={{
            fontWeight: 400,
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.4',
          }}>
            r1x enables autonomous machine-to-machine transactions. AI agents buy compute. Robots purchase data. Machines transact without human intervention. Built on Base, powered by x402, secured by PayAI.
          </p>
          <p className="text-white leading-relaxed text-base sm:text-lg" style={{
            fontWeight: 400,
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.4',
          }}>
            This is the payment layer for the autonomous economy. No accounts. No API keys. Just pay and access. Machines become economic agents.
          </p>
        </div>
      </FadeInUp>
    </DocsSection>
  );
}



