import * as THREE from 'three';
import auroraVertex from '../shaders/aurora.vert?raw';
import auroraFragment from '../shaders/aurora.frag?raw';

/** Aurora boreale semplificata (particelle ai poli) */
export function createAurora(parentGroup) {
  const count = 900;
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const pole = i < count * 0.55 ? 1 : -1;
    const lat = pole * (0.72 + Math.random() * 0.22);
    const lon = Math.random() * Math.PI * 2;
    const r = 1.04 + Math.random() * 0.06;
    const cosLat = Math.cos(lat);
    positions[i * 3] = r * cosLat * Math.cos(lon);
    positions[i * 3 + 1] = r * Math.sin(lat);
    positions[i * 3 + 2] = r * cosLat * Math.sin(lon);
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.8 + Math.random() * 1.4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: auroraVertex,
    fragmentShader: auroraFragment,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'Aurora';
  points.visible = false;
  points.renderOrder = 5;
  parentGroup.add(points);

  return {
    mesh: points,
    setVisible(visible) {
      points.visible = visible;
    },
    setIntensity(value) {
      material.uniforms.uIntensity.value = value;
    },
    update(time) {
      material.uniforms.uTime.value = time;
    },
  };
}
