import * as THREE from 'three';
import { COLORS } from '../config.js';
import { assertWebGL } from './errors.js';
import { detectWebGPU, logRendererCapabilities } from './webgpu.js';

export type RenderBackend = 'webgl' | 'webgl2' | 'webgpu';

export type AppRenderer = RendererWithMeta | WebGPURendererLike;

interface WebGPURendererLike {
  setClearColor: (color: number) => void;
  setPixelRatio: (ratio: number) => void;
  setSize: (w: number, h: number) => void;
  render: (scene: THREE.Scene, camera: THREE.Camera) => void;
  toneMapping: THREE.ToneMapping;
  toneMappingExposure: number;
  domElement: HTMLCanvasElement;
  init: () => Promise<void>;
  userData?: { backend?: RenderBackend; usePostProcessing?: boolean };
}

type RendererMeta = { backend?: RenderBackend; usePostProcessing?: boolean };

type RendererWithMeta = THREE.WebGLRenderer & {
  userData: RendererMeta;
};

function attachRendererMeta(
  renderer: { userData?: RendererMeta },
  meta: RendererMeta
) {
  renderer.userData = { ...renderer.userData, ...meta };
}

function configureRenderer(renderer: THREE.WebGLRenderer) {
  renderer.setClearColor(COLORS.cosmicBlack);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
}

export function createWebGLRenderer(canvas: HTMLCanvasElement): RendererWithMeta {
  assertWebGL(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
    logarithmicDepthBuffer: true,
  }) as RendererWithMeta;

  configureRenderer(renderer);
  const backend: RenderBackend = renderer.capabilities.isWebGL2 ? 'webgl2' : 'webgl';
  logRendererCapabilities(backend);
  attachRendererMeta(renderer, { backend, usePostProcessing: true });

  return renderer;
}

/**
 * Prova WebGPU se abilitato via VITE_EXPERIMENTAL_WEBGPU=true.
 * Il post-processing EffectComposer richiede WebGL: con WebGPU il rendering è diretto.
 */
export async function createRenderer(canvas: HTMLCanvasElement): Promise<AppRenderer> {
  const experimental = import.meta.env.VITE_EXPERIMENTAL_WEBGPU === 'true';

  if (experimental && (await detectWebGPU())) {
    try {
      const { WebGPURenderer } = await import('three/webgpu');
      const renderer = new WebGPURenderer({ canvas, antialias: true }) as unknown as WebGPURendererLike;
      await renderer.init();
      renderer.setClearColor(COLORS.cosmicBlack);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      attachRendererMeta(renderer, { backend: 'webgpu', usePostProcessing: false });
      logRendererCapabilities('webgpu');
      console.info('[Planetario] WebGPURenderer attivo (post-processing disabilitato)');
      return renderer;
    } catch (err) {
      console.warn('[Planetario] WebGPU non disponibile, fallback WebGL:', err);
    }
  } else if (experimental) {
    console.info('[Planetario] WebGPU non supportato dal browser');
  } else {
    detectWebGPU().then((ok) => {
      if (ok) console.info('[Planetario] WebGPU rilevato — imposta VITE_EXPERIMENTAL_WEBGPU=true per provarlo');
    });
  }

  return createWebGLRenderer(canvas);
}

export function resizeRenderer(renderer: THREE.WebGLRenderer, container: HTMLElement) {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

export function usesPostProcessing(renderer: { userData?: { usePostProcessing?: boolean } }) {
  return renderer.userData?.usePostProcessing !== false;
}
