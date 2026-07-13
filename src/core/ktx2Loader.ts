import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

import type { WebGLRenderer } from 'three';

type KTX2Renderer = WebGLRenderer & { init?: () => Promise<void> };

let ktx2Loader: KTX2Loader | null = null;
let initPromise: Promise<KTX2Loader> | null = null;

export async function initKTX2Loader(renderer: KTX2Renderer) {
  if (ktx2Loader) return ktx2Loader;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (typeof renderer.init === 'function') {
      await renderer.init();
    }

    const loader = new KTX2Loader();
    loader.setTranscoderPath('/basis/');
    loader.detectSupport(renderer);
    ktx2Loader = loader;
    return loader;
  })();

  return initPromise;
}

export function getKTX2Loader() {
  return ktx2Loader;
}

/** Prova a caricare la variante .ktx2 di un URL texture. */
export function toKtx2Url(url: string) {
  return url.replace(/\.(jpg|jpeg|png|webp)$/i, '.ktx2');
}

export async function loadKTX2Texture(
  renderer: KTX2Renderer,
  url: string
): Promise<THREE.CompressedTexture | null> {
  try {
    const loader = await initKTX2Loader(renderer);
    return await loader.loadAsync(url);
  } catch {
    return null;
  }
}
