import * as THREE from 'three';

class RendererManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private animationId: number | null = null;
  private time: number = 0;
  private prefersReducedMotion: boolean;

  constructor(canvas: HTMLCanvasElement) {
    // Check for reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create renderer with DPR cap
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setClearColor(0x000000, 0);

    // Create scene
    this.scene = new THREE.Scene();

    // Create orthographic camera for 2D-like effects
    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera = new THREE.OrthographicCamera(
      -aspect,
      aspect,
      1,
      -1,
      0.1,
      1000
    );
    this.camera.position.z = 1;

    // Handle resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.OrthographicCamera {
    return this.camera;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  getTime(): number {
    return this.time;
  }

  shouldReduceMotion(): boolean {
    return this.prefersReducedMotion;
  }

  private handleResize() {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.renderer.setSize(width, height);

    const aspect = width / height;
    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.updateProjectionMatrix();
  }

  animate(callback: (time: number) => void) {
    const animateLoop = (timestamp: number) => {
      this.time = timestamp * 0.001; // Convert to seconds
      callback(this.time);
      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(animateLoop);
    };
    this.animationId = requestAnimationFrame(animateLoop);
  }

  dispose() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }
}

export { RendererManager };

