'use client';

import { StaggerChildren, StaggerChild } from './motion';
import MagneticButton from './MagneticButton';
import TextScramble from './TextScramble';
import { Calendar } from 'lucide-react';

export default function EventSection() {
  const readTexts = ['READ'];

  return (
    <section className="bg-black text-white" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <StaggerChildren className="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <StaggerChild>
          <h3 className="text-white text-lg sm:text-xl md:text-[24px]" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverettMono-Regular, monospace',
            lineHeight: '1.4',
            letterSpacing: '-0.96px',
            color: 'rgb(255, 255, 255)'
          }}>[NEWS]</h3>
          </StaggerChild>
          <StaggerChild>
          <p className="text-white text-2xl sm:text-3xl md:text-[40px] leading-tight md:leading-[56px]" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverettMono-Regular, monospace',
            color: 'rgb(255, 255, 255)'
          }}>[<TextScramble texts={readTexts} speed={40} />]</p>
          </StaggerChild>
        </StaggerChildren>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-start md:items-center">
          <StaggerChild>
            <div className="w-full max-w-xl mx-auto md:mx-0">
              <img 
                src="/tweetSF.png" 
                alt="r1x Labs attending PayWithLocus hackathon" 
                className="w-full h-auto"
                style={{ borderRadius: '0px', border: '1px solid #808080', maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </StaggerChild>
          <StaggerChildren>
            <StaggerChild>
              <div className="flex items-center gap-2 text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverettMono-Regular, monospace',
              color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <Calendar className="w-4 h-4" />
                <span>//November 15th • San Francisco</span>
              </div>
            </StaggerChild>
            <StaggerChild>
            <h2 className="text-white mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl lg:text-[46.45px] leading-tight md:leading-[51.095px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverett-Regular, sans-serif',
              letterSpacing: '-1.858px',
              color: 'rgb(255, 255, 255)',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              r1x Labs will be attending @PayWithLocus hackathon in SF on November 15th
            </h2>
            </StaggerChild>
            <StaggerChild>
              <MagneticButton
                href="https://x.com/r1xlabs/status/1986385081988972865"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm md:text-[14px] font-normal hover:opacity-90 transition-all duration-300 button-hover inline-block text-center w-full sm:w-auto"
                style={{
              fontFamily: 'TWKEverettMono-Regular, monospace',
                  color: '#000000',
                  backgroundColor: '#FF4D00',
              padding: '16px 24px',
              textTransform: 'uppercase',
              letterSpacing: '-0.56px',
              border: 'none',
              borderRadius: '0px',
              display: 'inline-block',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(255, 77, 0, 0.3)',
                }}
              >
              LEARN MORE
              </MagneticButton>
            </StaggerChild>
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}

