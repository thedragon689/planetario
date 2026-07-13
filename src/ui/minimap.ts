import { SCENE_LABELS, SCENE_ORDER } from '../config.js';
import type { SceneKey } from '../types/catalog.js';

/**
 * Minimappa schematica 2D: percorso cosmico + indicatore scena corrente.
 */
export function createMinimap(root: HTMLElement) {
  const wrap = document.createElement('aside');
  wrap.className = 'cosmic-minimap';
  wrap.setAttribute('aria-label', 'Minimappa del percorso cosmico');

  const canvas = document.createElement('canvas');
  canvas.width = 220;
  canvas.height = 56;
  canvas.className = 'cosmic-minimap-canvas';
  wrap.appendChild(canvas);

  const label = document.createElement('p');
  label.className = 'cosmic-minimap-label';
  wrap.appendChild(label);

  root.appendChild(wrap);

  const ctx = canvas.getContext('2d');
  let sceneIndex = 0;
  let cameraYaw = 0;

  function draw() {
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const pad = 18;
    const y = height / 2;
    const span = width - pad * 2;
    const step = span / (SCENE_ORDER.length - 1);

    ctx.strokeStyle = 'rgba(86, 204, 242, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();

    SCENE_ORDER.forEach((key, i) => {
      const x = pad + i * step;
      const active = i === sceneIndex;
      ctx.beginPath();
      ctx.fillStyle = active ? '#56CCF2' : 'rgba(234, 246, 255, 0.35)';
      ctx.arc(x, y, active ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      if (active) {
        const dirX = Math.cos(cameraYaw) * 14;
        const dirY = Math.sin(cameraYaw) * 8;
        ctx.strokeStyle = '#EAF6FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dirX, y - dirY);
        ctx.stroke();
      }

      if (i === 0 || i === SCENE_ORDER.length - 1 || active) {
        ctx.fillStyle = 'rgba(234, 246, 255, 0.7)';
        ctx.font = '9px system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(SCENE_LABELS[key].split(' ')[0], x, height - 6);
      }
    });
  }

  return {
    element: wrap,
    setScene(index: number, sceneKey: SceneKey) {
      sceneIndex = index;
      label.textContent = SCENE_LABELS[sceneKey] || '';
      draw();
    },
    setCameraYaw(yaw: number) {
      cameraYaw = yaw;
      draw();
    },
  };
}
