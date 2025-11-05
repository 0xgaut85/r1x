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

