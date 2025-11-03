'use client';

import { StaggerChildren, StaggerChild } from './motion';
import MagneticButton from './MagneticButton';
import { Calendar } from 'lucide-react';

export default function EventSection() {
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
          }}>[r1x]</h3>
          </StaggerChild>
          <StaggerChild>
          <p className="text-white text-2xl sm:text-3xl md:text-[40px] leading-tight md:leading-[56px]" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverettMono-Regular, monospace',
            color: 'rgb(255, 255, 255)'
          }}>[↳⌘⓪①Ü]</p>
          </StaggerChild>
        </StaggerChildren>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <StaggerChild>
            <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-800" style={{ borderRadius: '0px' }}></div>
          </StaggerChild>
          <StaggerChildren>
            <StaggerChild>
              <div className="flex items-center gap-2 text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverettMono-Regular, monospace',
              color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <Calendar className="w-4 h-4" />
                <span>//February 24 - March 2nd • Denver</span>
              </div>
            </StaggerChild>
            <StaggerChild>
            <h2 className="text-white mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl lg:text-[46.45px] leading-tight md:leading-[51.095px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverett-Regular, sans-serif',
              letterSpacing: '-1.858px',
              color: 'rgb(255, 255, 255)'
            }}>
              EthDenver: Free rides, wild events, and sick swag.
            </h2>
            </StaggerChild>
            <StaggerChild>
              <MagneticButton
                href="#"
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
              TAKE A FREE RIDE!
              </MagneticButton>
            </StaggerChild>
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}

