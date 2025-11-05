'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from '@/components/motion';
import DocsSection from './DocsSection';

const features = [
  {
    title: 'x402 Payment Protocol',
    description: 'HTTP 402 for machines: server quotes a price, wallet pays in USDC on Base, client retries with proof (X‑PAYMENT). Minimal surface, maximal composability.',
  },
  {
    title: 'RX1 Builder',
    description: 'Drag‑and‑drop builder to turn HTTP endpoints into x402 products. Price per request, set fees, and publish to the marketplace—no code required.',
  },
  {
    title: 'r1x Agent',
    description: 'An AI agent that plans, prices, and pays. Chats with Claude 3 Opus, understands x402, and executes purchases to unlock capabilities—pay‑per‑message, pay‑per‑request.',
  },
  {
    title: 'Marketplace',
    description: 'Discover and list machine‑payable services: inference, data windows, compute bursts, routes, teleop. Price in dollars, settle on Base.',
  },
  {
    title: 'User & Platform Panels',
    description: 'Create priced endpoints, set fees, and monitor quotes, purchases, and receipts in real time. Analytics for adoption and spend.',
  },
  {
    title: 'On-Chain Settlement',
    description: 'Every payment settles on‑chain and is auditable. No custodial accounts. Verifiable machine‑to‑machine commerce on Base.',
  },
  {
    title: 'SDK & APIs',
    description: 'Express middleware, public APIs, wallet utilities, and helpers for pricing, proof parsing, and verification—everything to ship x402 quickly.',
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
            r1x enables autonomous machine-to-machine transactions. AI agents buy compute. Robots purchase data. Machines transact without human intervention. Built on Base. Powered by x402. Secured by blockchain. The infrastructure for the autonomous economy.
          </p>
          <p className="text-white leading-relaxed text-base sm:text-lg" style={{
            fontWeight: 400,
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.4',
          }}>
            This is the economic infrastructure for autonomous machines. No accounts. No API keys. No humans. Just machines transacting with machines. Every payment is on-chain. Every transaction is verifiable. Machines become economic agents. The future is here.
          </p>
        </div>
      </FadeInUp>
    </DocsSection>
  );
}



