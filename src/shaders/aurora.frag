varying float vAlpha;
varying vec3 vColor;

uniform float uIntensity;

void main() {
  float dist = length(gl_PointCoord - 0.5);
  if (dist > 0.5) discard;
  float glow = pow(smoothstep(0.5, 0.0, dist), 1.85);
  float alpha = glow * vAlpha;
  gl_FragColor = vec4(vColor * 1.15 * uIntensity, alpha);
}
