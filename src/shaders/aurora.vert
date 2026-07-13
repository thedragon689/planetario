attribute float aPhase;
attribute float aSpeed;

uniform float uTime;

varying float vAlpha;
varying vec3 vColor;

void main() {
  float wave = sin(uTime * aSpeed + aPhase) * 0.3;
  float wave2 = cos(uTime * aSpeed * 0.7 + aPhase * 1.3) * 0.2;
  vec3 pos = position + normalize(position) * (wave + wave2) * 0.06;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 4.0 * (180.0 / max(-mvPosition.z, 1.0));

  float heightNorm = abs(position.y);
  vec3 green = vec3(0.1, 0.95, 0.55);
  vec3 violet = vec3(0.45, 0.25, 0.95);
  vColor = mix(green, violet, smoothstep(0.3, 1.0, heightNorm));
  vAlpha = (wave + 0.35) * 0.75 + 0.25;
}
