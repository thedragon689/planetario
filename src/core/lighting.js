import * as THREE from 'three';
import { COLORS } from '../config.js';

export function createLighting(scene) {
  const ambient = new THREE.AmbientLight(0x1a2a6c, 0.35);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff5e6, 2.5);
  sun.position.set(50, 20, 30);
  scene.add(sun);

  const rim = new THREE.DirectionalLight(COLORS.energyCyan, 0.3);
  rim.position.set(-30, 10, -20);
  scene.add(rim);

  const fill = new THREE.HemisphereLight(0x56ccf2, 0x03050a, 0.2);
  scene.add(fill);

  return { ambient, sun, rim, fill };
}

export function setEnvironment(scene, renderer, envMap) {
  if (!envMap) return;
  scene.environment = envMap;
  scene.background = envMap;
}
