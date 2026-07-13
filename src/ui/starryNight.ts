import { CONSTELLATION_MYTHS } from '../i18n/index.js';

const CITIES = [
  { name: 'Roma', lat: 41.9, lon: 12.5 },
  { name: 'Milano', lat: 45.46, lon: 9.19 },
  { name: 'New York', lat: 40.71, lon: -74.01 },
  { name: 'Tokyo', lat: 35.68, lon: 139.69 },
];

export function createStarryNightPanel(root: HTMLElement) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel starry-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="v21-header"><h2>Notte stellata</h2><button type="button" class="v21-close">×</button></header>
    <div class="v21-body">
      <label>Città <select class="starry-city"></select></label>
      <label>Data <input type="date" class="starry-date"></label>
      <label>Ora <input type="time" class="starry-time" value="22:00"></label>
      <canvas class="starry-canvas" width="320" height="200"></canvas>
      <p class="starry-myth"></p>
    </div>
  `;
  root.appendChild(panel);

  const citySel = panel.querySelector('.starry-city') as HTMLSelectElement;
  const dateInp = panel.querySelector('.starry-date') as HTMLInputElement;
  const timeInp = panel.querySelector('.starry-time') as HTMLInputElement;
  const canvas = panel.querySelector('.starry-canvas') as HTMLCanvasElement;
  const myth = panel.querySelector('.starry-myth') as HTMLElement;
  const ctx = canvas.getContext('2d')!;

  CITIES.forEach((c) => {
    const o = document.createElement('option');
    o.value = `${c.lat},${c.lon}`;
    o.textContent = c.name;
    citySel.appendChild(o);
  });
  dateInp.value = new Date().toISOString().slice(0, 10);

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, w, h);
    const seed = citySel.selectedIndex * 97 + dateInp.value.length * 13;
    for (let i = 0; i < 120; i++) {
      const x = ((seed + i * 17) % 1000) / 1000 * w;
      const y = ((seed + i * 31) % 700) / 1000 * h;
      const r = ((seed + i) % 3) * 0.4 + 0.3;
      ctx.fillStyle = `rgba(234,246,255,${0.3 + (i % 5) * 0.12})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(86,204,242,0.35)';
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.35);
    ctx.lineTo(w * 0.35, h * 0.25);
    ctx.lineTo(w * 0.5, h * 0.4);
    ctx.stroke();
    ctx.fillStyle = '#56ccf2';
    ctx.font = '11px sans-serif';
    ctx.fillText('Orione (demo)', w * 0.52, h * 0.42);
    myth.textContent = CONSTELLATION_MYTHS.orion.it;
  }

  [citySel, dateInp, timeInp].forEach((el) => el.addEventListener('change', draw));
  panel.querySelector('.v21-close')?.addEventListener('click', () => { panel.hidden = true; });
  draw();

  return { element: panel, show() { panel.hidden = false; draw(); }, hide() { panel.hidden = true; } };
}
