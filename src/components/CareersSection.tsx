'use client';

import { StaggerChildren, StaggerChild } from './motion';
import TelegramIcon from './icons/TelegramIcon';

export default function CareersSection() {
  return (
    <section className="relative py-20 sm:py-24 md:py-[120px]" style={{ backgroundColor: '#F7F7F7', zIndex: 10 }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <StaggerChildren className="relative max-w-7xl mx-auto min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
          {/* Top Left - Title */}
          <StaggerChild className="absolute top-0 left-0 w-full sm:w-auto mb-5 sm:mb-0">
            <h3 className="text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[48px]" style={{
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
          <StaggerChild className="absolute top-0 right-0 hidden sm:block">
            <div className="text-[#FF4D00]">
              <TelegramIcon className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
            </div>
          </StaggerChild>
          
          {/* Mobile Telegram Icon - Below Title */}
          <StaggerChild className="absolute top-14 left-0 sm:hidden">
            <div className="text-[#FF4D00]">
              <TelegramIcon className="w-12 h-12" />
            </div>
          </StaggerChild>
          
          {/* Center Left - [TG] */}
          <StaggerChild className="absolute top-1/2 left-0 sm:left-[10%] md:left-[20%] transform -translate-y-1/2 sm:-translate-x-1/2">
            <div className="text-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px]" style={{
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
          <StaggerChild className="absolute top-1/2 right-0 sm:right-[5%] md:right-[10%] transform -translate-y-1/2 max-w-full sm:max-w-md md:max-w-xl px-4 sm:px-0">
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg md:text-xl lg:text-2xl xl:text-[28px]" style={{
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

