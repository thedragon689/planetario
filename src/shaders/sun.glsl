precision highp float;

uniform float uTime;
uniform float uNoiseScale;
uniform float uPlasmaSpeed;
uniform float uGlowIntensity;
uniform float uDistortion;
uniform vec3 uCoreColor;
uniform vec3 uMidColor;
uniform vec3 uCoronaColor;

varying vec3 vNormalW;
varying vec3 vViewDirW;
varying vec2 vUv;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 n = normalize(vNormalW);
  vec3 view = normalize(vViewDirW);

  vec3 samplePos = n * uNoiseScale + vec3(uTime * uPlasmaSpeed, uTime * uPlasmaSpeed * 0.7, 0.0);
  samplePos += n * fbm(n * 2.0 + uTime * 0.2) * uDistortion;

  float plasma = fbm(samplePos);
  float turbulence = fbm(samplePos * 1.8 + vec3(0.0, uTime * 0.5, uTime * 0.3));
  float heat = mix(plasma, turbulence, 0.45);

  vec3 col = mix(uCoronaColor, uMidColor, smoothstep(0.2, 0.65, heat));
  col = mix(col, uCoreColor, smoothstep(0.55, 1.0, heat));

  float rim = pow(1.0 - max(dot(n, view), 0.0), 2.2);
  col += uCoreColor * rim * uGlowIntensity;

  float pulse = 1.0 + 0.12 * sin(uTime * 3.0 + heat * 12.0);
  col *= pulse;

  col = pow(col, vec3(1.0 / 2.2));
  gl_FragColor = vec4(col, 1.0);
}
