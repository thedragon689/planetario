import { SCENE_ORDER, SCENE_LABELS, SCENE_META, NAV_SHORTCUTS, AUDIO } from '../config.js';
import { fadeIn } from '../systems/animations.js';

export function createOverlays(root, navigation, audio, { onMissions, onGraticuleToggle, wikipedia, onChat } = {}) {
  const nav = document.createElement('nav');
  nav.className = 'scene-nav';
  nav.setAttribute('aria-label', 'Navigazione scale cosmiche');

  const timelineEl = document.createElement('div');
  timelineEl.className = 'nav-timeline';
  timelineEl.setAttribute('aria-hidden', 'true');
  timelineEl.innerHTML = '<div class="nav-timeline-fill"></div>';
  const timelineFill = timelineEl.querySelector('.nav-timeline-fill');

  const journeyEl = document.createElement('div');
  journeyEl.className = 'nav-journey';
  journeyEl.setAttribute('role', 'tablist');
  journeyEl.setAttribute('aria-label', 'Percorso cosmico');

  SCENE_ORDER.forEach((key, i) => {
    const meta = SCENE_META[key] || {};
    const step = document.createElement('button');
    step.type = 'button';
    step.className = 'nav-step';
    step.dataset.index = i;
    step.dataset.scene = key;
    step.setAttribute('role', 'tab');
    step.setAttribute('aria-label', `${SCENE_LABELS[key]} — ${meta.scale || ''}`);
    step.innerHTML = `
      <span class="nav-step-icon" aria-hidden="true">${meta.icon || '·'}</span>
      <span class="nav-step-label">${meta.short || SCENE_LABELS[key]}</span>
      <span class="nav-step-scale">${meta.scale || ''}</span>
    `;
    step.addEventListener('click', () => navigation.goTo(key));
    journeyEl.appendChild(step);

    if (i < SCENE_ORDER.length - 1) {
      const connector = document.createElement('span');
      connector.className = 'nav-connector';
      connector.setAttribute('aria-hidden', 'true');
      journeyEl.appendChild(connector);
    }
  });

  const hintEl = document.createElement('p');
  hintEl.className = 'nav-hint';
  hintEl.setAttribute('aria-live', 'polite');

  const sceneWikiEl = document.createElement('aside');
  sceneWikiEl.className = 'scene-wiki';
  sceneWikiEl.setAttribute('aria-label', 'Definizione della sezione');
  sceneWikiEl.innerHTML = `
    <div class="scene-wiki-header">
      <span class="wiki-badge">Wikipedia</span>
      <h3 class="scene-wiki-title"></h3>
    </div>
    <p class="scene-wiki-text"></p>
    <a class="scene-wiki-link" href="#" target="_blank" rel="noopener" hidden>Approfondisci su Wikipedia →</a>
  `;

  const sceneWikiTitle = sceneWikiEl.querySelector('.scene-wiki-title');
  const sceneWikiText = sceneWikiEl.querySelector('.scene-wiki-text');
  const sceneWikiLink = sceneWikiEl.querySelector('.scene-wiki-link');

  let wikiRequestId = 0;

  async function loadSceneWiki(sceneKey) {
    if (!wikipedia) {
      sceneWikiEl.hidden = true;
      return;
    }

    const requestId = ++wikiRequestId;
    sceneWikiEl.hidden = false;
    sceneWikiEl.classList.add('loading');
    sceneWikiTitle.textContent = SCENE_LABELS[sceneKey] || '';
    sceneWikiText.textContent = 'Caricamento definizione...';
    sceneWikiLink.hidden = true;

    try {
      const summary = await wikipedia.getSummaryForScene(sceneKey);
      if (requestId !== wikiRequestId) return;

      if (!summary?.extract) {
        sceneWikiText.textContent = 'Definizione non disponibile per questa sezione.';
        return;
      }

      sceneWikiTitle.textContent = summary.title || SCENE_LABELS[sceneKey];
      sceneWikiText.textContent = summary.extract;
      if (summary.pageUrl) {
        sceneWikiLink.href = summary.pageUrl;
        sceneWikiLink.hidden = false;
      }
    } catch {
      if (requestId !== wikiRequestId) return;
      sceneWikiText.textContent = 'Impossibile caricare la definizione Wikipedia.';
    } finally {
      if (requestId === wikiRequestId) sceneWikiEl.classList.remove('loading');
    }
  }

  const shortcutsEl = document.createElement('div');
  shortcutsEl.className = 'nav-shortcuts';
  shortcutsEl.innerHTML = NAV_SHORTCUTS.map(
    (s) => `<span class="nav-key"><kbd>${s.keys}</kbd> ${s.action}</span>`
  ).join('');

  const indicator = document.createElement('div');
  indicator.className = 'nav-indicator';
  indicator.appendChild(hintEl);
  indicator.appendChild(sceneWikiEl);
  indicator.appendChild(shortcutsEl);

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'nav-btn nav-prev';
  prevBtn.setAttribute('aria-label', 'Scala precedente');
  prevBtn.textContent = '‹';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'nav-btn nav-next';
  nextBtn.setAttribute('aria-label', 'Scala successiva');
  nextBtn.textContent = '›';

  nav.append(prevBtn, timelineEl, journeyEl, nextBtn, indicator);

  prevBtn.addEventListener('click', () => navigation.prev());
  nextBtn.addEventListener('click', () => navigation.next());
  root.appendChild(nav);

  const controls = document.createElement('div');
  controls.className = 'overlay-controls';
  const trackTitle = `${AUDIO.soundtrack.title} — ${AUDIO.soundtrack.artist}`;
  controls.innerHTML = `
    <div class="overlay-controls-primary">
      <button type="button" class="ctrl-btn" data-action="graticule" aria-label="Mostra meridiani e paralleli" aria-pressed="true" title="Meridiani e paralleli">⊞</button>
      <button type="button" class="ctrl-btn" data-action="missions" aria-label="Missioni NASA">✦</button>
      <button type="button" class="ctrl-btn" data-action="chat" aria-label="Guida didattica Gemini" title="Chiedi alla guida astronomica">?</button>
      <button type="button" class="ctrl-btn" data-action="audio" aria-label="Avvia colonna sonora" aria-pressed="false" title="${trackTitle}">♪</button>
      <button type="button" class="ctrl-btn" data-action="focus" aria-label="Ripristina vista scena">◎</button>
      <button type="button" class="ctrl-btn" data-action="quality" aria-label="Cambia qualità grafica">◆</button>
    </div>
    <button type="button" class="ctrl-btn overlay-tools-toggle" data-action="tools-expand" aria-expanded="false" aria-label="Altri strumenti" title="Altri strumenti">⋯</button>
    <div class="overlay-tools-drawer" hidden></div>
  `;
  root.appendChild(controls);

  const toolsToggle = controls.querySelector('[data-action="tools-expand"]');
  const toolsDrawer = controls.querySelector('.overlay-tools-drawer');
  toolsToggle?.addEventListener('click', () => {
    const open = toolsDrawer?.hidden;
    if (toolsDrawer) toolsDrawer.hidden = !open;
    toolsToggle.setAttribute('aria-expanded', String(open));
    toolsToggle.classList.toggle('active', open);
  });

  const focusOverlay = document.createElement('div');
  focusOverlay.className = 'focus-overlay';
  focusOverlay.setAttribute('aria-hidden', 'true');
  root.appendChild(focusOverlay);

  const graticuleBtn = controls.querySelector('[data-action="graticule"]');
  let graticuleOn = true;
  graticuleBtn.classList.add('active');

  graticuleBtn.addEventListener('click', () => {
    graticuleOn = !graticuleOn;
    graticuleBtn.classList.toggle('active', graticuleOn);
    graticuleBtn.setAttribute('aria-pressed', String(graticuleOn));
    graticuleBtn.setAttribute(
      'aria-label',
      graticuleOn ? 'Nascondi meridiani e paralleli' : 'Mostra meridiani e paralleli'
    );
    onGraticuleToggle?.(graticuleOn);
  });

  const audioBtn = controls.querySelector('[data-action="audio"]');
  const defaultTrackTitle = `${AUDIO.soundtrack.title} — ${AUDIO.soundtrack.artist}`;

  function syncAudioButtonTitle() {
    const label = audio.getTrackLabel?.() || defaultTrackTitle;
    audioBtn.title = audio.isEnabled?.() ? `In riproduzione: ${label}` : label;
  }

  audioBtn.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    // toggle() must start in the same user-gesture turn as the click (no await before play()).
    void audio.resume();
    void audio.toggle().then((on) => {
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute(
        'aria-label',
        on ? 'Ferma colonna sonora' : 'Avvia colonna sonora'
      );
      syncAudioButtonTitle();
    });
  });

  controls.querySelector('[data-action="missions"]').addEventListener('click', () => {
    onMissions?.();
  });

  const chatBtn = controls.querySelector('[data-action="chat"]');
  chatBtn.addEventListener('click', () => {
    onChat?.();
    chatBtn.classList.toggle('active');
  });

  function updateScene(sceneKey, index) {
    const progress = SCENE_ORDER.length > 1 ? index / (SCENE_ORDER.length - 1) : 0;
    if (timelineFill) timelineFill.style.width = `${Math.round(progress * 100)}%`;

    journeyEl.querySelectorAll('.nav-step').forEach((step, i) => {
      const active = i === index;
      step.classList.toggle('active', active);
      step.setAttribute('aria-selected', String(active));
    });

    const meta = SCENE_META[sceneKey];
    hintEl.textContent = meta?.hint || `Esplora ${SCENE_LABELS[sceneKey]}`;
    loadSceneWiki(sceneKey);

    const isEarth = sceneKey === 'earth';
    graticuleBtn.style.display = isEarth ? '' : 'none';
    if (isEarth) {
      graticuleBtn.classList.toggle('active', graticuleOn);
      onGraticuleToggle?.(graticuleOn);
    }
  }

  /** @deprecated usa updateScene */
  function updateDots(index) {
    updateScene(SCENE_ORDER[index], index);
  }

  function setFocusMode(active) {
    focusOverlay.classList.toggle('active', active);
    focusOverlay.setAttribute('aria-hidden', String(!active));
  }

  fadeIn(nav);
  fadeIn(controls);

  return {
    updateDots,
    updateScene(sceneKey, index) {
      updateScene(sceneKey, index);
      syncAudioButtonTitle();
    },
    setFocusMode,
    nav,
    controls,
    setGraticuleVisible(visible) {
      graticuleOn = visible;
      graticuleBtn.classList.toggle('active', visible);
      graticuleBtn.setAttribute('aria-pressed', String(visible));
    },
    setChatActive(active) {
      chatBtn.classList.toggle('active', active);
    },
  };
}
