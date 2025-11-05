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

