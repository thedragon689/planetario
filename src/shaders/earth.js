export const earthVertex = `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDirW;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDirW = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const earthFragment = `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uSpecularMap;
  uniform vec3 uSunDirection;
  uniform float uNightBoost;
  uniform float uMoltenMix;
  uniform float uVegetationMix;
  uniform vec3 uEraTint;
  uniform float uNightLightsMix;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDirW;

  void main() {
    vec3 normal = normalize(vNormalW);
    vec3 sunDir = normalize(uSunDirection);
    float NdotL = dot(normal, sunDir);

    vec3 dayColor = texture2D(uDayMap, vUv).rgb * uEraTint;
    vec3 nightTex = texture2D(uNightMap, vUv).rgb;

    float dayFactor = smoothstep(-0.25, 0.35, NdotL);
    float nightFactor = 1.0 - dayFactor;

    vec3 molten = vec3(1.0, 0.35, 0.08);
    dayColor = mix(dayColor, molten, uMoltenMix * (0.55 + 0.45 * (1.0 - dayFactor)));

    float veg = mix(1.0, 0.72, uVegetationMix);
    dayColor *= mix(vec3(1.0), vec3(veg, veg + 0.08, veg - 0.05), uVegetationMix * dayFactor);

    vec3 nightGlow = nightTex * nightTex * uNightBoost * nightFactor * uNightLightsMix;
    vec3 color = dayColor * dayFactor + nightGlow + dayColor * 0.02;

    float specMask = texture2D(uSpecularMap, vUv).r;
    vec3 halfDir = normalize(sunDir + vViewDirW);
    float spec = pow(max(dot(normal, halfDir), 0.0), 64.0) * specMask * dayFactor;
    color += vec3(0.4, 0.5, 0.6) * spec * 0.5;

    color = pow(color, vec3(1.0 / 2.2));
    gl_FragColor = vec4(color, 1.0);
  }
`;
