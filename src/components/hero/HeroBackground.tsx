'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0.5, y: 0.5 }); // normalized 0..1
  const currentRef = useRef({ x: 0.5, y: 0.5 }); // normalized 0..1
  const reduceMotionRef = useRef(false as boolean);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    reduceMotionRef.current = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const container = containerRef.current;
    if (!container) return;

    // Create canvas and check WebGL
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.right = '0';
    canvas.style.bottom = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglSupported(false);
      return () => {
        if (container.contains(canvas)) container.removeChild(canvas);
      };
    }

    setWebglSupported(true);

    // Three.js setup
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, premultipliedAlpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

    // Shaders: GPU repulsion near mouse, otherwise static
    const uniforms = {
      u_mouse: { value: new THREE.Vector2(9999, 9999) },
      u_aspect: { value: 1 },
      u_radius: { value: 0.16 }, // interaction radius
      u_strength: { value: 0.018 }, // displacement amount
      u_pointSize: { value: 1.4 }, // px size
      u_pixelRatio: { value: Math.min(2, window.devicePixelRatio || 1) },
      u_baseAlpha: { value: 0.4 },
    };

    const vertexShader = `
      precision mediump float;
      attribute vec3 position;
      attribute float aIntensity;
      uniform vec2 u_mouse; // in camera space: x in [-aspect, aspect], y in [-1,1]
      uniform float u_aspect;
      uniform float u_radius;
      uniform float u_strength;
      uniform float u_pointSize;
      uniform float u_pixelRatio;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        vec2 delta = vec2(pos.x - u_mouse.x, pos.y - u_mouse.y);
        delta.x /= u_aspect; // aspect-correct distance
        float dist = length(delta);
        float influence = smoothstep(u_radius, 0.0, dist);
        vec2 dir = normalize(delta + 1e-6);
        pos.xy += dir * influence * u_strength;
        gl_Position = vec4(pos, 1.0);
        gl_PointSize = u_pointSize * u_pixelRatio;
        vAlpha = aIntensity * ${/* embed base alpha in fragment via uniform */''} 1.0;
      }
    `;

    const fragmentShader = `
      precision mediump float;
      uniform float u_baseAlpha;
      varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        float mask = smoothstep(0.5, 0.45, r); // soft edge circle
        gl_FragColor = vec4(1.0, 1.0, 1.0, mask * vAlpha * u_baseAlpha);
      }
    `;

    const material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    let points: THREE.Points | null = null;

    const build = (width: number, height: number) => {
      if (points) {
        scene.remove(points);
        (points.geometry as THREE.BufferGeometry).dispose();
      }

      const positions: number[] = [];
      const intensities: number[] = [];

      const columnSpacings = [8, 9, 10, 8, 9, 10, 8, 9, 10, 8, 9, 10, 8, 9, 10];
      const rowSpacing = 8;
      let currentX = 0;
      let colIndex = 0;

      while (currentX < width) {
        const colSpacing = columnSpacings[colIndex % columnSpacings.length];
        let currentY = 0;
        while (currentY < height) {
          // brightness ~ 0.75..1.0 then alpha scaled in shader by u_baseAlpha
          const hash = ((currentX * 131 + currentY * 137) % 1000) / 1000.0;
          const intensity = 0.75 + hash * 0.25;
          const x = (currentX / width) * 2.0 - 1.0;
          const y = -((currentY / height) * 2.0 - 1.0);
          positions.push(x, y, 0);
          intensities.push(intensity);
          currentY += rowSpacing;
        }
        currentX += colSpacing;
        colIndex++;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('aIntensity', new THREE.Float32BufferAttribute(intensities, 1));
      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    const resize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
      uniforms.u_aspect.value = aspect;
      uniforms.u_pixelRatio.value = Math.min(2, window.devicePixelRatio || 1);
      build(w, h);
      renderer.render(scene, camera);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener('resize', resize);
    setTimeout(resize, 0);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetRef.current.x = (e.clientX - rect.left) / rect.width;
      targetRef.current.y = (e.clientY - rect.top) / rect.height;
    };
    const handleMouseLeave = () => {
      targetRef.current.x = 0.5;
      targetRef.current.y = 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      const ease = 0.1;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * ease;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * ease;

      // Update mouse uniform in camera space
      const aspect = uniforms.u_aspect.value as number;
      const mx = (currentRef.current.x * 2.0 - 1.0) * aspect;
      const my = - (currentRef.current.y * 2.0 - 1.0);
      (uniforms.u_mouse.value as THREE.Vector2).set(mx, my);

      // Subtle glow follows cursor
      const glow = glowRef.current;
      if (glow) {
        const maxTranslate = 24;
        const tx = (currentRef.current.x - 0.5) * 2 * maxTranslate;
        const ty = (currentRef.current.y - 0.5) * 2 * maxTranslate;
        const scale = 1 + Math.hypot(currentRef.current.x - 0.5, currentRef.current.y - 0.5) * 0.1;
        glow.style.transform = `translate(-50%, -50%) translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
        glow.style.opacity = reduceMotionRef.current ? '0.18' : '0.26';
      }

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      ro.disconnect();
      if (points) {
        scene.remove(points);
        (points.geometry as THREE.BufferGeometry).dispose();
      }
      material.dispose();
      renderer.dispose();
      if (container.contains(canvas)) container.removeChild(canvas);
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
      {!webglSupported && (
        <div
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
          }}
        />
      )}
    </div>
  );
}
