'use client';

import { StaggerChildren, StaggerChild } from './motion';
import TelegramIcon from './icons/TelegramIcon';

export default function CareersSection() {
  return (
    <section className="relative" style={{ backgroundColor: '#F7F7F7', paddingTop: '120px', paddingBottom: '120px', zIndex: 10 }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <StaggerChildren className="max-w-4xl mx-auto text-center">
          <StaggerChild>
            <div className="flex items-center justify-center gap-4 mb-8 sm:mb-12">
              <div className="text-[#FF4D00]">
                <TelegramIcon className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h3 className="text-black text-3xl sm:text-4xl md:text-5xl lg:text-[56px]" style={{
                fontWeight: 400,
                fontFamily: 'TWKEverettMono-Regular, monospace',
                lineHeight: '1.2',
                letterSpacing: '-1.5px',
                color: 'rgb(0, 0, 0)'
              }}>
                JOIN THE CONVERSATION <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}>[02]</span>
              </h3>
            </div>
          </StaggerChild>
          <StaggerChild>
            <p className="text-gray-700 mb-10 sm:mb-14 leading-relaxed text-xl sm:text-2xl md:text-[28px] max-w-3xl mx-auto" style={{
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

