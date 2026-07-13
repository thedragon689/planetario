import { uiStore } from '../store/uiStore.js';

const FONT_SCALE = { small: '14px', medium: '16px', large: '18px' } as const;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function applyThemeFromStore() {
  const {
    theme,
    highContrast,
    colorBlindMode,
    fontSize,
    reducedMotion,
  } = uiStore.getState();

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.highContrast = String(highContrast);
  root.dataset.colorBlind = colorBlindMode;
  root.dataset.fontSize = fontSize;

  const motion = reducedMotion ?? prefersReducedMotion();
  root.dataset.reducedMotion = String(motion);
  root.style.fontSize = FONT_SCALE[fontSize];

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'light' ? '#e8eef5' : '#1A2A6C');
  }
}

export function initTheme() {
  applyThemeFromStore();
  uiStore.subscribe(applyThemeFromStore);

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    if (uiStore.getState().reducedMotion === null) applyThemeFromStore();
  });
}

export function injectColorBlindFilters() {
  if (document.getElementById('colorblind-filters')) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'colorblind-filters';
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = `
    <defs>
      <filter id="cb-protanopia">
        <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="cb-deuteranopia">
        <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="cb-tritanopia">
        <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
      </filter>
    </defs>
  `;
  document.body.appendChild(svg);
}
