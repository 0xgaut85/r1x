'use client';

import { FadeInUp, StaggerChildren, StaggerChild } from './motion';
import { Send, DollarSign, CheckCircle } from 'lucide-react';
import TextScramble from './TextScramble';
import MachineEconomyVisual from './visuals/MachineEconomyVisual';

const steps = [
  {
    number: '[01]',
    title: 'Robots request',
    description: 'Client calls your HTTP endpoint. Server replies 402 Payment Required with a price quote. One request = one price. No accounts.',
    icon: <Send className="w-6 h-6" />,
  },
  {
    number: '[02]',
    title: 'Robots pay',
    description: 'Wallet approves and pays in USDC on Base. Settlement is verifiable on‑chain. The quote becomes a receipt.',
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    number: '[03]',
    title: 'Robots access',
    description: 'Client retries with proof via the X‑PAYMENT header. Resource unlocks. Compose capabilities on demand: per frame, per minute, per route.',
    icon: <CheckCircle className="w-6 h-6" />,
  },
];

export default function HowItWorksSection() {
  const economyTexts = ['economy', 'economy', 'economy'];

  return (
    <section className="relative" style={{ backgroundColor: '#000000', paddingTop: '80px', paddingBottom: '120px', zIndex: 10 }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <FadeInUp>
          <h2 className="text-white text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px]" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.858px',
          color: 'rgb(255, 255, 255)',
          marginBottom: '0px',
          marginTop: '0px',
          textAlign: 'start',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>
            [ The machine{'\u00A0'}
            <TextScramble texts={economyTexts} speed={40} />
            {'\u00A0'}]
        </h2>
        </FadeInUp>

        <StaggerChildren className="flex justify-center mt-8 sm:mt-10 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl">
            <StaggerChild className="w-full sm:flex-1 h-48 sm:h-64 overflow-hidden" style={{ borderRadius: '0px' }}>
              <MachineEconomyVisual />
            </StaggerChild>
            <StaggerChild className="w-full sm:flex-1 h-48 sm:h-64 overflow-hidden" style={{ borderRadius: '0px' }}>
              <MachineEconomyVisual />
            </StaggerChild>
          </div>
        </StaggerChildren>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 max-w-6xl mx-auto mt-10 sm:mt-14">
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
              color: 'rgb(255, 255, 255)',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
              }}>{step.description}</p>
            </StaggerChild>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

