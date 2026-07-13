import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { COLORS } from '../config.js';

const HDR_PATH = '/assets/hdr/nebula_space.hdr';

export type ImageBasedLighting = {
  /** PMREM per scene.environment (texture 2D cubeUV — solo renderer Three.js). */
  sceneEnvironment: THREE.Texture;
  /** CubeTexture reale per shader custom con samplerCube. */
  cubeEnvironment: THREE.CubeTexture;
  /** Mantieni il render target vivo per non invalidare la cube map. */
  cubeTarget: THREE.WebGLCubeRenderTarget;
};

function applySceneEnvironment(scene: THREE.Scene, envMap: THREE.Texture) {
  scene.environment = envMap;
  scene.background = new THREE.Color(COLORS.cosmicBlack);
}

function createCubeFromEquirectangular(renderer: THREE.WebGLRenderer, texture: THREE.Texture) {
  const cubeTarget = new THREE.WebGLCubeRenderTarget(256);
  cubeTarget.fromEquirectangularTexture(renderer, texture);
  cubeTarget.texture.mapping = THREE.CubeReflectionMapping;
  return cubeTarget;
}

function createCubeFromRoom(renderer: THREE.WebGLRenderer) {
  const room = new RoomEnvironment();
  const cubeTarget = new THREE.WebGLCubeRenderTarget(256);
  const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeTarget);
  cubeCamera.update(renderer, room);
  cubeTarget.texture.mapping = THREE.CubeReflectionMapping;
  return cubeTarget;
}

/**
 * Carica IBL: PMREM per scene.environment + cube map dedicata per shader pianeti.
 */
export async function loadImageBasedLighting(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene
): Promise<ImageBasedLighting | null> {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  try {
    try {
      const hdr = await new HDRLoader().loadAsync(HDR_PATH);
      hdr.mapping = THREE.EquirectangularReflectionMapping;

      const pmremRT = pmrem.fromEquirectangular(hdr);
      applySceneEnvironment(scene, pmremRT.texture);

      const cubeTarget = createCubeFromEquirectangular(renderer, hdr);
      hdr.dispose();

      return {
        sceneEnvironment: pmremRT.texture,
        cubeEnvironment: cubeTarget.texture,
        cubeTarget,
      };
    } catch {
      const room = new RoomEnvironment();
      const pmremRT = pmrem.fromScene(room, 0.04);
      applySceneEnvironment(scene, pmremRT.texture);

      const cubeTarget = createCubeFromRoom(renderer);

      return {
        sceneEnvironment: pmremRT.texture,
        cubeEnvironment: cubeTarget.texture,
        cubeTarget,
      };
    }
  } finally {
    pmrem.dispose();
  }
}

/** Aggiorna uniformi env su materiali shader custom dei pianeti (richiede CubeTexture). */
export function bindEnvToMaterial(
  material: THREE.ShaderMaterial,
  envMap: THREE.CubeTexture | null
) {
  if (!material?.uniforms || !envMap) return;
  if (!envMap.isCubeTexture) return;

  if (material.uniforms.uEnvMap) {
    material.uniforms.uEnvMap.value = envMap;
  }
  if (material.uniforms.uEnvIntensity) {
    material.uniforms.uEnvIntensity.value = 0.35;
  }
}
