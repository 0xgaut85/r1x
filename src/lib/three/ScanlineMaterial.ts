import * as THREE from 'three';

const scanlineVert = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const scanlineFrag = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uThickness;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  
  // Sweep line moving from bottom to top
  float linePos = mod(uTime * uSpeed, 1.0 + uThickness);
  float lineY = 1.0 - linePos;
  
  // Create thin horizontal line
  float dist = abs(uv.y - lineY);
  float line = smoothstep(uThickness * 0.5, 0.0, dist);
  
  // Fade at edges
  float fade = smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
  
  gl_FragColor = vec4(uColor, line * fade * 0.6);
}
`;

export class ScanlineMaterial extends THREE.ShaderMaterial {
  constructor(reduceMotion: boolean = false) {
    const color = new THREE.Color(0xff4d00); // #FF4D00

    super({
      vertexShader: scanlineVert,
      fragmentShader: scanlineFrag,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uColor: { value: color },
        uSpeed: { value: reduceMotion ? 0 : 0.15 }, // 6-8s sweep
        uThickness: { value: 0.002 },
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

