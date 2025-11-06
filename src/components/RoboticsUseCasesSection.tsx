'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from './motion';
import { Camera, MapPin, Users, Radio, Battery } from 'lucide-react';

export default function RoboticsUseCasesSection() {
  const useCases = [
    {
      icon: <Camera className="w-12 h-12" />,
      title: 'Perception on demand',
      description: 'Call vision or OCR only when uncertain. Pay per frame or image in USDC. Zero subscriptions—just buy sight when you need it.',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop&q=80'
    },
    {
      icon: <MapPin className="w-12 h-12" />,
      title: 'Navigation per segment',
      description: 'Buy HD map tiles and routing per segment. Pay per minute for guidance. Navigation becomes a commodity robots purchase on demand.',
      image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=600&fit=crop&q=80'
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Human‑in‑the‑loop fallback',
      description: 'Escalate to teleop by the minute when autonomy hits edge cases. Pay only when you need human expertise. Transparent receipts on‑chain.',
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop&q=80'
    },
    {
      icon: <Radio className="w-12 h-12" />,
      title: 'Sensor markets',
      description: 'Publish LiDAR/IMU windows. Consume peer sensor data. Compose real‑time perception networks that are priced per window.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop&q=80'
    },
    {
      icon: <Battery className="w-12 h-12" />,
      title: 'Machine‑payable infrastructure',
      description: 'Reserve charging slots or docks per use. Settle per operation. Physical infrastructure becomes pay‑per‑use for fleets.',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop&q=80'
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
              Robotics workloads spike. Price per request, not per month.
            </h2>
          </FadeInUp>

          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 list-none" style={{ marginTop: '40px' }}>
            {useCases.map((useCase, idx) => (
              <StaggerChild key={idx}>
                <ScaleOnHover>
                  <li className="border border-gray-200 hover:border-[#FF4D00] transition-all duration-300 card-hover group" style={{ borderRadius: '0px', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '20px', paddingRight: '20px' }}>
                    <div className="w-full h-40 sm:h-48 overflow-hidden mb-3 sm:mb-4 relative" style={{ borderRadius: '0px' }}>
                      <img 
                        src={useCase.image} 
                        alt={useCase.title}
                        className="w-full h-full object-cover"
                      />
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

