import { SCENE_LABELS, SCENE_ORDER, SCENES, SCENE_META } from '../config.js';
import type { SceneKey } from '../types/catalog.js';
import { uiStore } from '../store/uiStore.js';

export interface SidebarHandlers {
  onNavigateScene: (scene: SceneKey) => void;
  onSelectObject?: (id: string, filter?: string) => void;
  onOpenBookmarks?: () => void;
  onOpenSettings?: () => void;
  onOpenGlossary?: () => void;
  onOpenAchievements?: () => void;
  onOpenTours?: () => void;
  onOpenLearning?: () => void;
  onOpenEditor?: () => void;
  onOpenEvents?: () => void;
  onOpenProfile?: () => void;
  onOpenTools?: () => void;
  onOpenCollectibles?: () => void;
  onOpenDrake?: () => void;
  onOpenCinema?: () => void;
  onOpenStarry?: () => void;
  onOpenSession?: () => void;
  onOpenFeedback?: () => void;
  onOpenSkillTree?: () => void;
}

const TREE: Array<{
  scene?: SceneKey;
  label: string;
  icon: string;
  children?: Array<{ label: string; filter: string; scene?: SceneKey }>;
}> = [
  { scene: SCENES.EARTH, label: SCENE_LABELS[SCENES.EARTH], icon: '⊕' },
  {
    scene: SCENES.SOLAR_SYSTEM,
    label: SCENE_LABELS[SCENES.SOLAR_SYSTEM],
    icon: '☉',
    children: [
      { label: 'Pianeti e lune', filter: 'pianeta', scene: SCENES.SOLAR_SYSTEM },
      { label: 'Asteroidi e comete', filter: 'asteroide', scene: SCENES.SOLAR_SYSTEM },
    ],
  },
  {
    scene: SCENES.MILKY_WAY,
    label: SCENE_LABELS[SCENES.MILKY_WAY],
    icon: '✦',
    children: [{ label: 'Nebulose', filter: 'nebulosa', scene: SCENES.MILKY_WAY }],
  },
  { scene: SCENES.EXOPLANETS, label: SCENE_LABELS[SCENES.EXOPLANETS], icon: '⊕' },
  { scene: SCENES.EXTREME, label: SCENE_LABELS[SCENES.EXTREME], icon: '◉' },
  { scene: SCENES.LOCAL_GROUP, label: SCENE_LABELS[SCENES.LOCAL_GROUP], icon: '◎' },
  { scene: SCENES.OBSERVABLE, label: SCENE_LABELS[SCENES.OBSERVABLE], icon: '∞' },
  { scene: SCENES.WORMHOLE, label: SCENE_LABELS[SCENES.WORMHOLE], icon: '◈' },
];

