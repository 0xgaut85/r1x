'use client';

import { StaggerChildren, StaggerChild } from './motion';
import TelegramIcon from './icons/TelegramIcon';

export default function CareersSection() {
  return (
    <section className="relative" style={{ backgroundColor: '#F7F7F7', paddingTop: '120px', paddingBottom: '120px', zIndex: 10 }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <StaggerChildren className="relative max-w-7xl mx-auto min-h-[400px]">
          {/* Top Left - Title */}
          <StaggerChild className="absolute top-0 left-0">
            <h3 className="text-black text-2xl sm:text-3xl md:text-4xl lg:text-[48px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverettMono-Regular, monospace',
              lineHeight: '1.2',
              letterSpacing: '-1.5px',
              color: 'rgb(0, 0, 0)'
            }}>
              JOIN THE CONVERSATION
            </h3>
          </StaggerChild>
          
          {/* Top Right - Telegram Icon */}
          <StaggerChild className="absolute top-0 right-0">
            <div className="text-[#FF4D00]">
              <TelegramIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
            </div>
          </StaggerChild>
          
          {/* Center Left - [TG] */}
          <StaggerChild className="absolute top-1/2 left-[20%] transform -translate-y-1/2 -translate-x-1/2">
            <div className="text-black text-5xl sm:text-6xl md:text-7xl lg:text-[80px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverettMono-Regular, monospace',
              lineHeight: '1',
              letterSpacing: '-2px',
              color: 'rgba(0, 0, 0, 0.4)'
            }}>
              [TG]
            </div>
          </StaggerChild>
          
          {/* Center Right - Description */}
          <StaggerChild className="absolute top-1/2 right-[10%] transform -translate-y-1/2 max-w-xl">
            <p className="text-gray-700 leading-relaxed text-lg sm:text-xl md:text-2xl lg:text-[28px]" style={{
              fontWeight: 400,
              fontFamily: 'BaselGrotesk-Regular, sans-serif',
              lineHeight: '1.5',
              color: 'rgb(0, 0, 0)',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              Be the first to know what we've been up to and how we can help unleash the potential in your high-value data.
            </p>
          </StaggerChild>
        </StaggerChildren>
      </div>
    </section>
  );
}

