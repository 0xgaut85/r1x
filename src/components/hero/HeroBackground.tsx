'use client';

import { useEffect, useRef } from 'react';

export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsLayerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const reduceMotionRef = useRef(false as boolean);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    reduceMotionRef.current = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      targetRef.current.x = mx - 0.5;
      targetRef.current.y = my - 0.5;
    };
    const handleMouseLeave = () => {
      targetRef.current.x = 0;
      targetRef.current.y = 0;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      const ease = 0.08;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * ease;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * ease;

      const dotsLayer = dotsLayerRef.current;
      if (dotsLayer) {
        const maxShift = 16; // px
        const sx = Math.round(currentRef.current.x * maxShift);
        const sy = Math.round(currentRef.current.y * maxShift);
        const multipliers = [1.0, 1.15, 1.3, 1.45, 1.6, 1.75, 1.9, 2.05, 2.2, 2.35, 2.5, 2.65, 2.8, 2.95, 3.1];
        dotsLayer.style.backgroundPosition = multipliers.map(m => `${Math.round(sx * m)}px ${Math.round(sy * m)}px`).join(', ');
      }

      const glow = glowRef.current;
      if (glow) {
        const maxTranslate = 24; // px
        const tx = currentRef.current.x * maxTranslate;
        const ty = currentRef.current.y * maxTranslate;
        const scale = 1 + Math.hypot(currentRef.current.x, currentRef.current.y) * 0.08;
        glow.style.transform = `translate(-50%, -50%) translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
        glow.style.opacity = reduceMotionRef.current ? '0.18' : '0.26';
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        backgroundColor: '#000000',
      }}
    >
      <div
        ref={glowRef}
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          width: '480px',
          height: '480px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '9999px',
          background: 'radial-gradient(circle, rgba(255, 77, 0, 0.18) 0%, rgba(255,77,0,0) 60%)',
          opacity: 0.22,
          willChange: 'transform, opacity',
          mixBlendMode: 'screen',
          filter: 'blur(60px)',
          zIndex: 1,
        }}
      />
      <div
        ref={dotsLayerRef}
        className="absolute inset-0"
        style={{
          pointerEvents: 'none',
          zIndex: 1,
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 0.8px, transparent 0.8px),
            radial-gradient(circle at 8px 5px, rgba(255,255,255,0.35) 0.7px, transparent 0.7px),
            radial-gradient(circle at 15px 12px, rgba(255,255,255,0.3) 0.9px, transparent 0.9px),
            radial-gradient(circle at 22px 8px, rgba(255,255,255,0.38) 0.6px, transparent 0.6px),
            radial-gradient(circle at 28px 18px, rgba(255,255,255,0.32) 0.85px, transparent 0.85px),
            radial-gradient(circle at 35px 14px, rgba(255,255,255,0.36) 0.75px, transparent 0.75px),
            radial-gradient(circle at 42px 25px, rgba(255,255,255,0.33) 0.8px, transparent 0.8px),
            radial-gradient(circle at 48px 19px, rgba(255,255,255,0.37) 0.7px, transparent 0.7px),
            radial-gradient(circle at 55px 31px, rgba(255,255,255,0.31) 0.9px, transparent 0.9px),
            radial-gradient(circle at 62px 24px, rgba(255,255,255,0.34) 0.65px, transparent 0.65px),
            radial-gradient(circle at 68px 38px, rgba(255,255,255,0.32) 0.8px, transparent 0.8px),
            radial-gradient(circle at 75px 29px, rgba(255,255,255,0.35) 0.75px, transparent 0.75px),
            radial-gradient(circle at 82px 42px, rgba(255,255,255,0.33) 0.7px, transparent 0.7px),
            radial-gradient(circle at 88px 35px, rgba(255,255,255,0.36) 0.85px, transparent 0.85px),
            radial-gradient(circle at 95px 47px, rgba(255,255,255,0.3) 0.8px, transparent 0.8px)
          `,
          backgroundSize: `
            8px 8px, 9px 9px, 10px 10px, 8px 8px, 9px 9px, 10px 10px,
            8px 8px, 9px 9px, 10px 10px, 8px 8px, 9px 9px, 10px 10px,
            8px 8px, 9px 9px, 10px 10px
          `,
          opacity: 0.4,
          willChange: 'background-position',
        }}
      />
    </div>
  );
}
