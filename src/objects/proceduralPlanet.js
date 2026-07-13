import * as THREE from 'three';
import planetVertex from '../shaders/proceduralPlanet.vert?raw';
import planetFragment from '../shaders/proceduralPlanet.frag?raw';

/** Materiale procedurale per esopianeti / mondi senza texture */
export function createProceduralPlanetMaterial({
  temperature = 0.55,
  waterLevel = 0.42,
  tint = 0xffffff,
  sunDirection = new THREE.Vector3(1, 0.2, 0.5),
} = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: planetVertex,
    fragmentShader: planetFragment,
    uniforms: {
      uTime: { value: 0 },
      uSunDirection: { value: sunDirection.clone().normalize() },
      uWaterLevel: { value: waterLevel },
      uTemperature: { value: temperature },
      uTint: { value: new THREE.Color(tint) },
    },
  });
}

export function updateProceduralPlanetMaterial(material, time, sunDirection) {
  if (!material?.uniforms) return;
  material.uniforms.uTime.value = time;
  if (sunDirection) material.uniforms.uSunDirection.value.copy(sunDirection).normalize();
}
