export const planetVertex = `
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

export const planetFragment = `
  uniform sampler2D uMap;
  uniform vec3 uSunDirection;
  uniform vec3 uTint;
  uniform float uAmbient;
  uniform vec3 uRimColor;
  uniform float uRimStrength;
  uniform float uGasBoost;
  uniform float uRoughness;
  uniform float uMetalness;
  uniform samplerCube uEnvMap;
  uniform float uEnvIntensity;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDirW;

  void main() {
    vec3 normal = normalize(vNormalW);
    vec3 sunDir = normalize(uSunDirection);
    float NdotL = dot(normal, sunDir);

    float dayFactor = smoothstep(-0.15, 0.35, NdotL);
    vec3 texColor = texture2D(uMap, vUv).rgb * uTint;

    vec3 ambient = texColor * uAmbient;
    float specPower = mix(32.0, 8.0, uRoughness);
    vec3 halfDir = normalize(sunDir + vViewDirW);
    float spec = pow(max(dot(normal, halfDir), 0.0), specPower) * (1.0 - uRoughness);
    vec3 lit = texColor * (0.25 + dayFactor * 0.75) * (1.0 + uGasBoost * 0.35);
    lit += vec3(spec) * uMetalness * 0.35;
    float fresnel = pow(1.0 - max(dot(normal, vViewDirW), 0.0), 3.0);
    vec3 reflectDir = reflect(-vViewDirW, normal);
    vec3 envSample = texture(uEnvMap, reflectDir).rgb;
    lit += envSample * uEnvIntensity * fresnel * (1.0 - uRoughness);

    vec3 color = ambient + lit;

    float rim = pow(1.0 - max(dot(normal, vViewDirW), 0.0), 2.8);
    color += uRimColor * rim * uRimStrength;

    color = max(color, texColor * 0.12);

    color = pow(color, vec3(1.0 / 2.2));
    gl_FragColor = vec4(color, 1.0);
  }
`;
