// Wormhole — 4D noise swirl, radial warp, gravitational distortion
export const wormholeVertex = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const wormholeFragment = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColorInner;
  uniform vec3 uColorOuter;

  varying vec2 vUv;
  varying vec3 vPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv);
    float angle = atan(uv.y, uv.x);

    float swirl = angle + uTime * 2.0 - r * 8.0;
    float warp = fbm(vec2(r * 4.0 - uTime * 0.5, swirl * 2.0));
    float tunnel = 1.0 / (r * 12.0 + 0.3);
    tunnel += warp * 0.5;

    float depth = sin(r * 40.0 - uTime * 4.0 + warp * 6.0) * 0.5 + 0.5;
    depth = pow(depth, 2.0) * tunnel;

    vec3 col = mix(uColorOuter, uColorInner, 1.0 - r * 2.0);
    col += vec3(0.3, 0.5, 1.0) * depth * uIntensity;
    col *= tunnel * uIntensity;

    float alpha = smoothstep(0.5, 0.0, r) * depth;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;
