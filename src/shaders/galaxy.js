// Galaxy spiral particle shader
export const galaxyVertex = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vFlicker;

  void main() {
    vColor = aColor;
    vFlicker = 0.85 + 0.15 * sin(uTime * 2.0 + aPhase * 6.28);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const galaxyFragment = `
  varying vec3 vColor;
  varying float vFlicker;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = 1.0 - smoothstep(0.0, 0.5, d);
    glow = pow(glow, 1.5);
    gl_FragColor = vec4(vColor * vFlicker, glow * 0.9);
  }
`;
