'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from '@/components/motion';
import { Zap, Wallet, MessageSquare, Code, Network, Shield } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'x402 Payment Protocol',
    description: 'HTTP 402 Payment Required, revived. Quote a price, pay from wallet, retry with proof. No accounts, no API keys. Just pay and access. Built on Base network with USDC.',
  },
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: 'r1x Agent',
    description: 'AI agent that understands x402, fetches paid resources, and guides you through wallet approval. Chat with Claude 3 Opus. Pay-per-message. Create and sell your own resources.',
  },
  {
    icon: <Network className="w-8 h-8" />,
    title: 'Marketplace',
    description: 'Browse and purchase x402 services. AI inference, compute resources, data streams, digital content. All services powered by PayAI facilitator on Base network.',
  },
  {
    icon: <Wallet className="w-8 h-8" />,
    title: 'User & Platform Panels',
    description: 'Monitor everything from one place: quotes, payments, receipts, and explorer links. Create resources, set prices, track transactions in real time. Complete analytics.',
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'PayAI Integration',
    description: 'Seamless integration with PayAI facilitator for payment verification and settlement. CDP API authentication for Base mainnet. Automatic fee distribution.',
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: 'SDK & APIs',
    description: 'Developer tools for building on r1x. Express server with PayAI middleware. Public APIs for service discovery. Transaction tracking and verification.',
  },
];

export default function WhatR1xDoesSection() {
  return (
    <section style={{ backgroundColor: '#F7F7F7', paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <FadeInUp>
          <h2 className="text-black max-w-5xl text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px] mb-12" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.858px',
            color: 'rgb(0, 0, 0)',
          }}>
            What r1x does
          </h2>
        </FadeInUp>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {features.map((feature, idx) => (
            <StaggerChild key={idx}>
              <ScaleOnHover>
                <div className="border border-gray-200 hover:border-[#FF4D00] transition-all duration-300 card-hover group bg-white h-full" style={{ borderRadius: '0px', padding: '32px' }}>
                  <div className="text-[#FF4D00] mb-4">
                    {feature.icon}
                  </div>
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
      </div>
    </section>
  );
}

