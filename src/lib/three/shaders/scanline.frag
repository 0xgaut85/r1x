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

