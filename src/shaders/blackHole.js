export const accretionDiskVertex = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const accretionDiskFragment = `
  uniform float uTime;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform float uSpin;
  uniform vec3 uHotColor;
  uniform vec3 uCoolColor;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv) * 2.0;
    float angle = atan(uv.y, uv.x);

    float t = clamp((r - uInnerRadius) / max(uOuterRadius - uInnerRadius, 0.001), 0.0, 1.0);
  // Temperatura disco: interno caldo (bianco-blu), esterno freddo (arancio-rosso)
    vec3 col = mix(uHotColor, uCoolColor, pow(t, 0.55));

    float swirl = angle + uTime * uSpin - r * 6.0;
    float turbulence = noise(vec2(r * 8.0 + uTime * 0.4, swirl * 3.0));
    col *= 0.65 + turbulence * 0.55;

    float doppler = 0.85 + 0.3 * sin(swirl * 2.0);
    col *= doppler;

    float alpha = smoothstep(uOuterRadius, uInnerRadius * 0.9, r);
    alpha *= smoothstep(uInnerRadius * 0.7, uInnerRadius, r);
    alpha *= 0.55 + turbulence * 0.35;

    gl_FragColor = vec4(col, alpha);
  }
`;

export const eventHorizonVertex = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const eventHorizonFragment = `
  uniform float uTime;
  uniform float uPhotonRing;
  uniform vec3 uRingColor;

  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.0);
    float ring = smoothstep(0.82, 1.0, fresnel) * uPhotonRing;
    float pulse = 0.85 + 0.15 * sin(uTime * 2.5);

    vec3 col = vec3(0.0);
    col += uRingColor * ring * pulse;
    col += uRingColor * fresnel * 0.08;

    float alpha = max(ring * 0.9, fresnel * 0.12);
    gl_FragColor = vec4(col, alpha);
  }
`;

export const relativisticJetVertex = `
  varying vec2 vUv;
  varying float vHeight;
  void main() {
    vUv = uv;
    vHeight = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const relativisticJetFragment = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uIntensity;

  varying vec2 vUv;
  varying float vHeight;

  void main() {
    float along = abs(vHeight);
    float radial = length(vUv - 0.5) * 2.0;
    float core = exp(-radial * 6.0) * exp(-along * 0.15);
    float flicker = 0.75 + 0.25 * sin(uTime * 4.0 + along * 3.0);

    vec3 col = uColor * core * flicker * uIntensity;
    float alpha = core * 0.65 * uIntensity;
    gl_FragColor = vec4(col, alpha);
  }
`;

export const lensRingVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const lensRingFragment = `
  uniform float uTime;
  uniform vec3 uColor;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv) * 2.0;
    float ring = smoothstep(0.92, 0.98, r) * smoothstep(1.0, 0.94, r);
    ring += smoothstep(0.55, 0.62, r) * smoothstep(0.68, 0.61, r) * 0.35;
    float shimmer = 0.8 + 0.2 * sin(atan(uv.y, uv.x) * 8.0 + uTime * 1.5);

    vec3 col = uColor * ring * shimmer;
    gl_FragColor = vec4(col, ring * 0.45);
  }
`;

export const pulsarBeamVertex = `
  varying float vAlong;
  void main() {
    vAlong = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const pulsarBeamFragment = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uPhase;

  varying float vAlong;

  void main() {
    float pulse = pow(max(0.0, sin(uTime * 8.0 + uPhase)), 12.0);
    float along = exp(-abs(vAlong) * 0.25);
    vec3 col = uColor * pulse * along;
    gl_FragColor = vec4(col, pulse * along * 0.7);
  }
`;
