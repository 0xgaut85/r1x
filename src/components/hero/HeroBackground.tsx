'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RendererManager } from '@/lib/three/RendererManager';

export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const managerRef = useRef<RendererManager | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Skip if manager already exists (React StrictMode protection)
    if (managerRef.current) return;

    // Create canvas programmatically to ensure it's fresh
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    // Check WebGL support without creating a context on the actual canvas
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    // Check for reduced motion preference
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create renderer manager
    let manager: RendererManager;
    try {
      manager = new RendererManager(canvasRef.current!);
      managerRef.current = manager;
    } catch (e) {
      console.error('Failed to create WebGL renderer:', e);
      setWebglSupported(false);
      return;
    }

    const scene = manager.getScene();
    const reduceMotion = manager.shouldReduceMotion();

    // Set black background
    manager.getRenderer().setClearColor(0x000000, 1);

    // Create optimized dot pattern matching banner design
    // Use fewer dots but match the visual pattern from banner
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Optimized: single layer with optimized spacing for performance
    const dotSpacing = 12; // pixels - slightly larger spacing for better performance
    const cols = Math.ceil(width / dotSpacing);
    const rows = Math.ceil(height / dotSpacing);
    
    // Limit total dots for performance (max ~3000 dots for smooth 60fps)
    const maxDots = 3000;
    const totalDots = cols * rows;
    const skipFactor = totalDots > maxDots ? Math.ceil(totalDots / maxDots) : 1;
    
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const offsets: number[] = [];
    
    let dotCount = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Skip dots if too many
        if (dotCount % skipFactor !== 0) {
          dotCount++;
          continue;
        }
        dotCount++;
        
        // Minimal random offset for natural look
        const offsetX = (Math.random() - 0.5) * 1;
        const offsetY = (Math.random() - 0.5) * 1;
        
        const x = ((j * dotSpacing + offsetX) / width) * 2 - 1;
        const y = -((i * dotSpacing + offsetY) / height) * 2 + 1;
        const aspect = width / height;
        
        positions.push(x * aspect, y, 0);
        
        // White color
        colors.push(1.0, 1.0, 1.0);
        
        // Size variation matching banner (0.6-0.9px)
        sizes.push(0.7 + Math.random() * 0.2);
        
        // Store original position for mouse interaction
        offsets.push(x * aspect, y);
      }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('offset', new THREE.Float32BufferAttribute(offsets, 2));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(width, height) },
        uRadius: { value: 0.12 }, // Mouse influence radius
        uStrength: { value: reduceMotion ? 0 : 0.06 }, // How much dots move
      },
      vertexShader: `
        attribute float size;
        attribute vec2 offset;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        uniform float uRadius;
        uniform float uStrength;
        
        varying vec3 vColor;
        
        void main() {
          vec3 pos = position;
          
          // Calculate distance from mouse in normalized coordinates
          vec2 mousePos = vec2(uMouse.x * 2.0 - 1.0, -(uMouse.y * 2.0 - 1.0)) * vec2(uResolution.x / uResolution.y, 1.0);
          vec2 currentPos = vec2(pos.x, pos.y);
          float dist = distance(currentPos, mousePos);
          
          // Repel dots from mouse cursor (optimized)
          if (dist < uRadius) {
            vec2 dir = normalize(currentPos - mousePos);
            float force = (1.0 - dist / uRadius) * uStrength;
            pos.xy += dir * force;
          }
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (300.0 / -mvPosition.z);
          
          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          // Match banner dot opacity (0.3-0.4 range)
          float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * 0.35;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
    
    const dots = new THREE.Points(geometry, material);
    scene.add(dots);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Update resolution
    const resolution = new THREE.Vector2(canvasRef.current.clientWidth, canvasRef.current.clientHeight);

    // Animation loop
    manager.animate((time) => {
      if (!canvasRef.current) return;
      resolution.set(canvasRef.current.clientWidth, canvasRef.current.clientHeight);

      // Update dot material
      const material = dots.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = reduceMotion ? 0 : time;
      material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
      material.uniforms.uResolution.value.copy(resolution);
    });

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (managerRef.current) {
        managerRef.current.dispose();
        managerRef.current = null;
      }
      geometry.dispose();
      material.dispose();
      scene.remove(dots);
      if (canvasRef.current && containerRef.current && containerRef.current.contains(canvasRef.current)) {
        containerRef.current.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, []);

  // Fallback to CSS gradient if WebGL not supported
  if (!webglSupported) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: '#000000',
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 0.8px, transparent 0.8px),
            radial-gradient(circle at 8px 5px, rgba(255,255,255,0.35) 0.7px, transparent 0.7px),
            radial-gradient(circle at 15px 12px, rgba(255,255,255,0.3) 0.9px, transparent 0.9px)
          `,
          backgroundSize: '8px 8px, 9px 9px, 10px 10px',
          opacity: 0.3,
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  );
}
