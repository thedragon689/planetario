import { ACHIEVEMENTS, ALL_ACHIEVEMENTS, gamificationStore } from '../store/gamificationStore.js';

export function createAchievementsPanel(root: HTMLElement) {
  const panel = document.createElement('aside');
  panel.className = 'achievements-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="achievements-header">
      <h2>Achievement</h2>
      <button type="button" class="achievements-close" aria-label="Chiudi achievement">×</button>
    </header>
    <div class="achievements-xp">
      <span class="achievements-level">Livello 1</span>
      <span class="achievements-points">0 XP</span>
    </div>
    <div class="achievements-list"></div>
  `;
  root.appendChild(panel);

  const list = panel.querySelector('.achievements-list') as HTMLElement;
  const levelEl = panel.querySelector('.achievements-level') as HTMLElement;
  const xpEl = panel.querySelector('.achievements-points') as HTMLElement;

  function render() {
    const s = gamificationStore.getState();
    levelEl.textContent = `${s.getLevelTitle()} · Livello ${s.getLevel()} · ${s.xp} XP`;
    xpEl.textContent = `${s.unlocked.length}/${ALL_ACHIEVEMENTS.length} sbloccati`;
    list.innerHTML = ALL_ACHIEVEMENTS.map((a) => {
      const unlocked = s.unlocked.includes(a.id);
      return `
        <article class="achievement-card${unlocked ? ' achievement-card--unlocked' : ''}">
          <span class="achievement-icon" aria-hidden="true">${a.icon}</span>
          <div>
            <h3>${a.title}</h3>
            <p>${a.description}</p>
            <small>+${a.xp} XP</small>
          </div>
        </article>
      `;
    }).join('');
  }

  render();
  gamificationStore.subscribe(render);

  panel.querySelector('.achievements-close')?.addEventListener('click', () => {
    panel.hidden = true;
  });

  return {
    element: panel,
    show() {
      panel.hidden = false;
      render();
    },
    hide() {
      panel.hidden = true;
    },
  };
}
