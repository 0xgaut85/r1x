'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from './motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const demos = [
  { title: "API access", desc: "Price any HTTP endpoint per request. Charge for data, compute, or premium routes in USDC on Base." },
  { title: "Robot services", desc: "Robots and agents buy perception, routing, and teleop on demand. Quotes become receipts." },
  { title: "AI inference", desc: "Charge per inference, embedding, or tool call. No keys—just 402 quotes and verifiable payment." },
  { title: "Data streams", desc: "Sell real‑time feeds per window. Clients pay per access and retry with proof to unlock." },
  { title: "Compute resources", desc: "Expose bursty GPU/CPU as x402 services. Set prices by minute or job and settle instantly." },
  { title: "Digital content", desc: "Unlock files, reports, or assets with one‑time payments. Machine‑readable receipts by design." },
];

export default function DemosSection() {
  return (
    <section className="relative" style={{ backgroundColor: '#F7F7F7', paddingTop: '80px', paddingBottom: '80px', zIndex: 10 }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <StaggerChildren className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0" style={{ marginBottom: '0px' }}>
          <StaggerChild>
          <h3 className="text-black uppercase text-xl sm:text-2xl md:text-[24px]" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverettMono-Regular, monospace',
            lineHeight: '1.4',
            letterSpacing: '-0.96px',
            color: 'rgb(0, 0, 0)',
            marginBottom: '0px'
          }}>
            UNLOCKING UNLIMITED<br />POTENTIAL
          </h3>
          </StaggerChild>
          <StaggerChild>
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
              <motion.button
                whileHover={{ backgroundColor: '#FF4D00', color: '#FFFFFF' }}
                whileTap={{ scale: 0.95 }}
                className="text-sm md:text-[14px] font-normal transition-all duration-300 flex-1 sm:flex-none flex items-center justify-center gap-2"
                style={{
              fontFamily: 'TWKEverettMono-Regular, monospace',
                  color: '#000000',
              backgroundColor: 'transparent',
              padding: '12px 20px',
              textTransform: 'uppercase',
              letterSpacing: '-0.56px',
                  border: '2px solid #000000',
              borderRadius: '0px',
              cursor: 'pointer'
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              PREV
              </motion.button>
              <motion.button
                whileHover={{ backgroundColor: '#FF4D00', color: '#FFFFFF' }}
                whileTap={{ scale: 0.95 }}
                className="text-sm md:text-[14px] font-normal transition-all duration-300 flex-1 sm:flex-none flex items-center justify-center gap-2"
                style={{
              fontFamily: 'TWKEverettMono-Regular, monospace',
                  color: '#000000',
              backgroundColor: 'transparent',
              padding: '12px 20px',
              textTransform: 'uppercase',
              letterSpacing: '-0.56px',
                  border: '2px solid #000000',
              borderRadius: '0px',
              cursor: 'pointer'
                }}
              >
              NEXT
                <ChevronRight className="w-4 h-4" />
              </motion.button>
          </div>
          </StaggerChild>
        </StaggerChildren>

        <FadeInUp delay={0.2}>
          <h2 className="text-black max-w-5xl text-2xl sm:text-3xl md:text-4xl lg:text-[46.45px] leading-tight md:leading-[51.095px] mt-6 sm:mt-8 mb-4 sm:mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.858px',
          color: 'rgb(0, 0, 0)',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>
            WHERE MACHINES BECOME ECONOMIC AGENTS.
        </h2>
        </FadeInUp>

        <FadeInUp delay={0.3}>
          <motion.a
            href="/demos"
            whileHover={{ x: 5 }}
            className="text-sm md:text-[14px] font-normal hover:text-[#FF4D00] transition-colors link-hover inline-block mb-8 sm:mb-12 flex items-center gap-2"
            style={{
          fontFamily: 'TWKEverettMono-Regular, monospace',
          color: 'rgb(0, 0, 0)',
          textTransform: 'uppercase',
          letterSpacing: '-0.56px',
          textDecoration: 'underline',
            }}
          >
          View the Demos
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </FadeInUp>
        
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 list-none">
          {demos.map((demo, idx) => (
            <StaggerChild key={idx}>
              <ScaleOnHover>
                <li className="p-4 sm:p-6 md:p-8 bg-white border border-gray-200 hover:border-[#FF4D00] transition-all duration-300 card-hover" style={{ borderRadius: '0px' }}>
              <div className="w-full h-40 sm:h-48 bg-gray-100 mb-3 sm:mb-4" style={{ borderRadius: '0px' }}></div>
              <h4 className="text-black mb-2 sm:mb-3 text-base sm:text-lg" style={{
                fontWeight: 400,
                fontFamily: 'BaselGrotesk-Regular, sans-serif',
                lineHeight: '1.4',
                color: 'rgb(0, 0, 0)'
              }}>{demo.title}</h4>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg" style={{
                fontWeight: 400,
                fontFamily: 'BaselGrotesk-Regular, sans-serif',
                lineHeight: '1.4',
                color: 'rgb(0, 0, 0)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}>{demo.desc}</p>
            </li>
              </ScaleOnHover>
            </StaggerChild>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

