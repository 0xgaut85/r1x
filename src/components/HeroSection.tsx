'use client';

import TextScramble from './TextScramble';
import MagneticButton from './MagneticButton';
import ScrollIndicator from './ScrollIndicator';
import HeroBackground from './hero/HeroBackground';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Lazy load GSAP only for hero section
async function initGSAP() {
  if (typeof window === 'undefined') return null;
  
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Lazy load GSAP
    initGSAP().then((gsapLib) => {
      if (!gsapLib) return;
      
      const { gsap, ScrollTrigger } = gsapLib;

      // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (heroRef.current) {
        const children = Array.from(heroRef.current.children);
        if (children.length > 0) {
          gsap.set(children, { opacity: 0, y: 30 });
          
          const tl = gsap.timeline();
          tl.to(children, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'cubic-bezier(0.47, 0, 0.745, 0.715)'
          });
        }
      }

        // Parallax effect on scroll
        if (sectionRef.current && heroRef.current) {
          gsap.to(heroRef.current, {
            y: -100,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 1,
            },
          });
        }

        // Animated glow effect
        if (glowRef.current) {
          gsap.to(glowRef.current, {
            scale: 1.2,
            opacity: 0.3,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut',
          });
        }
    }, 100);

    return () => clearTimeout(timer);
    });
  }, []);

  // Ensure section maintains full width on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateWidth = () => {
      if (!sectionRef.current) return;
      
      // Use document.documentElement.clientWidth to exclude scrollbar
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      
      // Set width to exactly match viewport
      sectionRef.current.style.width = `${viewportWidth}px`;
      
      // Get position after width is set
      const rect = sectionRef.current.getBoundingClientRect();
      const currentLeft = rect.left;
      
      // Adjust margins to align with viewport left edge (0)
      if (currentLeft !== 0) {
        sectionRef.current.style.marginLeft = `${-currentLeft}px`;
      } else {
        sectionRef.current.style.marginLeft = '';
      }
      
      // Ensure right edge aligns with viewport
      const rightOffset = viewportWidth - (currentLeft + rect.width);
      if (Math.abs(rightOffset) > 1) { // Allow 1px tolerance for rounding
        sectionRef.current.style.marginRight = `${-rightOffset}px`;
      } else {
        sectionRef.current.style.marginRight = '';
      }
    };

    // Initial update with slight delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      updateWidth();
    }, 0);

    const handleResize = () => {
      updateWidth();
    };

    window.addEventListener('resize', handleResize);
    resizeHandlerRef.current = handleResize;

    return () => {
      clearTimeout(timeoutId);
      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
    };
  }, []);

  const scrambleTexts = ['Machine economy.', 'AI agents.', 'Robots.', 'Pay-per-use.'];
  const enterText = ['ENTER'];

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden" 
      style={{ 
        backgroundColor: '#000000', 
        position: 'relative', 
        zIndex: 0,
        width: typeof window !== 'undefined' ? `${window.innerWidth}px` : '100vw'
      }}
    >
      <HeroBackground />
      {/* Animated background glow */}
      <motion.div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 77, 0, 0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 1,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-[40px] relative z-10" style={{ maxWidth: 'none', paddingTop: '138.641px', paddingBottom: '80px' }}>
        <div className="hero-content" ref={heroRef as React.RefObject<HTMLDivElement>} style={{ textAlign: 'start', width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
          <p className="text-white text-lg sm:text-xl md:text-[22px] mb-4 sm:mb-6" style={{ 
            fontWeight: 400,
            fontFamily: 'TWKEverettMono-Regular, monospace',
            color: 'rgb(255, 255, 255)',
          }}>r1x enables</p>
          <p className="text-white text-lg sm:text-xl md:text-[22px] mb-6 sm:mb-8" style={{ 
            fontWeight: 400,
            fontFamily: 'TWKEverettMono-Regular, monospace',
            lineHeight: '1.3',
            letterSpacing: '-0.88px',
            color: 'rgb(255, 255, 255)',
          }}>
            <TextScramble texts={scrambleTexts} />
          </p>
          <h1 className="text-white text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px] mb-8 sm:mb-12" style={{ 
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.858px',
            color: 'rgb(255, 255, 255)',
          }}>
            From users to AI agents, from AI agents to robots.<br />Autonomy buys capabilities per request.<br />The web for robots runs on x402.
          </h1>
          <div className="flex flex-col sm:flex-row" style={{ marginBottom: '0px', marginTop: '0px', gap: '16px' }}>
            <MagneticButton
              href="/start-building"
              className="text-sm md:text-[14px] font-normal hover:opacity-90 transition-all duration-300 button-hover text-center sm:text-left w-full sm:w-auto"
              style={{
              fontFamily: 'TWKEverettMono-Regular, monospace',
                color: '#000000',
                backgroundColor: '#FF4D00',
              padding: '16px 24px',
              textTransform: 'uppercase',
              letterSpacing: '-0.56px',
              border: 'none',
              borderRadius: '0px',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(255, 77, 0, 0.3)',
                clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                margin: '0',
              }}
            >
              Try r1x Agent
            </MagneticButton>
            <MagneticButton
              href="/docs"
              className="text-sm md:text-[14px] font-normal hover:bg-white/10 transition-all duration-300 text-center sm:text-left w-full sm:w-auto"
              style={{
              fontFamily: 'TWKEverettMono-Regular, monospace',
                color: '#FFFFFF',
              backgroundColor: 'transparent',
              padding: '16px 24px',
              textTransform: 'uppercase',
              letterSpacing: '-0.56px',
                border: '2px solid #FFFFFF',
              borderRadius: '0px',
                textDecoration: 'none',
                cursor: 'pointer',
                margin: '0',
              }}
            >
              Docs
            </MagneticButton>
          </div>
          <p className="text-white text-2xl sm:text-3xl md:text-[40px] leading-tight md:leading-[56px]" style={{ 
            fontWeight: 400,
            fontFamily: 'TWKEverettMono-Regular, monospace',
            color: 'rgb(255, 255, 255)',
            marginTop: '12px',
            marginBottom: '40px'
          }}>
            [<TextScramble texts={enterText} speed={40} />]
          </p>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  );
}

