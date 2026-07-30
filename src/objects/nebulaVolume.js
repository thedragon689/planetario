import * as THREE from 'three';
import nebulaVolumeVertex from '../shaders/nebulaVolume.vert?raw';
import nebulaVolumeFragment from '../shaders/nebulaVolume.frag?raw';

function createGradientTexture() {
  const width = 256;
  const height = 2;
  const data = new Uint8Array(width * height * 4);

  for (let x = 0; x < width; x++) {
    const t = x / width;
    data[(x + 0 * width) * 4] = Math.floor(200 + t * 55);
    data[(x + 0 * width) * 4 + 1] = Math.floor(50 + t * 50);
    data[(x + 0 * width) * 4 + 2] = Math.floor(30 + t * 30);
    data[(x + 0 * width) * 4 + 3] = 255;

    data[(x + 1 * width) * 4] = Math.floor(30 + t * 30);
    data[(x + 1 * width) * 4 + 1] = Math.floor(150 + t * 50);
    data[(x + 1 * width) * 4 + 2] = Math.floor(200 + t * 55);
    data[(x + 1 * width) * 4 + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

const gradientTexture = createGradientTexture();

/** Nebulosa volumetrica raymarched */
export function createNebulaVolume({
  radius = 55,
  position = [0, 0, 0],
  maxSteps = 72,
} = {}) {
  const center = new THREE.Vector3(...position);
  const geometry = new THREE.BoxGeometry(radius * 2, radius * 2, radius * 2);

  const material = new THREE.ShaderMaterial({
    vertexShader: nebulaVolumeVertex,
    fragmentShader: nebulaVolumeFragment,
    uniforms: {
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
      uNebulaCenter: { value: center.clone() },
      uNebulaRadius: { value: radius },
      uColorGradient: { value: gradientTexture },
      uMaxSteps: { value: maxSteps },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    // FrontSide: camera stays outside nebula bounds in Milky Way / Local Group views.
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(center);
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
