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

  // Palette aurora boreale: lime → ciano/teal → viola/magenta
  float heightNorm = abs(position.y);
  vec3 limeGreen = vec3(0.80, 1.00, 0.00);   // #CCFF00
  vec3 cyanTeal = vec3(0.00, 0.96, 1.00);   // #00F5FF
  vec3 tealMid = vec3(0.25, 0.88, 0.82);     // #40E0D0
  vec3 deepViolet = vec3(0.58, 0.00, 0.83);  // #9400D3
  vec3 magenta = vec3(1.00, 0.00, 1.00);     // #FF00FF

  float curtain = sin(aPhase * 2.1 + uTime * aSpeed * 0.4) * 0.5 + 0.5;
  vec3 midBand = mix(cyanTeal, tealMid, curtain);
  vec3 lowerBand = mix(limeGreen, midBand, smoothstep(0.18, 0.52, heightNorm));
  vec3 upperBand = mix(deepViolet, magenta, smoothstep(0.65, 1.0, heightNorm));
  vColor = mix(lowerBand, upperBand, smoothstep(0.42, 0.88, heightNorm));
  vAlpha = (wave + 0.35) * 0.78 + 0.28;
}
