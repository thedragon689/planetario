/**
 * Rileva supporto WebGPU (future-proofing per Three.js WebGPURenderer).
 */
export async function detectWebGPU(): Promise<boolean> {
  const nav = navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } };
  if (!nav.gpu) return false;
  try {
    const adapter = await nav.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

export function logRendererCapabilities(rendererType: 'webgl2' | 'webgl' | 'webgpu') {
  console.info(`[Planetario] Renderer: ${rendererType}`);
}
