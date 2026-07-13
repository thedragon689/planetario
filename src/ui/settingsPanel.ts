import { uiStore, type ColorBlindMode, type FontSizeLevel } from '../store/uiStore.js';
import { setLocale } from '../i18n/index.js';
import { FEATURES } from '../config.js';
import { listVisualThemes, visualThemeStore } from '../store/visualThemeStore.js';
import { setVisualTheme } from '../ui/visualTheme.js';

export function createSettingsPanel(root: HTMLElement, { onClose }: { onClose?: () => void } = {}) {
  const panel = document.createElement('aside');
  panel.className = 'settings-panel';
  panel.setAttribute('aria-label', 'Impostazioni accessibilità');
  panel.hidden = true;
  panel.innerHTML = `
    <div class="settings-header">
      <h2>Accessibilità e display</h2>
      <button type="button" class="settings-close" aria-label="Chiudi">×</button>
    </div>
    <div class="settings-body">
      <fieldset class="settings-group">
        <legend>Tema</legend>
        <label class="settings-row"><input type="radio" name="theme" value="dark" /> Scuro</label>
        <label class="settings-row"><input type="radio" name="theme" value="light" /> Chiaro</label>
      </fieldset>
      <fieldset class="settings-group">
        <legend>Dimensione testo</legend>
        <label class="settings-row"><input type="radio" name="font" value="small" /> Piccolo</label>
        <label class="settings-row"><input type="radio" name="font" value="medium" /> Medio</label>
        <label class="settings-row"><input type="radio" name="font" value="large" /> Grande</label>
      </fieldset>
      <fieldset class="settings-group">
        <legend>Daltonismo</legend>
        <select class="settings-select" name="colorblind">
          <option value="none">Nessun filtro</option>
          <option value="protanopia">Protanopia</option>
          <option value="deuteranopia">Deuteranopia</option>
          <option value="tritanopia">Tritanopia</option>
        </select>
      </fieldset>
      <label class="settings-row settings-check">
        <input type="checkbox" name="highContrast" /> Alto contrasto
      </label>
      <label class="settings-row settings-check">
        <input type="checkbox" name="reducedMotion" /> Riduci animazioni
      </label>
      <label class="settings-row settings-check">
        <input type="checkbox" name="showFps" /> Mostra FPS nell'HUD
      </label>
      <fieldset class="settings-group">
        <legend>Accessibilità avanzata (v2.1)</legend>
        <label class="settings-row settings-check">
          <input type="checkbox" name="dyslexicFont" /> Font OpenDyslexic
        </label>
        <label class="settings-row settings-check">
          <input type="checkbox" name="simplifiedUi" /> Interfaccia semplificata
        </label>
        <label class="settings-row">Lingua UI
          <select class="settings-select" name="locale">
            <option value="it">Italiano</option>
            <option value="en">English</option>
          </select>
        </label>
      </fieldset>
      <fieldset class="settings-group">
        <legend>Unità di misura</legend>
        <label class="settings-row"><input type="radio" name="units" value="metric" /> Metriche</label>
        <label class="settings-row"><input type="radio" name="units" value="imperial" /> Imperiali</label>
      </fieldset>
      ${FEATURES.visualThemes ? `
      <fieldset class="settings-group">
        <legend>Tema visivo (v2.2)</legend>
        <div class="visual-theme-grid" data-visual-themes></div>
      </fieldset>` : ''}
    </div>
  `;
  root.appendChild(panel);

  const closeBtn = panel.querySelector('.settings-close') as HTMLButtonElement;

  const themeGrid = panel.querySelector('[data-visual-themes]') as HTMLElement | null;
  if (themeGrid && FEATURES.visualThemes) {
    themeGrid.innerHTML = listVisualThemes()
      .map(
        (t) => `
        <button type="button" class="visual-theme-card" data-theme-id="${t.id}" aria-pressed="false">
          <span class="visual-theme-swatch" style="background: linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})"></span>
          <span class="visual-theme-name">${t.nameIt}</span>
        </button>`
      )
      .join('');
    themeGrid.querySelectorAll('.visual-theme-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.themeId;
        if (id) setVisualTheme(id);
        syncVisualThemes();
      });
    });
  }

  function syncVisualThemes() {
    if (!themeGrid) return;
    const active = visualThemeStore.getState().themeId;
    themeGrid.querySelectorAll('.visual-theme-card').forEach((btn) => {
      const on = (btn as HTMLElement).dataset.themeId === active;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  function syncFromStore() {
    const s = uiStore.getState();
    (panel.querySelector(`input[name="theme"][value="${s.theme}"]`) as HTMLInputElement).checked = true;
    (panel.querySelector(`input[name="font"][value="${s.fontSize}"]`) as HTMLInputElement).checked = true;
    (panel.querySelector('select[name="colorblind"]') as HTMLSelectElement).value = s.colorBlindMode;
    (panel.querySelector('input[name="highContrast"]') as HTMLInputElement).checked = s.highContrast;
    (panel.querySelector('input[name="reducedMotion"]') as HTMLInputElement).checked = s.reducedMotion === true;
    (panel.querySelector('input[name="showFps"]') as HTMLInputElement).checked = s.showFps;
    (panel.querySelector('input[name="dyslexicFont"]') as HTMLInputElement).checked = s.dyslexicFont;
    (panel.querySelector('input[name="simplifiedUi"]') as HTMLInputElement).checked = s.simplifiedUi;
    (panel.querySelector('select[name="locale"]') as HTMLSelectElement).value = s.locale;
    (panel.querySelector(`input[name="units"][value="${s.unitSystem}"]`) as HTMLInputElement).checked = true;
    syncVisualThemes();
  }

  panel.querySelectorAll('input[name="theme"]').forEach((el) => {
    el.addEventListener('change', () => {
      if ((el as HTMLInputElement).checked) {
        uiStore.getState().setTheme((el as HTMLInputElement).value as 'dark' | 'light');
      }
    });
  });
  panel.querySelectorAll('input[name="font"]').forEach((el) => {
    el.addEventListener('change', () => {
      if ((el as HTMLInputElement).checked) {
        uiStore.getState().setFontSize((el as HTMLInputElement).value as FontSizeLevel);
      }
    });
  });
  (panel.querySelector('select[name="colorblind"]') as HTMLSelectElement).addEventListener('change', (e) => {
    uiStore.getState().setColorBlindMode((e.target as HTMLSelectElement).value as ColorBlindMode);
  });
  (panel.querySelector('input[name="highContrast"]') as HTMLInputElement).addEventListener('change', (e) => {
    uiStore.getState().setHighContrast((e.target as HTMLInputElement).checked);
  });
  (panel.querySelector('input[name="reducedMotion"]') as HTMLInputElement).addEventListener('change', (e) => {
    uiStore.getState().setReducedMotion((e.target as HTMLInputElement).checked);
  });
  (panel.querySelector('input[name="showFps"]') as HTMLInputElement).addEventListener('change', (e) => {
    uiStore.getState().setShowFps((e.target as HTMLInputElement).checked);
  });
  (panel.querySelector('input[name="dyslexicFont"]') as HTMLInputElement).addEventListener('change', (e) => {
    uiStore.getState().setDyslexicFont((e.target as HTMLInputElement).checked);
  });
  (panel.querySelector('input[name="simplifiedUi"]') as HTMLInputElement).addEventListener('change', (e) => {
    uiStore.getState().setSimplifiedUi((e.target as HTMLInputElement).checked);
  });
  (panel.querySelector('select[name="locale"]') as HTMLSelectElement).addEventListener('change', (e) => {
    const loc = (e.target as HTMLSelectElement).value as 'it' | 'en';
    uiStore.getState().setLocale(loc);
    setLocale(loc);
  });
  panel.querySelectorAll('input[name="units"]').forEach((el) => {
    el.addEventListener('change', () => {
      if ((el as HTMLInputElement).checked) {
        uiStore.getState().setUnitSystem((el as HTMLInputElement).value as 'metric' | 'imperial');
      }
    });
  });

  function show() {
    syncFromStore();
    panel.hidden = false;
    panel.classList.add('visible');
  }

  function hide() {
    panel.hidden = true;
    panel.classList.remove('visible');
    onClose?.();
  }

  closeBtn.addEventListener('click', hide);

  return { show, hide, element: panel };
}
