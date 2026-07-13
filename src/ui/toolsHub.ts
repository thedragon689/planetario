export interface ToolsHubHandlers {
  onOpenProfile?: () => void;
  onOpenCollectibles?: () => void;
  onOpenSkillTree?: () => void;
  onOpenDrake?: () => void;
  onOpenCinema?: () => void;
  onOpenStarry?: () => void;
  onOpenSession?: () => void;
  onOpenFeedback?: () => void;
  onOpenStellar?: () => void;
  onOpenSpectrum?: () => void;
}

const TOOLS: Array<{ id: keyof ToolsHubHandlers; label: string; desc: string; icon: string }> = [
  { id: 'onOpenProfile', label: 'Profilo', desc: 'Modalità e suggerimenti', icon: '👤' },
  { id: 'onOpenCollectibles', label: 'Collezionabili', desc: 'Carte sbloccate', icon: '🃏' },
  { id: 'onOpenSkillTree', label: 'Abilità', desc: 'Albero progressione', icon: '🌳' },
  { id: 'onOpenDrake', label: 'Drake', desc: 'Equazione interattiva', icon: '∑' },
  { id: 'onOpenCinema', label: 'Cinema', desc: 'Tour narrati', icon: '🎬' },
  { id: 'onOpenStarry', label: 'Notte stellata', desc: 'Cielo locale', icon: '🌌' },
  { id: 'onOpenStellar', label: 'Evoluzione stellare', desc: 'Fasi di vita', icon: '★' },
  { id: 'onOpenSpectrum', label: 'Spettro', desc: 'Analisi stellare', icon: '≋' },
  { id: 'onOpenSession', label: 'Sessione', desc: 'Esplorazione condivisa', icon: '👥' },
  { id: 'onOpenFeedback', label: 'Feedback', desc: 'Segnala o suggerisci', icon: '💬' },
];

export function createToolsHub(root: HTMLElement, handlers: ToolsHubHandlers) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel tools-hub';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Strumenti avanzati');
  panel.innerHTML = `
    <header class="v21-header">
      <h2>Strumenti avanzati</h2>
      <button type="button" class="v21-close" aria-label="Chiudi">×</button>
    </header>
    <div class="tools-hub-grid"></div>
  `;
  root.appendChild(panel);

  const grid = panel.querySelector('.tools-hub-grid') as HTMLElement;
  TOOLS.forEach((tool) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tools-hub-card';
    btn.innerHTML = `
      <span class="tools-hub-icon" aria-hidden="true">${tool.icon}</span>
      <span class="tools-hub-label">${tool.label}</span>
      <span class="tools-hub-desc">${tool.desc}</span>
    `;
    btn.addEventListener('click', () => {
      handlers[tool.id]?.();
      panel.hidden = true;
    });
    grid.appendChild(btn);
  });

  panel.querySelector('.v21-close')?.addEventListener('click', () => { panel.hidden = true; });

  return {
    element: panel,
    show() { panel.hidden = false; },
    hide() { panel.hidden = true; },
  };
}
