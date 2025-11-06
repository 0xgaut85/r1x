'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from './motion';
import { MessageSquare, BarChart3, Zap } from 'lucide-react';
import GrainImage from './GrainImage';

export default function ThesisSection() {
  const features = [
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: '[Agent]',
      description: 'The first AI agent that actually pays. Plans, quotes, and settles in USDC on Base. Understands x402, executes purchases, unlocks premium APIs. This is what autonomous spending looks like.',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10'
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: '[Panel]',
      description: 'Turn your API into revenue in minutes. Set prices, deploy x402, watch agents pay. Real‑time analytics, on‑chain receipts, instant USDC settlement. The dashboard for the agent economy.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10'
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: '[x402]',
      description: 'HTTP 402 Payment Required, reimagined for Web3. Server quotes, agent pays in USDC, client retries with proof. The missing protocol that makes agents economically autonomous.',
      image: 'https://images.unsplash.com/photo-1518085250887-2f903c200fee?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10'
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
            AI agents will spend billions. x402 makes every HTTP endpoint machine‑payable. USDC on Base. We're building the payment layer for AGI.
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
                <strong style={{ fontWeight: 600 }}>The future isn't humans with API keys—it's agents with wallets.</strong> Every Claude, GPT, and custom agent will need to pay for services. We've built the first protocol where HTTP 402 meets blockchain settlement. One request → one quote → one payment. Instant, verifiable, on‑chain.
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
                Deploy any service as x402. Agents discover it, quote it, pay for it—no accounts, no OAuth, no credit cards. Just wallets and smart contracts. This is how trillion‑dollar agent economies get built. We're making it standard.
              </p>
            </StaggerChild>
          </StaggerChildren>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 list-none" style={{ marginTop: '40px' }}>
            {features.map((feature, idx) => (
              <StaggerChild key={idx}>
                <ScaleOnHover>
                  <li className="border border-gray-200 hover:border-[#FF4D00] transition-all duration-300 card-hover group" style={{ borderRadius: '0px', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '20px', paddingRight: '20px' }}>
                    <div className="w-full h-40 sm:h-48 overflow-hidden mb-3 sm:mb-4 relative" style={{ borderRadius: '0px' }}>
                      <GrainImage src={feature.image} alt={feature.title} className="w-full h-full" />
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
