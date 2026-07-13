varying float vAlpha;
varying vec3 vColor;

void main() {
  float dist = length(gl_PointCoord - 0.5);
  if (dist > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
  gl_FragColor = vec4(vColor, alpha);
}
