precision highp float;

uniform float uTime;
uniform vec3 uCameraPosition;
uniform vec3 uBlackHolePosition;
uniform float uSchwarzschildRadius;

varying vec3 vWorldPosition;

const int RAY_STEPS = 48;
const float STEP_SIZE = 0.35;

vec3 bendRay(vec3 rayDir, vec3 toBh, float strength) {
  float dist = max(length(toBh), uSchwarzschildRadius * 0.5);
  vec3 forceDir = normalize(toBh);
  float force = strength / (dist * dist);
  return normalize(rayDir + forceDir * force * 0.08);
}

vec3 accretionDisk(vec3 p) {
  vec3 toCenter = p - uBlackHolePosition;
  float r = length(vec2(toCenter.x, toCenter.z));
  float rs = uSchwarzschildRadius;
  float height = abs(toCenter.y);
  if (height > rs * 0.12) return vec3(0.0);

  float isco = 3.0 * rs;
  if (r < isco || r > 18.0 * rs) return vec3(0.0);

  float density = exp(-pow((r - 5.0 * rs) / (6.0 * rs), 2.0));
  density *= smoothstep(isco, isco + rs, r);

  float temperature = 10000.0 / sqrt(max(r / rs, 0.1));
  vec3 color;
  if (temperature < 3000.0) color = vec3(1.0, 0.4, 0.1);
  else if (temperature < 6000.0) color = vec3(1.0, 0.8, 0.4);
  else color = vec3(0.8, 0.9, 1.0);

  float angle = atan(toCenter.z, toCenter.x);
  float doppler = 1.0 + 0.28 * sin(angle + uTime * 2.0);
  return color * density * doppler * 2.5;
}

void main() {
  vec3 rayOrigin = uCameraPosition;
  vec3 rayDir = normalize(vWorldPosition - uCameraPosition);

  vec3 toCenter = uBlackHolePosition - rayOrigin;
  float distToCenter = length(toCenter);
  float cosAngle = dot(normalize(toCenter), rayDir);
  float shadowRadius = uSchwarzschildRadius * 2.2;
  float angle = acos(clamp(cosAngle, -1.0, 1.0));
  float shadow = smoothstep(0.0, shadowRadius / max(distToCenter, 0.001), angle);

  vec3 accumulatedColor = vec3(0.0);
  vec3 currentDir = rayDir;
  float t = 0.0;

  for (int i = 0; i < 48; i++) {
    if (i >= RAY_STEPS) break;
    vec3 p = rayOrigin + currentDir * t;
    float potential = uSchwarzschildRadius / max(length(p - uBlackHolePosition), uSchwarzschildRadius * 0.4);
    accumulatedColor += accretionDisk(p);
    currentDir = bendRay(currentDir, uBlackHolePosition - p, potential);
    t += STEP_SIZE;
    if (t > 420.0) break;
  }

  float photonGlow = exp(-pow(abs(distToCenter - uSchwarzschildRadius * 1.5) / uSchwarzschildRadius, 2.0));
  accumulatedColor += vec3(1.0, 0.9, 0.7) * photonGlow * 0.45;
  accumulatedColor *= (1.0 - shadow * 0.92);

  float alpha = clamp(length(accumulatedColor) * 0.85, 0.0, 1.0);
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(accumulatedColor, alpha);
}
