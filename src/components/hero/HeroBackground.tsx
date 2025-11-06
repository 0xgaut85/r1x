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
  const headerObserverRef = useRef<ResizeObserver | null>(null);
  const logoTextureRef = useRef<THREE.Texture | null>(null);
  const heroObserverRef = useRef<ResizeObserver | null>(null);

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
    canvas.style.zIndex = '1';
    container.appendChild(canvas);

    // Test WebGL support on a temporary canvas to avoid occupying the real one
    try {
      const test = document.createElement('canvas');
      const testCtx = test.getContext('webgl') || test.getContext('experimental-webgl');
      if (!testCtx) {
        setWebglSupported(false);
        return () => {
          if (container.contains(canvas)) container.removeChild(canvas);
        };
      }
    } catch (e) {
      setWebglSupported(false);
      return () => {
        if (container.contains(canvas)) container.removeChild(canvas);
      };
    }

    // Three.js setup (let Three create its own context on this canvas)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, premultipliedAlpha: true });
    setWebglSupported(true);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

    // Shaders: default motion with waves, no cursor
    const uniforms: { [key: string]: { value: any } } = {
      u_pointSize: { value: 1.8 },
      u_pixelRatio: { value: Math.min(2, window.devicePixelRatio || 1) },
      u_baseAlpha: { value: 0.5 },
      u_glowColor: { value: new THREE.Color(1.0, 0.302, 0.0) },
      u_ambient: { value: 0.35 },
      u_diffuse: { value: 0.8 },
      u_time: { value: 0.0 },
      u_scanWidth: { value: 0.6 },
      u_waveAmp: { value: 0.055 },
      u_waveFreq: { value: 6.0 },
      u_waveSpeedX: { value: 0.6 },
      u_waveSpeedY: { value: 0.8 }
    };

    // (No cursor/logo mask required)

    const vertexShader = `
      precision mediump float;
      attribute vec3 position;
      attribute float aIntensity;
      uniform float u_pointSize;
      uniform float u_pixelRatio;
      uniform float u_time;
      uniform float u_scanWidth;
      uniform float u_waveAmp;
      uniform float u_waveFreq;
      uniform float u_waveSpeedX;
      uniform float u_waveSpeedY;
      varying float vAlpha;
      varying float vMask;
      varying float vScan;
      void main() {
        vec3 pos = position;
        // Wave motion
        float wave1 = sin(pos.y * u_waveFreq + u_time * u_waveSpeedX);
        float wave2 = sin(pos.x * (u_waveFreq * 1.2) - u_time * u_waveSpeedY);
        float wave = 0.5 * (wave1 + wave2);
        pos.x += u_waveAmp * wave * 0.8;
        pos.y += u_waveAmp * wave * 0.6;
        pos.z -= abs(wave) * 0.08;
        // Scanning band left->right->left via sin time
        float s = 0.5 + 0.5 * sin(u_time);
        float scanCenter = mix(-1.2, 1.2, s);
        float bandL = smoothstep(scanCenter - u_scanWidth, scanCenter, pos.x);
        float bandR = 1.0 - smoothstep(scanCenter, scanCenter + u_scanWidth, pos.x);
        float band = clamp(bandL * bandR, 0.0, 1.0);
        vScan = band;
        gl_Position = vec4(pos, 1.0);
        gl_PointSize = u_pointSize * (1.0 + abs(wave) * 0.5) * u_pixelRatio;
        vAlpha = aIntensity * 1.0;
        vMask = abs(wave);
      }
    `;

    const fragmentShader = `
      precision mediump float;
      uniform float u_baseAlpha;
      uniform vec3 u_glowColor;
      uniform float u_ambient;
      uniform float u_diffuse;
      varying float vAlpha;
      varying float vMask;
      varying float vScan;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        float inside = step(r, 0.5);
        // Fake sphere normal from point coord
        vec3 n = normalize(vec3(c, sqrt(max(0.0, 0.25 - r*r))));
        vec3 L = normalize(vec3(-0.35, 0.55, 0.75));
        float lambert = max(0.0, dot(n, L));
        float light = u_ambient + u_diffuse * lambert;
        vec3 base = vec3(1.0);
        vec3 tinted = mix(base, u_glowColor, clamp(pow(vMask, 1.2) * 0.6, 0.0, 1.0));
        vec3 color = tinted * light;
        float mask = smoothstep(0.5, 0.45, r) * inside;
        float scanAlpha = max(0.12, vScan); // ensure subtle base visibility
        gl_FragColor = vec4(color, mask * vAlpha * u_baseAlpha * scanAlpha);
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
      // Rebuild points to restore original look
      if (points) {
        const g = (points as any).geometry as THREE.BufferGeometry | undefined;
        if (g) g.dispose();
        scene.remove(points as any);
        points = null;
      }

      const positions: number[] = [];
      const intensities: number[] = [];

      const columnSpacings = [8, 9, 10, 8, 9, 10, 8, 9, 10, 8, 9, 10, 8, 9, 10];
      const rowSpacing = 8;

      // Overscan to allow waves without exposing edges, mapped back to clip space
      // Same method as sides - no clamping, just sufficient overscan
      const overscanX = Math.ceil(width * 0.5); // Much bigger overscan
      const overscanY = Math.ceil(height * 0.7); // Much bigger overscan

      const xPositionsPx: number[] = [];
      let currentX = -overscanX;
      let colIndex = 0;
      while (currentX < width + overscanX) {
        xPositionsPx.push(currentX);
        currentX += columnSpacings[colIndex % columnSpacings.length];
        colIndex++;
      }
      if (xPositionsPx[xPositionsPx.length - 1] < width + overscanX) xPositionsPx.push(width + overscanX);

      const yPositionsPx: number[] = [];
      let currentY = -overscanY;
      while (currentY < height + overscanY) {
        yPositionsPx.push(currentY);
        currentY += rowSpacing;
      }
      if (yPositionsPx[yPositionsPx.length - 1] < height + overscanY) yPositionsPx.push(height + overscanY);

      for (let xi = 0; xi < xPositionsPx.length; xi++) {
        const px = xPositionsPx[xi];
        for (let yi = 0; yi < yPositionsPx.length; yi++) {
          const py = yPositionsPx[yi];
          const hash = ((px * 131 + py * 137) % 1000) / 1000.0;
          const intensity = 0.75 + hash * 0.25;
          const x = (px / width) * 2.0 - 1.0;
          const y = -((py / height) * 2.0 - 1.0);
          positions.push(x, y, 0);
          intensities.push(intensity);
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('aIntensity', new THREE.Float32BufferAttribute(intensities, 1));
      points = new THREE.Points(geometry, material);
      (points as any).renderOrder = 3;
      scene.add(points);
    };

    const resize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      // Use actual container dimensions (includes extended height from syncToHeroRect)
      const w = Math.max(1, Math.ceil(rect.width));
      const h = Math.max(1, Math.ceil(rect.height));
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      renderer.setSize(w, h, false);
      camera.left = -1;
      camera.right = 1;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
      uniforms.u_pixelRatio.value = Math.min(2, window.devicePixelRatio || 1);
      build(w, h);
      renderer.render(scene, camera);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener('resize', resize);
    setTimeout(resize, 0);

    // Dynamically extend background to cover header height exactly
    const adjustForHeader = () => {
      const el = containerRef.current;
      if (!el) return;
      const header = document.querySelector('header');
      const h = header ? Math.ceil((header as HTMLElement).getBoundingClientRect().height) : 0;
      el.style.top = h > 0 ? `-${h}px` : '0px';
      el.style.height = h > 0 ? `calc(100% + ${h}px)` : '100%';
    };
    adjustForHeader();
    window.addEventListener('resize', adjustForHeader);
    const head = document.querySelector('header');
    if (head) {
      const ho = new ResizeObserver(adjustForHeader);
      ho.observe(head);
      headerObserverRef.current = ho;
    }

    // Pin background to hero rect via fixed positioning to avoid layout-induced gaps
    // Extend upward to cover navbar area
    const syncToHeroRect = () => {
      const el = containerRef.current as HTMLDivElement | null;
      if (!el) return;
      const heroEl = el.parentElement as HTMLElement | null;
      if (!heroEl) return;
      const header = document.querySelector('header');
      const headerHeight = header ? Math.ceil((header as HTMLElement).getBoundingClientRect().height) : 0;
      const r = heroEl.getBoundingClientRect();
      el.style.position = 'fixed';
      el.style.top = `${Math.floor(r.top - headerHeight)}px`; // Extend above hero by header height
      el.style.left = `${Math.floor(r.left)}px`;
      el.style.width = `${Math.ceil(r.width)}px`;
      el.style.height = `${Math.ceil(r.height + headerHeight * 2)}px`; // Extra height to ensure coverage
      // Trigger resize to update canvas with new dimensions
      setTimeout(() => resize(), 0);
    };
    syncToHeroRect();
    window.addEventListener('scroll', syncToHeroRect, { passive: true });
    window.addEventListener('resize', syncToHeroRect);
    const heroEl = container.parentElement as HTMLElement | null;
    if (heroEl) {
      const ho2 = new ResizeObserver(syncToHeroRect);
      ho2.observe(heroEl);
      heroObserverRef.current = ho2;
    }

    // No cursor interaction

    const animate = (t: number = 0) => {
      // Slower time for band and waves
      uniforms.u_time.value = t * 0.001 * 0.5;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // no mouse listeners to remove
      ro.disconnect();
      if (headerObserverRef.current) {
        headerObserverRef.current.disconnect();
        headerObserverRef.current = null;
      }
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', adjustForHeader);
      window.removeEventListener('resize', syncToHeroRect);
      window.removeEventListener('scroll', syncToHeroRect);
      if (heroObserverRef.current) {
        heroObserverRef.current.disconnect();
        heroObserverRef.current = null;
      }
      if (points) {
        const geom = (points as any).geometry as THREE.BufferGeometry | undefined;
        if (geom) geom.dispose();
        scene.remove(points as any);
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
        zIndex: 0, // Behind navbar (navbar is z-50), extends above hero
        overflow: 'hidden',
        backgroundColor: '#000000',
      }}
    >
      
      {/* Static top band to cover wave gaps */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '20px',
          background: 'linear-gradient(to bottom, #000000 0%, #000000 60%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
      
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
          zIndex: 2,
        }}
      />
    </div>
  );
}
