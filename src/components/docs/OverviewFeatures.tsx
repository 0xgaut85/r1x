'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from '@/components/motion';
import DocsSection from './DocsSection';

const features = [
  {
    title: 'x402 Payment Protocol',
    description: 'HTTP 402 Payment Required, reborn for machines. Quote a price, pay from wallet, retry with proof. No accounts. No API keys. No humans. Just machines transacting. Built on Base with USDC. Every payment is on-chain. Every transaction is verifiable. The protocol that makes HTTP machine-payable.',
  },
  {
    title: 'r1x Agent',
    description: 'An AI agent that thinks, pays, and accesses the world. Chat with Claude 3 Opus. It understands x402, purchases resources autonomously, and guides you through the machine economy. Pay-per-message. Create resources robots will buy. Build services agents will pay for. Intelligence that transacts.',
  },
  {
    title: 'Marketplace',
    description: 'The marketplace for the machine economy. Browse AI inference services robots can purchase. Discover compute resources agents can buy. Access data streams machines can consume. Real-time service discovery. Everything priced. Everything payable. The infrastructure for autonomous commerce.',
  },
  {
    title: 'User & Platform Panels',
    description: 'Watch the machine economy unfold. Monitor every transaction. Track every autonomous purchase. Create resources that robots will buy. Set prices that agents will pay. See the future of machine commerce in real-time. Complete analytics. Full transparency. The dashboard for the autonomous economy.',
  },
  {
    title: 'On-Chain Settlement',
    description: 'Every payment settles on-chain. Every transaction is verifiable. No intermediaries. No trusted parties. Just machines transacting with machines. Built on Base network. Secured by blockchain. The infrastructure for trustless machine commerce.',
  },
  {
    title: 'SDK & APIs',
    description: 'Build the future of machine commerce. Express middleware for x402. Public APIs for service discovery. Transaction tracking and verification. Wallet integration for Base network. Everything you need to make your services machine-payable. The tools for the autonomous economy.',
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



