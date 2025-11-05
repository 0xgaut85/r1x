import * as THREE from 'three';

const gridVert = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const gridFrag = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uScale;
uniform vec2 uTilt;
uniform vec3 uColor;
uniform float uOpacity;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv -= 0.5;
  
  // Rotate 45 degrees
  float angle = 0.785398; // 45 degrees in radians
  float cos_a = cos(angle);
  float sin_a = sin(angle);
  uv = mat2(cos_a, -sin_a, sin_a, cos_a) * uv;
  
  // Apply wave offset if motion is allowed
  vec2 offset = uTilt * 0.02 * sin(uTime * 0.15);
  uv += offset;
  
  // Create grid pattern
  vec2 grid = abs(fract(uv * uScale - 0.5) - 0.5) / fwidth(uv * uScale);
  float lines = min(grid.x, grid.y);
  lines = smoothstep(0.98, 1.0, lines);
  
  vec3 col = mix(vec3(0.0), uColor, lines);
  gl_FragColor = vec4(col, lines * uOpacity);
}
`;

export class GridMaterial extends THREE.ShaderMaterial {
  constructor(reduceMotion: boolean = false) {
    super({
      vertexShader: gridVert,
      fragmentShader: gridFrag,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uScale: { value: new THREE.Vector2(8.0, 8.0) }, // ~64px spacing
        uTilt: { value: new THREE.Vector2(1.0, 1.0) },
        uColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) }, // White
        uOpacity: { value: reduceMotion ? 0.15 : 0.25 },
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

