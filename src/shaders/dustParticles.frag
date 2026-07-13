varying vec3 vColor;
varying float vOpacity;

void main() {
  float dist = length(gl_PointCoord - 0.5);
  if (dist > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, dist) * vOpacity;
  gl_FragColor = vec4(vColor, alpha);
}
