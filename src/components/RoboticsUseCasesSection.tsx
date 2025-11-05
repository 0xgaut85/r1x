'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from './motion';
import { Camera, MapPin, Users, Radio, Battery } from 'lucide-react';

export default function RoboticsUseCasesSection() {
  const useCases = [
    {
      icon: <Camera className="w-12 h-12" />,
      title: 'Buy perception when uncertain',
      description: 'A delivery bot needs intensive mapping for 30 seconds, then navigates autonomously for hours. Pay per frame for vision APIs. Pay per image for OCR. No monthly lock-in. Just machines buying sight when they need it.',
    },
    {
      icon: <MapPin className="w-12 h-12" />,
      title: 'Purchase routes when lost',
      description: 'Buy HD map tiles per route segment. Pay per minute for navigation. Access routing services per destination. Why pay monthly for what you use sporadically? Navigation becomes a commodity robots buy.',
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Escalate to human control only when needed',
      description: 'Pay for teleoperation by the minute when autonomy hits edge cases. Machines buying human expertise only when needed. One request at a time. Complete transparency on-chain.',
    },
    {
      icon: <Radio className="w-12 h-12" />,
      title: 'Robots compose capabilities like software',
      description: 'Publish LiDAR sweeps. Consume sensor data from other robots. Build real-time sensor networks. Robots buying and selling perception data. A bazaar where autonomous services transact directly.',
    },
    {
      icon: <Battery className="w-12 h-12" />,
      title: 'Infrastructure becomes machine-payable',
      description: 'Reserve charging slots per use. Pay for docking bays when docking. Access warehouse space per operation. The physical world becomes machine-payable. No subscriptions. Just pay for what you use.',
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
              marginBottom: '40px',
              marginTop: '0px'
            }}>
              Robotics workloads are spiky. Pay per request, not per month.
            </h2>
          </FadeInUp>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 list-none" style={{ marginTop: '40px' }}>
            {useCases.map((useCase, idx) => (
              <StaggerChild key={idx}>
                <ScaleOnHover>
                  <li className="border border-gray-200 hover:border-[#FF4D00] transition-all duration-300 card-hover group" style={{ borderRadius: '0px', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '0px', paddingRight: '0px' }}>
                    <div className="w-full h-40 sm:h-48 bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center mb-3 sm:mb-4" style={{ borderRadius: '0px' }}>
                      <div className="text-[#FF4D00] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {useCase.icon}
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
                    <p className="text-gray-700 leading-relaxed text-base sm:text-lg mt-2" style={{
                      fontWeight: 400,
                      fontFamily: 'BaselGrotesk-Regular, sans-serif',
                      lineHeight: '1.4',
                      color: 'rgb(0, 0, 0)'
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

