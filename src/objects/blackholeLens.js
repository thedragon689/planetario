import * as THREE from 'three';
import blackholeLensVertex from '../shaders/blackholeLens.vert?raw';
import blackholeLensFragment from '../shaders/blackholeLens.frag?raw';

/** Volume shader per lente gravitazionale attorno a un buco nero */
export function createBlackholeLens(blackHolePosition, schwarzschildRadius = 4) {
  const size = schwarzschildRadius * 48;
  const geometry = new THREE.BoxGeometry(size, size, size);
  const bhPos = new THREE.Vector3(...blackHolePosition);

  const material = new THREE.ShaderMaterial({
    vertexShader: blackholeLensVertex,
    fragmentShader: blackholeLensFragment,
    uniforms: {
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
      uBlackHolePosition: { value: bhPos.clone() },
      uSchwarzschildRadius: { value: schwarzschildRadius },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(bhPos);
  mesh.name = 'BlackholeLens';
  mesh.raycast = () => {};
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;

  return {
    mesh,
    material,
    update(time, _delta, camera) {
      material.uniforms.uTime.value = time;
      if (camera?.position) {
        material.uniforms.uCameraPosition.value.copy(camera.position);
      }
    },
  };
}
