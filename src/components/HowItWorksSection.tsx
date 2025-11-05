'use client';

import { FadeInUp, StaggerChildren, StaggerChild } from './motion';
import { Send, DollarSign, CheckCircle } from 'lucide-react';
import TextScramble from './TextScramble';

const steps = [
  {
    number: '[01]',
    title: 'Machines request',
    description: 'An AI agent or robot needs a resource. The server responds with a price. No negotiation, no accounts. Just a quote ready for payment.',
    icon: <Send className="w-6 h-6" />,
  },
  {
    number: '[02]',
    title: 'Machines pay',
    description: 'Payment approved from wallet. Transaction settles on Base. Autonomous agents can pre-authorize budgets. Machines transact like humans never could.',
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    number: '[03]',
    title: 'Machines access',
    description: 'Resource unlocked. Access granted. The machine economy is in motion. Agents buying from agents. Robots paying robots. The future is autonomous.',
    icon: <CheckCircle className="w-6 h-6" />,
  },
];

export default function HowItWorksSection() {
  const economyTexts = ['economy', 'economy', 'economy'];

  return (
    <section style={{ backgroundColor: '#000000', paddingTop: '80px', paddingBottom: '120px' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <FadeInUp>
          <h2 className="text-white text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px]" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.858px',
          color: 'rgb(255, 255, 255)',
          marginBottom: '0px',
          marginTop: '0px',
          textAlign: 'start'
        }}>
            [ The machine{'\u00A0'}
            <TextScramble texts={economyTexts} speed={40} />
            {'\u00A0'}]
        </h2>
        </FadeInUp>

        <StaggerChildren className="flex justify-center mt-8 sm:mt-10 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl">
            <StaggerChild className="w-full sm:flex-1 h-48 sm:h-64 bg-gray-100" style={{ borderRadius: '0px' }} />
            <StaggerChild className="w-full sm:flex-1 h-48 sm:h-64 bg-gray-100" style={{ borderRadius: '0px' }} />
          </div>
        </StaggerChildren>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-6xl mx-auto mt-10 sm:mt-14">
          {steps.map((step, index) => (
            <StaggerChild key={index} className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
            <h3 className="text-white text-xl sm:text-2xl md:text-[24px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverettMono-Regular, monospace',
              lineHeight: '1.4',
              letterSpacing: '-0.96px',
              color: 'rgb(255, 255, 255)'
                }}>{step.number}</h3>
                <div className="text-[#FF4D00]">{step.icon}</div>
          </div>
            <h4 className="uppercase text-white text-base sm:text-lg" style={{
              fontWeight: 400,
              fontFamily: 'BaselGrotesk-Regular, sans-serif',
              lineHeight: '1.4',
              color: 'rgb(255, 255, 255)',
              marginBottom: '16px'
              }}>
                <TextScramble texts={[step.title]} speed={40} />
              </h4>
            <p className="leading-relaxed text-white text-base sm:text-lg" style={{
              fontWeight: 400,
              fontFamily: 'BaselGrotesk-Regular, sans-serif',
              lineHeight: '1.4',
              color: 'rgb(255, 255, 255)'
              }}>{step.description}</p>
            </StaggerChild>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

