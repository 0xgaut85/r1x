import * as THREE from 'three';

const spotlightVert = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const spotlightFrag = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uIntensity;
uniform float uRadius;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  
  // Animate center position with slow drift
  vec2 center = uCenter + 0.1 * vec2(
    sin(uTime * 0.05),
    cos(uTime * 0.033)
  );
  
  float dist = distance(uv, center);
  float falloff = smoothstep(uRadius, 0.0, dist);
  
  // Create radial gradient
  vec3 gradient = mix(uColorA, uColorB, falloff);
  float alpha = falloff * uIntensity;
  
  gl_FragColor = vec4(gradient * alpha, alpha);
}
`;

export class SpotlightMaterial extends THREE.ShaderMaterial {
  constructor(reduceMotion: boolean = false) {
    const colorA = new THREE.Color(0xff4d00); // #FF4D00
    const colorB = new THREE.Color(0xff6b35); // #FF6B35

    super({
      vertexShader: spotlightVert,
      fragmentShader: spotlightFrag,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uCenter: { value: new THREE.Vector2(0.3, 0.7) },
        uColorA: { value: colorA },
        uColorB: { value: colorB },
        uIntensity: { value: reduceMotion ? 0.2 : 0.35 },
        uRadius: { value: 0.6 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }

  update(time: number, resolution: THREE.Vector2, reduceMotion: boolean) {
    this.uniforms.uTime.value = reduceMotion ? 0 : time;
    this.uniforms.uResolution.value.copy(resolution);
  }
}

