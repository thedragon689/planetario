import * as THREE from 'three';
import { atmosphereVertex, atmosphereFragment } from '../shaders/atmosphere.js';

const ATMOSPHERE_PRESETS = {
  venus: { scale: 1.08, rayleigh: 0xffcc88, mie: 0xfff0dd, intensity: 0.75 },
  mars: { scale: 1.04, rayleigh: 0xff8866, mie: 0xffccaa, intensity: 0.35 },
  earth: { scale: 1.05, rayleigh: 0x56ccf2, mie: 0xeaf6ff, intensity: 0.5 },
  titan: { scale: 1.06, rayleigh: 0xffaa55, mie: 0xffdd99, intensity: 0.55 },
  neptune: { scale: 1.03, rayleigh: 0x5577ff, mie: 0xaaccff, intensity: 0.4 },
  uranus: { scale: 1.03, rayleigh: 0x66ddff, mie: 0xccffff, intensity: 0.38 },
  jupiter: { scale: 1.02, rayleigh: 0xffcc88, mie: 0xffeedd, intensity: 0.28 },
  saturn: { scale: 1.02, rayleigh: 0xffddaa, mie: 0xfff5e0, intensity: 0.25 },
};

/** Guscio atmosferico Rayleigh+Mie riutilizzabile per pianeti con atmosfera. */
export function createPlanetAtmosphere(parent, planetRadius, planetId, sunGroup) {
  const preset = ATMOSPHERE_PRESETS[planetId];
  if (!preset) return null;

  const visualRadius = planetRadius * 2.2;
  const geometry = new THREE.SphereGeometry(visualRadius * preset.scale, 48, 48);
  const material = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    uniforms: {
      uSunDirection: { value: new THREE.Vector3(1, 0.2, 0).normalize() },
      uRayleighColor: { value: new THREE.Color(preset.rayleigh) },
      uMieColor: { value: new THREE.Color(preset.mie) },
      uIntensity: { value: preset.intensity },
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
      if (!sunGroup) return;
      const sunDir = sunGroup.position.clone().normalize();
      material.uniforms.uSunDirection.value.copy(sunDir);
    },
  };
}

export function hasAtmosphere(planetId) {
  return planetId in ATMOSPHERE_PRESETS;
}
