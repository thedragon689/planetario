import * as THREE from 'three';

/** Orbita eliocentrica visiva con RingGeometry trasparente. */
export function createOrbit(distance, color = 0x56ccf2) {
  const inner = Math.max(0.01, distance - 0.06);
  const outer = distance + 0.06;
  const geometry = new THREE.RingGeometry(inner, outer, 128);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const orbit = new THREE.Mesh(geometry, material);
  orbit.rotation.x = Math.PI / 2;
  orbit.name = `Orbita ${distance.toFixed(1)}`;
  return orbit;
}

/** Orbita lunare attorno al pianeta genitore. */
export function createMoonOrbit(distance, color = 0x8899aa) {
  const inner = Math.max(0.01, distance - 0.03);
  const outer = distance + 0.03;
  const geometry = new THREE.RingGeometry(inner, outer, 96);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const orbit = new THREE.Mesh(geometry, material);
  orbit.rotation.x = Math.PI / 2;
  return orbit;
}
