'use client';

import { FadeInUp, StaggerChildren, StaggerChild } from './motion';
import { Shield, Zap, Globe } from 'lucide-react';

const benefits = [
  {
    title: "[ ] Built for AGI scale",
    description: "Millions of agents, billions of transactions. x402 scales with USDC on Base L2. Sub‑cent fees. Instant finality. This infrastructure is ready for the agent explosion.",
    icon: <Shield className="w-6 h-6" />,
  },
    {
    title: "[ ] No integration hell",
    description: "One protocol, every agent. No OAuth, no API keys, no rate limits. Agents use wallets. Your API returns 402. That's it. Standard, simple, unstoppable.",
    icon: <Zap className="w-6 h-6" />,
    },
    {
    title: "[ ] Verifiable from day one",
    description: "Every payment is on‑chain. Every quote is signed. Every receipt is provable. Build trust into agent economies by default. No disputes, no chargebacks.",
    icon: <Globe className="w-6 h-6" />,
  },
];

export default function AnatomyOfNodeSection() {
  return (
    <section className="relative" style={{ backgroundColor: '#F7F7F7', paddingTop: '80px', paddingBottom: '80px', zIndex: 10 }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-start">
          <div>
            <FadeInUp>
              <h3 className="text-black text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverett-Regular, sans-serif',
              letterSpacing: '-1.858px',
              color: 'rgb(0, 0, 0)',
              marginBottom: '0px',
              marginTop: '0px',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
                The payment protocol<br />AGI needs.
            </h3>
            </FadeInUp>
            <StaggerChildren className="space-y-8 sm:space-y-12 list-none mt-6 sm:mt-8">
              {benefits.map((benefit, idx) => (
                <StaggerChild key={idx}>
                  <li className="cursor-pointer group">
                    <div className="flex items-start gap-3 mb-2 sm:mb-4">
                      <div className="text-[#FF4D00] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
                        {benefit.icon}
                      </div>
                      <h4 className="text-black text-xl sm:text-2xl md:text-[24px]" style={{
                    fontWeight: 400,
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    lineHeight: '1.4',
                    letterSpacing: '-0.96px',
                    color: 'rgb(0, 0, 0)'
                      }}>{benefit.title}</h4>
                    </div>
                  <p className="text-gray-700 leading-relaxed text-base sm:text-lg" style={{
                    fontWeight: 400,
                    fontFamily: 'BaselGrotesk-Regular, sans-serif',
                    lineHeight: '1.4',
                    color: 'rgb(0, 0, 0)',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                    }}>{benefit.description}</p>
                </li>
                </StaggerChild>
              ))}
            </StaggerChildren>
          </div>
          <div className="order-first md:order-last">
            <FadeInUp delay={0.2}>
              <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden" style={{ borderRadius: '0px' }}>
                <img 
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=800&fit=crop&q=80&sat=-100&con=15&exp=-10"
                  alt="Infrastructure for autonomy"
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(100%) contrast(115%) brightness(95%)' }}
                />
              </div>
            </FadeInUp>
          </div>
        </div>
      </div>
    </section>
  );
}

