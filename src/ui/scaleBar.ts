import { SCENES } from '../config.js';

const UNITS: Record<string, { label: string; divisor: number }> = {
  [SCENES.EARTH]: { label: 'km eq.', divisor: 1 },
  [SCENES.SOLAR_SYSTEM]: { label: 'UA', divisor: 50 },
  [SCENES.MILKY_WAY]: { label: 'anni luce', divisor: 5000 },
  [SCENES.EXOPLANETS]: { label: 'anni luce', divisor: 5000 },
  [SCENES.EXTREME]: { label: 'M☉', divisor: 1 },
  [SCENES.LOCAL_GROUP]: { label: 'Mly', divisor: 800 },
  [SCENES.OBSERVABLE]: { label: 'Mly', divisor: 1200 },
  [SCENES.WORMHOLE]: { label: '—', divisor: 1 },
};

export function createScaleBar(root: HTMLElement) {
  const el = document.createElement('div');
  el.className = 'hud-scale-bar';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <div class="scale-bar-track"><div class="scale-bar-fill"></div></div>
    <span class="scale-bar-label">—</span>
  `;
  root.appendChild(el);

  const fill = el.querySelector('.scale-bar-fill') as HTMLElement;
  const label = el.querySelector('.scale-bar-label') as HTMLElement;

  function update(cameraDistance: number, sceneKey: string) {
    const unit = UNITS[sceneKey] || UNITS[SCENES.EARTH];
    const raw = cameraDistance / unit.divisor;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 0.001))));
    const barValue = magnitude;
    const pct = Math.min(100, Math.max(12, (raw / (magnitude * 5)) * 100));
    fill.style.width = `${pct}%`;
    label.textContent = `${barValue < 0.01 ? raw.toExponential(1) : barValue.toFixed(barValue < 10 ? 1 : 0)} ${unit.label}`;
  }

  return { element: el, update };
}
