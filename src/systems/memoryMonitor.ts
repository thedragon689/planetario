import type { WebGLRenderer } from 'three';

/**
 * Overlay dev con statistiche memoria WebGL (geometrie, texture, draw calls).
 */
export function createMemoryMonitor(renderer: WebGLRenderer, root: HTMLElement) {
  if (!import.meta.env.DEV) {
    return { update: () => {}, dispose: () => {} };
  }

  const el = document.createElement('div');
  el.className = 'dev-memory-monitor';
  el.setAttribute('aria-hidden', 'true');
  root.appendChild(el);

  let frame = 0;

  function update() {
    frame++;
    if (frame % 30 !== 0) return;

    const info = renderer.info;
    el.textContent = [
      `geo ${info.memory.geometries}`,
      `tex ${info.memory.textures}`,
      `calls ${info.render.calls}`,
      `tris ${info.render.triangles}`,
    ].join(' · ');
  }

  function dispose() {
    el.remove();
  }

  return { update, dispose };
}
