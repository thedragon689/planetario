import { STELLAR_STAGES } from '../utils/science.js';

export function createStellarEvolutionPanel(root: HTMLElement) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel stellar-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="v21-header"><h2>Evoluzione stellare</h2><button type="button" class="v21-close">×</button></header>
    <div class="v21-body">
      <input type="range" class="stellar-slider" min="0" max="${STELLAR_STAGES.length - 1}" step="1" value="2">
      <div class="stellar-preview"><div class="stellar-star"></div></div>
      <p class="stellar-label"></p>
      <p class="stellar-meta"></p>
    </div>
  `;
  root.appendChild(panel);

  const slider = panel.querySelector('.stellar-slider') as HTMLInputElement;
  const star = panel.querySelector('.stellar-star') as HTMLElement;
  const label = panel.querySelector('.stellar-label') as HTMLElement;
  const meta = panel.querySelector('.stellar-meta') as HTMLElement;

  function render() {
    const stage = STELLAR_STAGES[Number(slider.value)];
    star.style.background = stage.color;
    star.style.transform = `scale(${stage.size})`;
    star.style.boxShadow = `0 0 ${20 + stage.luminosity}px ${stage.color}`;
    label.textContent = stage.label;
    meta.textContent = `Età ~${stage.ageMyr} milioni di anni · Luminosità relativa ${stage.luminosity}`;
  }

  slider.addEventListener('input', render);
  panel.querySelector('.v21-close')?.addEventListener('click', () => { panel.hidden = true; });
  render();

  return { element: panel, show() { panel.hidden = false; }, hide() { panel.hidden = true; } };
}
