import * as THREE from 'three';
import { COLORS, PERFORMANCE } from '../config.js';
import { assertWebGL } from './errors.js';
import { detectWebGPU, logRendererCapabilities } from './webgpu.js';
import type { QualityLevel } from '../types/catalog.js';

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

export function getPixelRatioCap(qualityLevel: QualityLevel = 'medium'): number {
  const cap = PERFORMANCE.pixelRatioCap[qualityLevel] ?? PERFORMANCE.pixelRatioCap.medium;
  return Math.min(window.devicePixelRatio, cap);
}

function configureRenderer(renderer: THREE.WebGLRenderer, qualityLevel: QualityLevel = 'medium') {
  renderer.setClearColor(COLORS.cosmicBlack);
  renderer.setPixelRatio(getPixelRatioCap(qualityLevel));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
}

export function createWebGLRenderer(
  canvas: HTMLCanvasElement,
  qualityLevel: QualityLevel = 'medium'
): RendererWithMeta {
  assertWebGL(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: qualityLevel !== 'low',
    powerPreference: 'high-performance',
    alpha: false,
    logarithmicDepthBuffer: true,
  }) as RendererWithMeta;

  configureRenderer(renderer, qualityLevel);
  const backend: RenderBackend = renderer.capabilities.isWebGL2 ? 'webgl2' : 'webgl';
  logRendererCapabilities(backend);
  attachRendererMeta(renderer, { backend, usePostProcessing: true });

  return renderer;
}

/**
 * Prova WebGPU se abilitato via VITE_EXPERIMENTAL_WEBGPU=true.
 * Il post-processing EffectComposer richiede WebGL: con WebGPU il rendering è diretto.
 */
export async function createRenderer(
  canvas: HTMLCanvasElement,
  qualityLevel: QualityLevel = 'medium'
): Promise<AppRenderer> {
  const experimental = import.meta.env.VITE_EXPERIMENTAL_WEBGPU === 'true';

  if (experimental && (await detectWebGPU())) {
    try {
      const { WebGPURenderer } = await import('three/webgpu');
      const renderer = new WebGPURenderer({ canvas, antialias: true }) as unknown as WebGPURendererLike;
      await renderer.init();
      renderer.setClearColor(COLORS.cosmicBlack);
      renderer.setPixelRatio(getPixelRatioCap(qualityLevel));
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

  return createWebGLRenderer(canvas, qualityLevel);
}

export function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  container: HTMLElement,
  qualityLevel: QualityLevel = 'medium'
) {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setPixelRatio(getPixelRatioCap(qualityLevel));
  renderer.setSize(w, h);
}

/** Reset viewport/scissor after offscreen passes before drawing to the default framebuffer. */
export function resetRendererForScreenRender(renderer: THREE.WebGLRenderer) {
  renderer.setRenderTarget(null);
  // setViewport/setScissor expect logical CSS pixels; Three.js multiplies by pixelRatio internally.
  const size = renderer.getSize(new THREE.Vector2());
  renderer.setViewport(0, 0, size.x, size.y);
  renderer.setScissor(0, 0, size.x, size.y);
  renderer.setScissorTest(false);
}

/** Keep renderer, composer, and viewport dimensions aligned to the layout container. */
export function syncRendererLayout(
  renderer: THREE.WebGLRenderer,
  container: HTMLElement,
  postFX?: { resize?: (width: number, height: number, pixelRatio: number) => void } | null,
  qualityLevel: QualityLevel = 'medium'
) {
  resizeRenderer(renderer, container, qualityLevel);
  resetRendererForScreenRender(renderer);
  postFX?.resize?.(
    container.clientWidth,
    container.clientHeight,
    renderer.getPixelRatio()
  );
}

export function usesPostProcessing(renderer: { userData?: { usePostProcessing?: boolean } }) {
  return renderer.userData?.usePostProcessing !== false;
}
