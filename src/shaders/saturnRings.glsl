precision highp float;

uniform float uTime;
uniform float uInnerRadius;
uniform float uOuterRadius;
uniform vec3 uRingColorA;
uniform vec3 uRingColorB;
uniform float uGlowStrength;

varying vec2 vUv;

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
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  float radial = vUv.y;
  float angle = vUv.x * 6.2831853;

  float bands = sin(angle * 36.0 + fbm(vec2(angle * 4.0, radial * 10.0)) * 5.0);
  bands = bands * 0.5 + 0.5;
  float grain = fbm(vec2(angle * 16.0, radial * 48.0 + uTime * 0.015));
  float pattern = mix(bands, grain, 0.4);

  vec3 col = mix(uRingColorB, uRingColorA, pattern);

  float alpha = smoothstep(0.0, 0.08, radial);
  alpha *= 1.0 - smoothstep(0.88, 1.0, radial);
  alpha *= 0.3 + pattern * 0.6;

  float edgeGlow = pow(sin(radial * 3.14159), 2.0);
  col += uRingColorA * edgeGlow * uGlowStrength * 0.2;

  if (alpha < 0.02) discard;
  gl_FragColor = vec4(col, alpha);
}
