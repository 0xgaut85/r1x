'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from './motion';
import { MessageSquare, BarChart3, Zap } from 'lucide-react';
import AgentVisual from './visuals/AgentVisual';
import PanelVisual from './visuals/PanelVisual';
import X402Visual from './visuals/X402Visual';

export default function ThesisSection() {
  const features = [
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: '[Agent]',
      description: 'An AI agent that plans, prices, and pays in USDC on Base. Chats with Claude 3 Opus, understands x402 flows, and executes end‑to‑end purchases to unlock resources.',
      visual: <AgentVisual />
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: '[Panel]',
      description: 'Create priced endpoints, set fees, and see quotes, receipts, and purchases in real time. Ship machine‑payable services and monitor adoption.',
      visual: <PanelVisual />
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: '[x402]',
      description: 'HTTP 402 Payment Required for machines. Server quotes a price, wallet pays in USDC, client retries with proof via X‑PAYMENT header. Simple, verifiable, machine‑native.',
      visual: <X402Visual />
    },
  ];

  return (
    <section className="relative" style={{ backgroundColor: '#F7F7F7', paddingTop: '200px', paddingBottom: '80px', zIndex: 10 }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <div>
          <FadeInUp>
            <h2 className="text-black max-w-5xl text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverett-Regular, sans-serif',
              letterSpacing: '-1.858px',
              color: 'rgb(0, 0, 0)',
              marginBottom: '0px',
              marginTop: '0px',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
            Autonomy needs pay‑per‑request, not subscriptions. We make HTTP machine‑payable with x402 and USDC on Base.
            </h2>
          </FadeInUp>

          <StaggerChildren className="max-w-4xl space-y-6 sm:space-y-8 mb-12 sm:mb-16 mt-6 sm:mt-8">
            <StaggerChild>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg" style={{
                fontWeight: 400,
                fontFamily: 'BaselGrotesk-Regular, sans-serif',
                lineHeight: '1.4',
                color: 'rgb(0, 0, 0)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}>
                <strong style={{ fontWeight: 600 }}>We're building the payment rail for autonomous machines.</strong> One request → one price → one payment. Pay per frame, minute, or route. USDC on Base. Verifiable receipts. No accounts. No contracts. Just machines paying for what they use.
              </p>
            </StaggerChild>
            <StaggerChild>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg" style={{
                fontWeight: 400,
                fontFamily: 'BaselGrotesk-Regular, sans-serif',
                lineHeight: '1.4',
                color: 'rgb(0, 0, 0)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}>
                Turn any HTTP endpoint into a priced service. If you can return HTTP, you can sell it. If you can call HTTP, you can buy it. Build perception, routing, teleop, or data windows as x402 services—and let robots and agents compose them on demand.
              </p>
            </StaggerChild>
          </StaggerChildren>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 list-none" style={{ marginTop: '40px' }}>
            {features.map((feature, idx) => (
              <StaggerChild key={idx}>
                <ScaleOnHover>
                  <li className="border border-gray-200 hover:border-[#FF4D00] transition-all duration-300 card-hover group" style={{ borderRadius: '0px', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '20px', paddingRight: '20px' }}>
                    <div className="w-full h-40 sm:h-48 overflow-hidden mb-3 sm:mb-4 relative" style={{ borderRadius: '0px' }}>
                      {feature.visual}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80">
                        <div className="text-[#FF4D00]">
                          {feature.icon}
                        </div>
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
                    <p className="text-gray-700 leading-relaxed text-base sm:text-lg mt-2 px-4" style={{
                      fontWeight: 400,
                      fontFamily: 'BaselGrotesk-Regular, sans-serif',
                      lineHeight: '1.4',
                      color: 'rgb(0, 0, 0)',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
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
