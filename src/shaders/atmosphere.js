export const atmosphereVertex = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragment = `
  uniform vec3 uSunDirection;
  uniform vec3 uRayleighColor;
  uniform vec3 uMieColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;

  // Scattering Rayleigh + Mie semplificato (cielo azzurro, alone al tramonto)
  void main() {
    vec3 n = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);
    vec3 sunDir = normalize(uSunDirection);

    float sunDot = max(dot(n, sunDir), 0.0);
    float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.5);

    // Rayleigh: più forte ai bordi (fresnel) e con luce diffusa
    float rayleigh = fresnel * 0.65 + pow(sunDot, 0.35) * 0.22;
    rayleigh *= 1.0 + pow(1.0 - sunDot, 2.0) * 0.35;

    // Mie: alone intorno al Sole
    float mie = pow(sunDot, 8.0) * 0.12 + fresnel * 0.18;
    float sunset = pow(1.0 - sunDot, 3.0) * 0.25;
    vec3 mieTint = mix(uMieColor, vec3(1.0, 0.55, 0.2), sunset);

    vec3 color = uRayleighColor * rayleigh + mieTint * mie;
    float alpha = clamp((rayleigh + mie) * uIntensity, 0.0, 1.0) * 0.62;
    gl_FragColor = vec4(color, alpha);
  }
`;
