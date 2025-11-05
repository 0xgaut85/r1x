import * as THREE from 'three';

const noiseGrainVert = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const noiseGrainFrag = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uIntensity;

// Simple noise function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  
  // Animated grain
  float grain = noise(uv * 300.0 + uTime * 10.0);
  grain = (grain - 0.5) * 2.0; // Center around 0
  
  // Vignette effect
  vec2 center = vec2(0.5);
  float dist = distance(uv, center);
  float vignette = 1.0 - smoothstep(0.4, 1.2, dist);
  
  float alpha = grain * uIntensity * vignette;
  gl_FragColor = vec4(vec3(1.0), alpha);
}
`;

export class NoiseGrainMaterial extends THREE.ShaderMaterial {
  constructor(reduceMotion: boolean = false) {
    super({
      vertexShader: noiseGrainVert,
      fragmentShader: noiseGrainFrag,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uIntensity: { value: reduceMotion ? 0.02 : 0.03 },
      },
      transparent: true,
      blending: THREE.NormalBlending,
    });
  }

  update(time: number, resolution: THREE.Vector2, reduceMotion: boolean) {
    this.uniforms.uTime.value = reduceMotion ? 0 : time;
    this.uniforms.uResolution.value.copy(resolution);
  }
}

