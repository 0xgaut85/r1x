'use client';

import { StaggerChildren, StaggerChild, ScaleOnHover } from './motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LatestSection() {
  return (
    <section style={{ backgroundColor: '#F7F7F7', paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-start">
          <StaggerChildren className="flex-1">
            <StaggerChild>
              <motion.a
                href="/news"
                whileHover={{ x: 5 }}
                className="mb-4 sm:mb-6 block hover:text-[#FF4D00] transition-colors link-hover text-xs sm:text-sm md:text-[14px] flex items-center gap-2"
                style={{
              fontWeight: 400,
              fontFamily: 'TWKEverettMono-Regular, monospace',
              color: 'rgb(0, 0, 0)',
              textTransform: 'uppercase',
              letterSpacing: '-0.56px',
              textDecoration: 'underline'
                }}
              >
              Read the latest
                <ArrowRight className="w-3 h-3" />
              </motion.a>
            </StaggerChild>
            <StaggerChild>
            <h2 className="text-black text-2xl sm:text-3xl md:text-4xl lg:text-[46.45px] leading-tight md:leading-[51.095px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverett-Regular, sans-serif',
              letterSpacing: '-1.858px',
              color: 'rgb(0, 0, 0)'
            }}>[Latest]</h2>
            </StaggerChild>
          </StaggerChildren>

          <StaggerChildren className="flex-1">
            <StaggerChild>
              <motion.a
                href="/ecosystem"
                whileHover={{ x: 5 }}
                className="mb-4 sm:mb-6 block hover:text-[#FF4D00] transition-colors link-hover text-xs sm:text-sm md:text-[14px] flex items-center gap-2"
                style={{
              fontWeight: 400,
              fontFamily: 'TWKEverettMono-Regular, monospace',
              color: 'rgb(0, 0, 0)',
              textTransform: 'uppercase',
              letterSpacing: '-0.56px',
              textDecoration: 'underline'
                }}
              >
              View the Ecosystem
                <ExternalLink className="w-3 h-3" />
              </motion.a>
            </StaggerChild>
            <StaggerChild>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 list-none">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i}>
                    <ScaleOnHover>
                  <a href="#" className="block w-full h-24 sm:h-32 bg-gray-200 hover:bg-gray-300 transition-all duration-300" style={{ borderRadius: '0px' }}>
                        <div className="w-full h-full bg-gray-200 hover:bg-[#FF4D00]/10 transition-colors duration-300" style={{ borderRadius: '0px' }}></div>
                  </a>
                    </ScaleOnHover>
                </li>
              ))}
            </ul>
            </StaggerChild>
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}

