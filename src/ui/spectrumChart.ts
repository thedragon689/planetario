import { SPECTRAL_LINES, spectralClassFromTemp } from '../utils/science.js';

export function createSpectrumChart(root: HTMLElement) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel spectrum-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="v21-header"><h2>Spettro stellare</h2><button type="button" class="v21-close">×</button></header>
    <canvas class="spectrum-canvas" width="360" height="140" role="img" aria-label="Grafico spettro"></canvas>
    <p class="spectrum-meta"></p>
  `;
  root.appendChild(panel);

  const canvas = panel.querySelector('.spectrum-canvas') as HTMLCanvasElement;
  const meta = panel.querySelector('.spectrum-meta') as HTMLElement;
  const ctx = canvas.getContext('2d')!;

  function draw(tempK = 5778, spectralClass?: string) {
    const cls = spectralClass || spectralClassFromTemp(tempK);
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#220044');
    grad.addColorStop(0.3, '#4422aa');
    grad.addColorStop(0.55, '#88ccff');
    grad.addColorStop(0.75, '#ffffcc');
    grad.addColorStop(1, '#ff8844');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 20, w, 40);

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    (SPECTRAL_LINES[cls] || SPECTRAL_LINES.G).forEach(({ nm, label }) => {
      const x = ((nm - 380) / 320) * w;
      ctx.beginPath();
      ctx.moveTo(x, 18);
      ctx.lineTo(x, 82);
      ctx.stroke();
      ctx.fillStyle = '#eaf6ff';
      ctx.font = '10px sans-serif';
      ctx.fillText(label, x + 2, 95);
    });

    meta.textContent = `Classe ${cls} · Teff ~${tempK} K`;
  }

  panel.querySelector('.v21-close')?.addEventListener('click', () => { panel.hidden = true; });

  return {
    element: panel,
    showForStar(data: { temperature?: number; spectralClass?: string; name?: string } = {}) {
      panel.hidden = false;
      draw(data.temperature || 5778, data.spectralClass);
      if (data.name) meta.textContent += ` · ${data.name}`;
    },
    hide() { panel.hidden = true; },
    draw,
  };
}
