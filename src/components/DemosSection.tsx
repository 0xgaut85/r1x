'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from './motion';
import GrainImage from './GrainImage';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const demos = [
  { title: "Paid API calls", desc: "Monetize every endpoint instantly. Agents pay per request in USDC. Your backend becomes a revenue stream today.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10" },
  { title: "Agent marketplaces", desc: "List services agents discover and purchase automatically. Build the next Stripe for AI. We provide the payment rails.", image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10" },
  { title: "Premium models", desc: "Gate your LLMs behind x402. Agents pay per token. Instant settlement. This is how AI model creators monetize at scale.", image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10" },
  { title: "Live data feeds", desc: "Market data, social graphs, sensor networks—all x402‑protected. Agents pay per access. Build Bloomberg for machines.", image: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10" },
  { title: "GPU‑as‑a‑service", desc: "Agents rent your idle compute. Per‑second billing. USDC settlement. Turn every GPU into passive income.", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10" },
  { title: "Gated knowledge", desc: "Proprietary datasets, research, trained embeddings—agents pay to access. Intellectual property meets machine payments.", image: "https://images.unsplash.com/photo-1485322551133-3a4c27a9d925?w=800&h=600&fit=crop&q=80&sat=-100&con=15&exp=-10" },
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
            AGENT‑NATIVE<br />REVENUE STREAMS
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
            BUILD THE SERVICES AGENTS WILL PAY BILLIONS FOR.
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
              <div className="w-full h-40 sm:h-48 overflow-hidden mb-3 sm:mb-4" style={{ borderRadius: '0px' }}>
                <GrainImage src={demo.image} alt={demo.title} className="w-full h-full" />
              </div>
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

