precision highp float;

uniform float uTime;
uniform vec3 uCameraPosition;
uniform vec3 uNebulaCenter;
uniform float uNebulaRadius;
uniform sampler2D uColorGradient;
uniform int uMaxSteps;

varying vec3 vWorldPosition;
varying vec3 vLocalPosition;

const float STEP_SIZE = 0.08;
const float DENSITY_SCALE = 2.2;
const float ABSORPTION = 0.75;
const float SCATTERING = 0.55;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

float sampleDensity(vec3 p) {
  vec3 localP = (p - uNebulaCenter) / uNebulaRadius;
  float dist = length(localP);
  float sphereMask = 1.0 - smoothstep(0.25, 1.0, dist);
  float noise1 = fbm(localP * 3.0 + uTime * 0.02);
  float noise2 = fbm(localP * 6.0 - uTime * 0.01);
  float structure = noise1 * 0.55 + noise2 * 0.45;
  return max(0.0, sphereMask * (0.28 + structure * 0.72)) * DENSITY_SCALE;
}

vec3 nebulaColor(float density, vec3 p) {
  vec3 localP = (p - uNebulaCenter) / uNebulaRadius;
  float temperature = 1.0 - length(localP) * 0.45;
  vec3 color1 = texture2D(uColorGradient, vec2(temperature, 0.25)).rgb;
  vec3 color2 = texture2D(uColorGradient, vec2(temperature, 0.75)).rgb;
  float colorMix = snoise(localP * 2.0 + 100.0) * 0.5 + 0.5;
  return mix(color1, color2, colorMix) * density * 1.8;
}

void main() {
  vec3 rayOrigin = uCameraPosition;
  vec3 rayDir = normalize(vWorldPosition - uCameraPosition);

  vec3 toCenter = uNebulaCenter - rayOrigin;
  float tca = dot(toCenter, rayDir);
  float d2 = dot(toCenter, toCenter) - tca * tca;
  float radius2 = uNebulaRadius * uNebulaRadius;

  if (d2 > radius2) {
    discard;
  }

  float thc = sqrt(radius2 - d2);
  float t0 = tca - thc;
  float t1 = tca + thc;
  float t = max(t0, 0.0);
  float endT = t1;

  vec3 accumulatedColor = vec3(0.0);
  float accumulatedAlpha = 0.0;
  float transmittance = 1.0;
  int maxSteps = uMaxSteps;

  for (int i = 0; i < 96; i++) {
    if (i >= maxSteps || t > endT || accumulatedAlpha > 0.96) break;

    vec3 p = rayOrigin + rayDir * t;
    float density = sampleDensity(p);

    if (density > 0.012) {
      float stepTransmittance = exp(-density * ABSORPTION * STEP_SIZE);
      vec3 emission = nebulaColor(density, p);
      vec3 lightDir = normalize(vec3(1.0, 0.5, 0.3));
      float lightDist = length(uNebulaCenter + lightDir * uNebulaRadius - p);
      float lightAttenuation = exp(-lightDist * 0.08);
      vec3 stepColor = emission * SCATTERING * lightAttenuation;
      accumulatedColor += stepColor * transmittance * (1.0 - stepTransmittance);
      transmittance *= stepTransmittance;
      accumulatedAlpha += (1.0 - stepTransmittance) * (1.0 - accumulatedAlpha);
    }

    t += STEP_SIZE;
  }

  if (accumulatedAlpha < 0.02) discard;
  gl_FragColor = vec4(accumulatedColor, accumulatedAlpha * 0.92);
}
