import { SKILL_TREE } from '../data/skillTree.js';
import { gamificationStore } from '../store/gamificationStore.js';

export function createSkillTreePanel(root: HTMLElement) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel skill-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="v21-header"><h2>Albero abilità</h2><button type="button" class="v21-close">×</button></header>
    <div class="skill-branches"></div>
  `;
  root.appendChild(panel);

  const branches = panel.querySelector('.skill-branches') as HTMLElement;
  const branchLabels: Record<string, string> = {
    solar: 'Sistema Solare',
    stars: 'Stelle',
    galaxies: 'Galassie',
    exoplanets: 'Esopianeti',
  };

  function render() {
    const xp = gamificationStore.getState().xp;
    const byBranch: Record<string, typeof SKILL_TREE> = {};
    SKILL_TREE.forEach((n) => {
      if (!byBranch[n.branch]) byBranch[n.branch] = [];
      byBranch[n.branch].push(n);
    });
    branches.innerHTML = Object.entries(byBranch).map(([branch, nodes]) => `
      <section class="skill-branch">
        <h3>${branchLabels[branch] || branch}</h3>
        ${nodes.map((n) => {
          const unlocked = xp >= n.requiredXp;
          return `<div class="skill-node${unlocked ? ' is-unlocked' : ''}"><span>${n.icon}</span><div><strong>${n.title}</strong><p>${n.description}</p><small>${n.requiredXp} XP</small></div></div>`;
        }).join('')}
      </section>
    `).join('');
  }

  gamificationStore.subscribe(render);
  panel.querySelector('.v21-close')?.addEventListener('click', () => { panel.hidden = true; });
  render();

  return { element: panel, show() { panel.hidden = false; render(); }, hide() { panel.hidden = true; } };
}
