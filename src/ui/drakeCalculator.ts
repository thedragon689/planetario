import { drakeEquation, type DrakeParams } from '../utils/science.js';

const DEFAULTS: DrakeParams = { R: 1.5, fp: 0.5, ne: 2, fl: 0.33, fi: 0.01, fc: 0.01, L: 10000 };

export function createDrakeCalculator(root: HTMLElement) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel drake-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="v21-header"><h2>Equazione di Drake</h2><button type="button" class="v21-close">×</button></header>
    <div class="v21-body drake-sliders"></div>
    <p class="drake-result"></p>
  `;
  root.appendChild(panel);

  const sliders = panel.querySelector('.drake-sliders') as HTMLElement;
  const result = panel.querySelector('.drake-result') as HTMLElement;
  const params = { ...DEFAULTS };

  const defs: Array<{ key: keyof DrakeParams; label: string; min: number; max: number; step: number }> = [
    { key: 'R', label: 'R* — stelle/anno', min: 0.1, max: 10, step: 0.1 },
    { key: 'fp', label: 'fp — pianeti per stella', min: 0, max: 1, step: 0.05 },
    { key: 'ne', label: 'ne — pianeti abitabili', min: 0, max: 5, step: 0.1 },
    { key: 'fl', label: 'fl — vita', min: 0, max: 1, step: 0.05 },
    { key: 'fi', label: 'fi — intelligenza', min: 0, max: 1, step: 0.005 },
    { key: 'fc', label: 'fc — comunicazioni', min: 0, max: 1, step: 0.005 },
    { key: 'L', label: 'L — anni segnali', min: 100, max: 100000, step: 100 },
  ];

  defs.forEach(({ key, label, min, max, step }) => {
    const row = document.createElement('label');
    row.className = 'drake-row';
    row.innerHTML = `<span>${label}</span><input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${params[key]}"><output>${params[key]}</output>`;
    sliders.appendChild(row);
  });

  function update() {
    sliders.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach((inp) => {
      const k = inp.dataset.key as keyof DrakeParams;
      params[k] = Number(inp.value);
      const out = inp.parentElement?.querySelector('output');
      if (out) out.textContent = inp.value;
    });
    const n = drakeEquation(params);
    result.textContent = `N ≈ ${n < 0.01 ? n.toExponential(2) : n.toFixed(2)} civiltà comunicative nella galassia`;
  }

  sliders.addEventListener('input', update);
  panel.querySelector('.v21-close')?.addEventListener('click', () => { panel.hidden = true; });
  update();

  return { element: panel, show() { panel.hidden = false; }, hide() { panel.hidden = true; } };
}
