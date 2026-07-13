import { COLLECTIBLES } from '../data/collectibles.js';
import { collectiblesStore } from '../store/collectiblesStore.js';

export function createCollectiblesPanel(root: HTMLElement) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel collectibles-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="v21-header"><h2>Carte collezionabili</h2><button type="button" class="v21-close">×</button></header>
    <p class="collectibles-progress"></p>
    <div class="collectibles-grid"></div>
  `;
  root.appendChild(panel);

  const progress = panel.querySelector('.collectibles-progress') as HTMLElement;
  const grid = panel.querySelector('.collectibles-grid') as HTMLElement;

  function render() {
    const s = collectiblesStore.getState();
    const p = s.getProgress();
    progress.textContent = `Collezione: ${p.unlocked}/${p.total} (${p.percent}%)`;
    grid.innerHTML = COLLECTIBLES.map((c) => {
      const unlocked = s.hasCard(c.id);
      return `
        <article class="collectible-card collectible-card--${c.rarity}${unlocked ? ' is-unlocked' : ''}">
          <span class="collectible-icon">${c.icon}</span>
          <h3>${c.name}</h3>
          <small>${c.setName}</small>
        </article>
      `;
    }).join('');
  }

  collectiblesStore.subscribe(render);
  panel.querySelector('.v21-close')?.addEventListener('click', () => { panel.hidden = true; });
  render();

  return { element: panel, show() { panel.hidden = false; render(); }, hide() { panel.hidden = true; } };
}
