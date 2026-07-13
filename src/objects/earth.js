import * as THREE from 'three';
import { TEXTURES } from '../config.js';
import { loadTextureSafe } from '../core/loader.js';
import { earthVertex, earthFragment } from '../shaders/earth.js';
import { createEarthGraticule } from './earthGraticule.js';
import { attachHitSphere, disableRaycast } from '../systems/clickTargets.js';
import { FEATURES } from '../config.js';
import { createAurora } from './aurora.js';

export async function createEarth(group, lighting, earthData = null) {
  const [dayMap, nightMap, specularMap] = await Promise.all([
    loadTextureSafe(TEXTURES.earth.albedo, { fallback: 0x1a5a8a, maxSize: 2048 }),
    loadTextureSafe(TEXTURES.earth.night, { fallback: 0x0a1520, maxSize: 2048 }),
    loadTextureSafe(TEXTURES.earth.specular, { fallback: 0x224466, maxSize: 2048 }),
  ]);

  dayMap.anisotropy = 8;
  nightMap.anisotropy = 4;
  specularMap.anisotropy = 4;

  const geometry = new THREE.SphereGeometry(1, 64, 64);

  const material = new THREE.ShaderMaterial({
    vertexShader: earthVertex,
    fragmentShader: earthFragment,
    uniforms: {
      uDayMap: { value: dayMap },
      uNightMap: { value: nightMap },
      uSpecularMap: { value: specularMap },
      uSunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() },
      uNightBoost: { value: 2.2 },
      uMoltenMix: { value: 0 },
      uVegetationMix: { value: 1 },
      uEraTint: { value: new THREE.Color(1, 1, 1) },
      uNightLightsMix: { value: 1 },
    },
  });

  const earth = new THREE.Mesh(geometry, material);
  earth.name = 'Terra';
  earth.userData = { type: 'planet', id: 'earth', selectable: true, data: earthData };
  disableRaycast(earth);
  attachHitSphere(earth, 1.18, 'earth-hit');

  const earthGroup = new THREE.Group();
  earthGroup.name = 'TerraGroup';
  earthGroup.userData = { type: 'planet', id: 'earth', selectable: true, data: earthData };
  earthGroup.add(earth);

  const graticule = createEarthGraticule(1.003);
  earthGroup.add(graticule.group);

  group.add(earthGroup);

  const aurora = FEATURES.auroraEffect ? createAurora(earthGroup) : null;

  return {
    earth,
    clouds: null,
    group: earthGroup,
    graticule,
    setGraticuleVisible(visible) {
      graticule.setVisible(visible);
    },
    aurora,
    update(time, delta) {
      const rotSpeed = (2 * Math.PI) / 86400;
      earthGroup.rotation.y += rotSpeed * delta * 3600;

      const sunDir = lighting.sun.position.clone().normalize();
      material.uniforms.uSunDirection.value.copy(sunDir);
      aurora?.update(time);
    },
  };
}
