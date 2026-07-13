import * as THREE from 'three';
import { atmosphereVertex, atmosphereFragment } from '../shaders/atmosphere.js';

export function createAtmosphere(parent, sunLight) {
  const geometry = new THREE.SphereGeometry(1.05, 64, 64);
  const material = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    uniforms: {
      uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
      uRayleighColor: { value: new THREE.Color(0x56ccf2) },
      uMieColor: { value: new THREE.Color(0xeaf6ff) },
      uIntensity: { value: 0.5 },
    },
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(geometry, material);
  parent.add(mesh);

  return {
    mesh,
    update() {
      const sunDir = sunLight.position.clone().normalize();
      material.uniforms.uSunDirection.value.copy(sunDir);
    },
    setEraVisuals({ intensity, rayleighColor, mieColor } = {}) {
      if (intensity != null) material.uniforms.uIntensity.value = intensity;
      if (rayleighColor) material.uniforms.uRayleighColor.value.set(...rayleighColor);
      if (mieColor) material.uniforms.uMieColor.value.set(...mieColor);
    },
  };
}
