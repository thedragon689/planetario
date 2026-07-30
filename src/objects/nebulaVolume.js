import * as THREE from 'three';
import nebulaVolumeVertex from '../shaders/nebulaVolume.vert?raw';
import nebulaVolumeFragment from '../shaders/nebulaVolume.frag?raw';

function createGradientTexture(colors = [0x5a2d82, 0x56ccf2]) {
  const width = 256;
  const height = 2;
  const data = new Uint8Array(width * height * 4);
  const cA = new THREE.Color(colors[0] ?? 0x5a2d82);
  const cB = new THREE.Color(colors[1] ?? colors[0] ?? 0x56ccf2);
  const cC = new THREE.Color(colors[2] ?? colors[1] ?? 0x1a2a6c);

  for (let x = 0; x < width; x++) {
    const t = x / width;
    const low = cA.clone().lerp(cB, t);
    const high = cB.clone().lerp(cC, t);
    data[(x + 0 * width) * 4] = Math.floor(low.r * 255);
    data[(x + 0 * width) * 4 + 1] = Math.floor(low.g * 255);
    data[(x + 0 * width) * 4 + 2] = Math.floor(low.b * 255);
    data[(x + 0 * width) * 4 + 3] = 255;

    data[(x + 1 * width) * 4] = Math.floor(high.r * 255);
    data[(x + 1 * width) * 4 + 1] = Math.floor(high.g * 255);
    data[(x + 1 * width) * 4 + 2] = Math.floor(high.b * 255);
    data[(x + 1 * width) * 4 + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

/** Nebulosa volumetrica raymarched */
export function createNebulaVolume({
  radius = 55,
  position = [0, 0, 0],
  maxSteps = 72,
  colors = [0x5a2d82, 0x1a2a6c, 0x56ccf2],
} = {}) {
  const center = new THREE.Vector3(...position);
  const geometry = new THREE.BoxGeometry(radius * 2, radius * 2, radius * 2);
  const gradientTexture = createGradientTexture(colors);

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
      mesh.rotation.y = time * 0.008;
      if (camera?.position) {
        material.uniforms.uCameraPosition.value.copy(camera.position);
      }
    },
  };
}
