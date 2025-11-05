'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RendererManager } from '@/lib/three/RendererManager';
import { GridMaterial } from '@/lib/three/GridMaterial';
import { SpotlightMaterial } from '@/lib/three/SpotlightMaterial';
import { ScanlineMaterial } from '@/lib/three/ScanlineMaterial';
import { NoiseGrainMaterial } from '@/lib/three/NoiseGrainMaterial';
import { Particles } from '@/lib/three/Particles';

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const managerRef = useRef<RendererManager | null>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL support
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
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
    const manager = new RendererManager(canvas);
    managerRef.current = manager;

    const scene = manager.getScene();
    const reduceMotion = manager.shouldReduceMotion();

    // Create fullscreen quad geometries (one per mesh for proper disposal)
    const gridGeometry = new THREE.PlaneGeometry(2, 2);
    const spotlightGeometry = new THREE.PlaneGeometry(2, 2);
    const scanlineGeometry = new THREE.PlaneGeometry(2, 2);
    const noiseGrainGeometry = new THREE.PlaneGeometry(2, 2);

    // Create materials
    const gridMaterial = new GridMaterial(reduceMotion);
    const spotlightMaterial = new SpotlightMaterial(reduceMotion);
    const scanlineMaterial = new ScanlineMaterial(reduceMotion);
    const noiseGrainMaterial = new NoiseGrainMaterial(reduceMotion);

    // Create meshes
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    const spotlightMesh = new THREE.Mesh(spotlightGeometry, spotlightMaterial);
    const scanlineMesh = new THREE.Mesh(scanlineGeometry, scanlineMaterial);
    const noiseGrainMesh = new THREE.Mesh(noiseGrainGeometry, noiseGrainMaterial);

    // Add to scene
    scene.add(gridMesh);
    scene.add(spotlightMesh);
    scene.add(scanlineMesh);
    scene.add(noiseGrainMesh);

    // Create particles
    const particleCount = reduceMotion ? 0 : Math.min(60, Math.floor(window.innerWidth / 20));
    const particles = new Particles(particleCount, reduceMotion);
    if (particleCount > 0) {
      scene.add(particles.getMesh());
    }

    // Update resolution
    const resolution = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);

    // Animation loop
    manager.animate((time) => {
      resolution.set(canvas.clientWidth, canvas.clientHeight);

      gridMaterial.update(time, resolution, reduceMotion);
      spotlightMaterial.update(time, resolution, reduceMotion);
      scanlineMaterial.update(time, resolution, reduceMotion);
      noiseGrainMaterial.update(time, resolution, reduceMotion);
      particles.update(time);
    });

    // Cleanup
    return () => {
      manager.dispose();
      gridGeometry.dispose();
      spotlightGeometry.dispose();
      scanlineGeometry.dispose();
      noiseGrainGeometry.dispose();
      gridMaterial.dispose();
      spotlightMaterial.dispose();
      scanlineMaterial.dispose();
      noiseGrainMaterial.dispose();
      particles.dispose();
    };
  }, []);

  // Fallback to CSS gradient if WebGL not supported
  if (!webglSupported) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #0A0A0A 50%, #000000 100%)',
          backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255, 77, 0, 0.1) 0%, transparent 50%)',
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

