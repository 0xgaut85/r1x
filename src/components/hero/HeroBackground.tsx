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
  const logoTextureRef = useRef<THREE.Texture | null>(null);

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
      u_waveAmp: { value: 0.045 },
      u_waveFreq: { value: 6.0 },
      u_waveSpeedX: { value: 0.6 },
      u_waveSpeedY: { value: 0.8 },
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

    // No cursor interaction

    const animate = (t: number = 0) => {
      // Slower time for band and waves
      uniforms.u_time.value = t * 0.001 * 0.45;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // no mouse listeners to remove
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
