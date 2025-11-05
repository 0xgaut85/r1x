'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from './motion';
import { MessageSquare, BarChart3, Zap, Wallet } from 'lucide-react';

export default function ThesisSection() {
  const features = [
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: '[Agent]',
      description: 'Chat with an AI agent that understands x402, fetches paid resources, and guides you through wallet approval. Create and sell your own resources. No code needed.',
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: '[Panel]',
      description: 'Monitor everything from one place: quotes, payments, receipts, and explorer links. Create resources, set prices, and track transactions in real time.',
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: '[x402]',
      description: 'HTTP 402 Payment Required, revived. Quote a price, pay from your wallet, retry with proof. No accounts, no API keys. Just pay and access.',
    },
  ];

  return (
    <section style={{ backgroundColor: '#F7F7F7', paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <div>
          <FadeInUp>
            <h2 className="text-black max-w-5xl text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverett-Regular, sans-serif',
              letterSpacing: '-1.858px',
              color: 'rgb(0, 0, 0)',
              marginBottom: '0px',
              marginTop: '0px'
            }}>
            The machine economy is spiky. Robots buy capabilities per request—per frame, per meter, per minute. No subscriptions, no accounts. x402 makes HTTP machine‑payable in dollars.
            </h2>
          </FadeInUp>

          <StaggerChildren className="max-w-4xl space-y-6 sm:space-y-8 mb-12 sm:mb-16 mt-6 sm:mt-8">
            <StaggerChild>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg" style={{
                fontWeight: 400,
                fontFamily: 'BaselGrotesk-Regular, sans-serif',
                lineHeight: '1.4',
                color: 'rgb(0, 0, 0)'
              }}>
                <strong style={{ fontWeight: 600 }}>We're building the payment layer for the machine economy.</strong> In robotics, value happens at the edge and in spikes. A robot shouldn't rent a month of vision or maps to unlock five seconds of capability. With r1x, one request carries a price, you pay in dollars, you get a verifiable receipt.
              </p>
            </StaggerChild>
            <StaggerChild>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg" style={{
                fontWeight: 400,
                fontFamily: 'BaselGrotesk-Regular, sans-serif',
                lineHeight: '1.4',
                color: 'rgb(0, 0, 0)'
              }}>
                This is bigger than payments. This is machines becoming economic agents. Robots autonomously purchasing compute, data, and services—per frame, per route, per minute. AI agents transacting without human intervention. The infrastructure for the autonomous economy is here.
              </p>
            </StaggerChild>
          </StaggerChildren>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 list-none" style={{ marginTop: '40px' }}>
            {features.map((feature, idx) => (
              <StaggerChild key={idx}>
                <ScaleOnHover>
                  <li className="border border-gray-200 hover:border-[#FF4D00] transition-all duration-300 card-hover group" style={{ borderRadius: '0px', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '0px', paddingRight: '0px' }}>
                    <div className="w-full h-40 sm:h-48 bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center mb-3 sm:mb-4" style={{ borderRadius: '0px' }}>
                      <div className="text-[#FF4D00] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-black text-xl sm:text-2xl md:text-[24px] mt-3 sm:mt-4" style={{
                      marginBottom: '0px',
                      fontWeight: 400,
                      fontFamily: 'TWKEverettMono-Regular, monospace',
                      lineHeight: '1.4',
                      letterSpacing: '-0.96px',
                      color: 'rgb(0, 0, 0)'
                    }}>{feature.title}</h3>
                    <p className="text-gray-700 leading-relaxed text-base sm:text-lg mt-2" style={{
                      fontWeight: 400,
                      fontFamily: 'BaselGrotesk-Regular, sans-serif',
                      lineHeight: '1.4',
                      color: 'rgb(0, 0, 0)'
                    }}>
                      {feature.description}
                    </p>
                  </li>
                </ScaleOnHover>
              </StaggerChild>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}
