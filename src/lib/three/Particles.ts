import * as THREE from 'three';

export class Particles {
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private positions: Float32Array;
  private velocities: Float32Array;
  private count: number;
  private reduceMotion: boolean;

  constructor(count: number, reduceMotion: boolean = false) {
    this.count = reduceMotion ? 0 : count;
    this.reduceMotion = reduceMotion;

    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 2);

    // Initialize positions and velocities
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const i2 = i * 2;

      // Random positions
      this.positions[i3] = Math.random() * 2 - 1;
      this.positions[i3 + 1] = Math.random() * 2 - 1;
      this.positions[i3 + 2] = 0;

      // Slow drift velocities
      this.velocities[i2] = (Math.random() - 0.5) * 0.0002;
      this.velocities[i2 + 1] = (Math.random() - 0.5) * 0.0002;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    // Create material with orange tint
    this.material = new THREE.PointsMaterial({
      color: 0xff4d00,
      size: 1.5,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
  }

  getMesh(): THREE.Points {
    return this.points;
  }

  update(time: number) {
    if (this.reduceMotion || this.count === 0) return;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const i2 = i * 2;

      // Update positions with drift
      this.positions[i3] += this.velocities[i2];
      this.positions[i3 + 1] += this.velocities[i2 + 1];

      // Wrap around edges
      if (this.positions[i3] > 1) this.positions[i3] = -1;
      if (this.positions[i3] < -1) this.positions[i3] = 1;
      if (this.positions[i3 + 1] > 1) this.positions[i3 + 1] = -1;
      if (this.positions[i3 + 1] < -1) this.positions[i3 + 1] = 1;

      // Occasional twinkle (rare)
      if (Math.random() < 0.001) {
        this.material.opacity = 0.9;
      } else {
        this.material.opacity = 0.6;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

