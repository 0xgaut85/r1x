'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from './motion';
import GrainImage from './GrainImage';
import { Camera, MapPin, Users, Radio, Battery } from 'lucide-react';

export default function RoboticsUseCasesSection() {
  const useCases = [
    {
      icon: <Camera className="w-12 h-12" />,
      title: 'Vision APIs agents buy',
      description: 'Agents pay per inference for OCR, object detection, image analysis. No monthly fees. Just USDC per call. The AI vision market, now machine‑accessible.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10'
    },
    {
      icon: <MapPin className="w-12 h-12" />,
      title: 'Real‑time data streams',
      description: 'Market data, social feeds, IoT sensors—all priced per access. Agents compose data sources on demand. Pay only for what they consume.',
      image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10'
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Human expertise on tap',
      description: 'Agents escalate complex tasks to human specialists. Pay per consultation minute. On‑chain receipts, instant settlement. The gig economy meets AGI.',
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10'
    },
    {
      icon: <Radio className="w-12 h-12" />,
      title: 'Premium model access',
      description: 'Deploy gated LLMs, custom fine‑tunes, or specialized models. Agents pay per token or inference. Your models become revenue streams.',
      image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10'
    },
    {
      icon: <Battery className="w-12 h-12" />,
      title: 'Compute marketplaces',
      description: 'Rent GPU cycles, serverless functions, or specialized hardware. Agents pay per job. Idle compute becomes instant revenue. The Airbnb for AI infrastructure.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10'
    },
  ];

  return (
    <section className="relative" style={{ backgroundColor: '#F7F7F7', paddingTop: '80px', paddingBottom: '80px', zIndex: 10 }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <div>
          <FadeInUp>
            <h2 className="text-black max-w-5xl text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverett-Regular, sans-serif',
              letterSpacing: '-1.858px',
              color: 'rgb(0, 0, 0)',
              marginBottom: '40px',
              marginTop: '0px',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              AI agents unlock trillion‑dollar markets. Every capability becomes pay‑per‑use.
            </h2>
          </FadeInUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 list-none" style={{ marginTop: '40px' }}>
            {useCases.map((useCase, idx) => (
              <StaggerChild key={idx}>
                <ScaleOnHover>
                  <li className="border border-gray-200 hover:border-[#FF4D00] transition-all duration-300 card-hover group" style={{ borderRadius: '0px', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '20px', paddingRight: '20px' }}>
                    <div className="w-full h-40 sm:h-48 overflow-hidden mb-3 sm:mb-4 relative" style={{ borderRadius: '0px' }}>
                      <GrainImage src={useCase.image} alt={useCase.title} className="w-full h-full" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80">
                        <div className="text-[#FF4D00]">
                          {useCase.icon}
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
                    }}>{useCase.title}</h3>
                    <p className="text-gray-700 leading-relaxed text-base sm:text-lg mt-2 px-4" style={{
                      fontWeight: 400,
                      fontFamily: 'BaselGrotesk-Regular, sans-serif',
                      lineHeight: '1.4',
                      color: 'rgb(0, 0, 0)',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}>
                      {useCase.description}
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

