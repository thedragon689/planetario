import * as THREE from 'three';

export function createCamera(container) {
  const aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 1e7);
  camera.position.set(0, 0.5, 3);
  camera.lookAt(0, 0, 0);
  return camera;
}

export function updateCameraAspect(camera, container) {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
}

export const CAMERA_PRESETS = {
  earth: { position: [0, 0.3, 2.8], target: [0, 0, 0], fov: 45 },
  solar_system: { position: [0, 38, 72], target: [0, 0, 0], fov: 58 },
  milky_way: { position: [0, 200, 400], target: [0, 0, 0], fov: 60 },
  exoplanets: { position: [40, 180, 360], target: [0, 0, 0], fov: 62 },
  extreme_objects: { position: [60, 220, 420], target: [0, 0, 0], fov: 64 },
  local_group: { position: [80, 420, 1050], target: [100, 0, 50], fov: 68 },
  observable: { position: [0, 620, 2100], target: [0, 0, 0], fov: 72 },
  wormhole: { position: [0, 0, 8], target: [0, 0, 0], fov: 75 },
};