export function createSidebar(root: HTMLElement, handlers: SidebarHandlers) {
  const aside = document.createElement('aside');
  aside.className = 'app-sidebar';
  aside.setAttribute('aria-label', 'Navigazione esplorazione');
  aside.innerHTML = `
    <div class="sidebar-header">
      <h2 class="sidebar-title">Esplora</h2>
      <button type="button" class="sidebar-close" aria-label="Chiudi menu">×</button>
    </div>
    <nav class="sidebar-tree" role="tree"></nav>
    <div class="sidebar-footer">
      <button type="button" class="sidebar-footer-btn" data-action="bookmarks">♥ I miei oggetti</button>
      <button type="button" class="sidebar-footer-btn" data-action="tours">✧ Tour guidati</button>
      <button type="button" class="sidebar-footer-btn" data-action="glossary">📖 Glossario</button>
      <button type="button" class="sidebar-footer-btn" data-action="achievements">🏆 Achievement</button>
      <button type="button" class="sidebar-footer-btn" data-action="learning">📚 Percorsi didattici</button>
      <button type="button" class="sidebar-footer-btn" data-action="editor">✎ Editor sistemi</button>
      <button type="button" class="sidebar-footer-btn" data-action="events">📅 Eventi</button>
      <button type="button" class="sidebar-footer-btn sidebar-footer-btn--primary" data-action="tools">🧰 Strumenti avanzati</button>
      <button type="button" class="sidebar-footer-btn" data-action="profile">👤 Profilo</button>
      <button type="button" class="sidebar-footer-btn" data-action="settings">⚙ Accessibilità</button>
    </div>
  `;
  aside.setAttribute('aria-hidden', 'true');
  aside.inert = true;
  root.appendChild(aside);

  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  root.appendChild(backdrop);

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'sidebar-launcher';
  launcher.setAttribute('aria-label', 'Apri menu esplorazione');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'explore-sidebar');
  launcher.innerHTML = `
    <span class="sidebar-launcher-icon" aria-hidden="true">☰</span>
    <span class="sidebar-launcher-label">Esplora</span>
  `;
  root.appendChild(launcher);

  aside.id = 'explore-sidebar';

  const tree = aside.querySelector('.sidebar-tree') as HTMLElement;
  const closeBtn = aside.querySelector('.sidebar-close') as HTMLButtonElement;

  TREE.forEach((node) => {
    const item = document.createElement('div');
    item.className = 'sidebar-node';
    item.setAttribute('role', 'treeitem');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sidebar-scene-btn';
    btn.dataset.scene = node.scene || '';
    btn.innerHTML = `
      <span class="sidebar-icon" aria-hidden="true">${node.icon}</span>
      <span class="sidebar-label">${node.label}</span>
      <span class="sidebar-scale">${node.scene ? SCENE_META[node.scene]?.scale || '' : ''}</span>
    `;
    btn.addEventListener('click', () => {
      if (node.scene) handlers.onNavigateScene(node.scene);
      setOpen(false);
    });
    item.appendChild(btn);

    if (node.children?.length) {
      const sub = document.createElement('div');
      sub.className = 'sidebar-children';
      sub.setAttribute('role', 'group');
      node.children.forEach((child) => {
        const subBtn = document.createElement('button');
        subBtn.type = 'button';
        subBtn.className = 'sidebar-child-btn';
        subBtn.textContent = child.label;
        subBtn.addEventListener('click', () => {
          if (child.scene) handlers.onNavigateScene(child.scene);
          handlers.onSelectObject?.('', child.filter);
          setOpen(false);
        });
        sub.appendChild(subBtn);
      });
      item.appendChild(sub);
    }

    tree.appendChild(item);
  });

  function setOpen(open: boolean) {
    aside.classList.toggle('open', open);
    backdrop.classList.toggle('visible', open);
    aside.setAttribute('aria-hidden', String(!open));
    aside.inert = !open;
    backdrop.setAttribute('aria-hidden', String(!open));
    launcher.hidden = open;
    launcher.setAttribute('aria-expanded', String(open));

    uiStore.getState().setSidebarOpen(open);
    document.documentElement.classList.toggle('sidebar-open', open);
  }

  launcher.addEventListener('click', () => setOpen(true));
  closeBtn.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aside.classList.contains('open')) {
      setOpen(false);
    }
  });

  aside.querySelector('[data-action="bookmarks"]')?.addEventListener('click', () => {
    handlers.onOpenBookmarks?.();
    setOpen(false);
  });
  aside.querySelector('[data-action="tours"]')?.addEventListener('click', () => {
    handlers.onOpenTours?.();
    setOpen(false);
  });
  aside.querySelector('[data-action="glossary"]')?.addEventListener('click', () => {
    handlers.onOpenGlossary?.();
    setOpen(false);
  });
  aside.querySelector('[data-action="achievements"]')?.addEventListener('click', () => {
    handlers.onOpenAchievements?.();
    setOpen(false);
  });
  aside.querySelector('[data-action="learning"]')?.addEventListener('click', () => {
    handlers.onOpenLearning?.();
    setOpen(false);
  });
  aside.querySelector('[data-action="editor"]')?.addEventListener('click', () => {
    handlers.onOpenEditor?.();
    setOpen(false);
  });
  aside.querySelector('[data-action="events"]')?.addEventListener('click', () => {
    handlers.onOpenEvents?.();
    setOpen(false);
  });
  aside.querySelector('[data-action="profile"]')?.addEventListener('click', () => {
    handlers.onOpenProfile?.();
    setOpen(false);
  });
  aside.querySelector('[data-action="tools"]')?.addEventListener('click', () => {
    handlers.onOpenTools?.();
    setOpen(false);
  });
  aside.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
    handlers.onOpenSettings?.();
    setOpen(false);
  });

  function setActiveScene(sceneKey: SceneKey) {
    aside.querySelectorAll('.sidebar-scene-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.scene === sceneKey);
    });
  }

  return {
    element: aside,
    setOpen,
    toggle: () => setOpen(!aside.classList.contains('open')),
    setActiveScene,
  };
}

export function getBreadcrumbParts(sceneKey: SceneKey, objectName?: string | null) {
  const index = SCENE_ORDER.indexOf(sceneKey);
  const parts = [{ label: 'Planetario', scene: null as SceneKey | null }];
  if (index >= 0) parts.push({ label: SCENE_LABELS[sceneKey], scene: sceneKey });
  if (objectName) parts.push({ label: objectName, scene: null });
  return parts;
}
