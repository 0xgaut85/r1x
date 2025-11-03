'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseGSAPAnimationProps {
  trigger?: string | HTMLElement | null;
  animation?: (ctx: gsap.Context) => void;
  dependencies?: any[];
}

export function useGSAPAnimation({ trigger, animation, dependencies = [] }: UseGSAPAnimationProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      if (animation) {
        animation(ctx);
      }
    }, ref);

    return () => {
      ctx.revert();
    };
  }, dependencies);

  return ref;
}

export function useScrollTrigger(selector: string, animation: (element: HTMLElement) => void, dependencies: any[] = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const elements = document.querySelectorAll<HTMLElement>(selector);
    
    elements.forEach((element) => {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 80%',
        onEnter: () => animation(element),
        once: true,
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, dependencies);
}


