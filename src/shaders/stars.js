// Star field shader
export const starsVertex = `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vBrightness;

  void main() {
    vBrightness = 0.7 + 0.3 * sin(uTime * 1.5 + aPhase * 6.28);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const starsFragment = `
  varying float vBrightness;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.2, 0.5, d);
    gl_FragColor = vec4(vec3(vBrightness), alpha);
  }
`;
