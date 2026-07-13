import * as THREE from 'three';
import dustVertex from '../shaders/dustParticles.vert?raw';
import dustFragment from '../shaders/dustParticles.frag?raw';

/** Polvere stellare / nebulosa ambientale (particelle additive) */
export function createDustParticles(count = 2800, bounds = new THREE.Box3(
  new THREE.Vector3(-400, -120, -400),
  new THREE.Vector3(400, 120, 400)
)) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const opacities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = THREE.MathUtils.randFloat(bounds.min.x, bounds.max.x);
    positions[i * 3 + 1] = THREE.MathUtils.randFloat(bounds.min.y, bounds.max.y);
    positions[i * 3 + 2] = THREE.MathUtils.randFloat(bounds.min.z, bounds.max.z);
    sizes[i] = Math.random() * 2 + 0.5;

    const colorType = Math.random();
    if (colorType < 0.6) {
      colors[i * 3] = 0.9;
      colors[i * 3 + 1] = 0.2;
      colors[i * 3 + 2] = 0.1;
    } else {
      colors[i * 3] = 0.1;
      colors[i * 3 + 1] = 0.6;
      colors[i * 3 + 2] = 0.9;
    }
    opacities[i] = Math.random() * 0.55 + 0.1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'DustParticles';
  points.frustumCulled = false;
  points.raycast = () => {};

  return {
    mesh: points,
    update(time) {
      material.uniforms.uTime.value = time;
      points.rotation.y = time * 0.00008;
    },
    setVisible(visible) {
      points.visible = visible;
    },
  };
}
