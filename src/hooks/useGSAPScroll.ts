'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook to animate elements on scroll using GSAP ScrollTrigger
 * Matches the animation style from nillion.com
 */
export function useGSAPScroll(ref: React.RefObject<HTMLElement>, options?: {
  start?: string;
  once?: boolean;
  stagger?: number;
  delay?: number;
}) {
  const { start = 'top 80%', once = true, stagger = 0.1, delay = 0 } = options || {};

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;

    const element = ref.current;
    const children = Array.from(element.children) as HTMLElement[];

    // Set initial state
    gsap.set(children, { opacity: 0, y: 30 });

    // Create scroll trigger animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: start,
        once: once,
        onEnter: () => {
          tl.play();
        }
      }
    });

    tl.to(children, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: stagger,
      ease: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
      delay: delay
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars?.trigger === element) {
          trigger.kill();
        }
      });
      tl.kill();
    };
  }, [ref, start, once, stagger, delay]);
}

/**
 * Hook for single element scroll animation
 */
export function useGSAPScrollElement(ref: React.RefObject<HTMLElement>, options?: {
  start?: string;
  once?: boolean;
  delay?: number;
}) {
  const { start = 'top 80%', once = true, delay = 0 } = options || {};

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;

    const element = ref.current;
    
    // Set initial state
    gsap.set(element, { opacity: 0, y: 30 });

    // Create scroll trigger animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: start,
        once: once
      }
    });

    tl.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
      delay: delay
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars?.trigger === element) {
          trigger.kill();
        }
      });
      tl.kill();
    };
  }, [ref, start, once, delay]);
}



