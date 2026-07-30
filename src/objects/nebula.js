import * as THREE from 'three';
import { nebulaVertex, nebulaFragment } from '../shaders/nebula.js';
import { NEBULA_DATA } from '../data/phenomena.js';
import { FEATURES, PERFORMANCE } from '../config.js';
import { attachHitSphere, disableRaycast } from '../systems/clickTargets.js';
import { createNebulaVolume } from './nebulaVolume.js';

const NEBULA_CONFIGS = [
  { position: [80, 30, -120], scale: 0.008, colors: [0x5a2d82, 0x1a2a6c, 0x56ccf2] },
  { position: [-150, -20, 80], scale: 0.006, colors: [0x8b008b, 0x4166f5, 0x56ccf2] },
  { position: [200, 50, 150], scale: 0.005, colors: [0x5a2d82, 0xff1493, 0x1a2a6c] },
  { position: [-60, 45, -90], scale: 0.007, colors: [0xff6b35, 0x5a2d82, 0x56ccf2] },
  { position: [30, -35, 60], scale: 0.009, colors: [0xff3366, 0x1a2a6c, 0x56ccf2] },
  { position: [-180, 25, -40], scale: 0.0055, colors: [0x00aa88, 0x5a2d82, 0x56ccf2] },
  { position: [110, 15, -160], scale: 0.0065, colors: [0x00ffaa, 0x1a2a6c, 0x8b5cf6] },
  { position: [-40, 55, 130], scale: 0.0075, colors: [0xff4488, 0x4166f5, 0x56ccf2] },
];

export function createNebulae(group, nebulaEntries = NEBULA_DATA, { qualityLevel = 'medium' } = {}) {
  const nebulae = [];
  const maxNebulae = PERFORMANCE.nebulaCount[qualityLevel] ?? PERFORMANCE.nebulaCount.medium;
  const baseEntries = FEATURES.extendedNebulae ? nebulaEntries : nebulaEntries.slice(0, 3);
  const baseConfigs = FEATURES.extendedNebulae ? NEBULA_CONFIGS : NEBULA_CONFIGS.slice(0, 3);
  const entries = baseEntries.slice(0, maxNebulae);
  const configs = baseConfigs.slice(0, maxNebulae);
  const maxSteps = PERFORMANCE.nebulaMaxSteps[qualityLevel] ?? PERFORMANCE.nebulaMaxSteps.medium;

  configs.forEach((cfg, index) => {
    const data = entries[index] || NEBULA_DATA[index];

    if (FEATURES.nebulaRaymarch) {
      const volume = createNebulaVolume({
        radius: 52,
        position: cfg.position,
        maxSteps,
        colors: cfg.colors,
      });
      const mesh = volume.mesh;
      mesh.name = data?.name || 'Nebulosa';
      mesh.userData = {
        type: 'nebula',
        id: data?.id || `nebula_${index}`,
        selectable: true,
        data,
      };
      disableRaycast(mesh);
      attachHitSphere(mesh, 90);
      group.add(mesh);
      nebulae.push(volume);
      return;
    }

    const geometry = new THREE.BoxGeometry(200, 120, 80);
    const material = new THREE.ShaderMaterial({
      vertexShader: nebulaVertex,
      fragmentShader: nebulaFragment,
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: cfg.scale },
        uColorA: { value: new THREE.Color(cfg.colors[0]) },
        uColorB: { value: new THREE.Color(cfg.colors[1]) },
        uColorC: { value: new THREE.Color(cfg.colors[2]) },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...cfg.position);
    mesh.name = data?.name || 'Nebulosa';
    mesh.userData = {
      type: 'nebula',
      id: data?.id || `nebula_${index}`,
      selectable: true,
      data,
    };
    disableRaycast(mesh);
    attachHitSphere(mesh, 90);
    group.add(mesh);
    nebulae.push({ mesh, material });
  });

  return {
    nebulae,
    update(time, delta, camera) {
      nebulae.forEach((entry) => {
        if (entry.update) {
          entry.update(time, delta, camera);
          return;
        }
        entry.material.uniforms.uTime.value = time;
        entry.mesh.rotation.y = time * 0.01;
      });
    },
  };
}
