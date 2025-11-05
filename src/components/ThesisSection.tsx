'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from './motion';
import { MessageSquare, BarChart3, Zap, Wallet } from 'lucide-react';

export default function ThesisSection() {
  const features = [
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: '[Agent]',
      description: 'An AI agent that thinks, pays, and accesses the world. Chat with Claude 3 Opus. It understands x402, purchases resources autonomously, and guides you through the machine economy. No code. No limits. Just intelligence that transacts.',
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: '[Panel]',
      description: 'Watch the machine economy unfold in real-time. Every transaction, every quote, every autonomous purchase. Create resources that robots will buy. Set prices that agents will pay. Monitor the future of machine commerce.',
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: '[x402]',
      description: 'HTTP 402 Payment Required, reborn for machines. Quote a price. Pay from wallet. Retry with proof. No accounts. No API keys. No humans. Just machines transacting with machines. The protocol that makes HTTP machine-payable.',
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
            The next economy isn't human. It's autonomous. Robotics workloads are spiky. A delivery bot needs intensive mapping for 30 seconds, then navigates autonomously for hours. Why pay monthly for what you use sporadically?
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
                <strong style={{ fontWeight: 600 }}>We're building the payment infrastructure for autonomous machines.</strong> The old model is broken. The new model: One request = One price = One payment. Pay per frame. Pay per minute. Pay per route. No lock-in. No contracts. No subscriptions. Just pay for what you use, when you use it. Every transaction is verifiable on-chain. Complete transparency.
              </p>
            </StaggerChild>
            <StaggerChild>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg" style={{
                fontWeight: 400,
                fontFamily: 'BaselGrotesk-Regular, sans-serif',
                lineHeight: '1.4',
                color: 'rgb(0, 0, 0)'
              }}>
                Robots compose capabilities like software. Buy perception when uncertain. Purchase routes when lost. Escalate to human control only when needed. R1x turns any HTTP endpoint into a marketplace. Price in dollars. Settle instantly. If you can return HTTP, you can sell it. If you can call HTTP, you can buy it. A bazaar where autonomous services transact directly. Robots buying from robots. Agents paying agents. All happening one request at a time.
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
