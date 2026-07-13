import { uiStore } from '../store/uiStore.js';
import type { SearchEntry, SearchFilters } from '../systems/globalSearch.js';
import { getBreadcrumbParts } from './sidebar.js';
import type { SceneKey } from '../types/catalog.js';

export interface TopBarOptions {
  onMenuToggle: () => void;
  onThemeToggle: () => void;
  onSettingsOpen: () => void;
  onSearch: (query: string, filters?: SearchFilters) => SearchEntry[];
  onSearchSelect: (entry: SearchEntry) => void;
  onBreadcrumbNavigate: (scene: SceneKey | null) => void;
}

export function createTopBar(root: HTMLElement, options: TopBarOptions) {
  const bar = document.createElement('header');
  bar.className = 'app-topbar';
  bar.innerHTML = `
    <button type="button" class="topbar-menu" aria-label="Apri menu esplorazione" aria-expanded="false" aria-controls="explore-sidebar">☰</button>
    <nav class="topbar-breadcrumb" aria-label="Percorso"></nav>
    <div class="topbar-search-wrap">
      <label class="sr-only" for="global-search">Cerca oggetti celesti</label>
      <input id="global-search" class="topbar-search" type="search" placeholder="Cerca pianeti, stelle, buchi neri…" autocomplete="off" />
      <select class="topbar-search-filter" aria-label="Filtra per categoria">
        <option value="">Tutte le categorie</option>
        <option value="pianeta">Pianeti</option>
        <option value="luna">Lune</option>
        <option value="stella">Stelle</option>
        <option value="galassia">Galassie</option>
        <option value="esopianeta">Esopianeti</option>
        <option value="oggetto estremo">Oggetti estremi</option>
        <option value="nebulosa">Nebulose</option>
        <option value="asteroide">Asteroidi</option>
        <option value="cometa">Comete</option>
      </select>
      <div class="search-results" role="listbox" hidden></div>
    </div>
    <div class="topbar-actions">
      <button type="button" class="topbar-btn" data-action="theme" aria-label="Cambia tema">🌙</button>
      <button type="button" class="topbar-btn" data-action="settings" aria-label="Impostazioni accessibilità">⚙</button>
    </div>
  `;
  root.appendChild(bar);

  const breadcrumb = bar.querySelector('.topbar-breadcrumb') as HTMLElement;
  const searchInput = bar.querySelector('.topbar-search') as HTMLInputElement;
  const filterSelect = bar.querySelector('.topbar-search-filter') as HTMLSelectElement;
  const resultsEl = bar.querySelector('.search-results') as HTMLElement;
  const themeBtn = bar.querySelector('[data-action="theme"]') as HTMLButtonElement;

  bar.querySelector('.topbar-menu')?.addEventListener('click', options.onMenuToggle);
  bar.querySelector('[data-action="settings"]')?.addEventListener('click', options.onSettingsOpen);

  function syncThemeBtn() {
    const dark = uiStore.getState().theme === 'dark';
    themeBtn.textContent = dark ? '☀' : '🌙';
    themeBtn.setAttribute('aria-label', dark ? 'Attiva tema chiaro' : 'Attiva tema scuro');
  }

  themeBtn.addEventListener('click', () => {
    options.onThemeToggle();
    syncThemeBtn();
  });
  uiStore.subscribe(syncThemeBtn);
  syncThemeBtn();

  function renderBreadcrumb(sceneKey: SceneKey, objectName?: string | null) {
    const parts = getBreadcrumbParts(sceneKey, objectName);
    breadcrumb.innerHTML = parts
      .map((part, i) => {
        const isLast = i === parts.length - 1;
        if (isLast || !part.scene) {
          return `<span class="crumb${isLast ? ' crumb--current' : ''}">${part.label}</span>`;
        }
        return `<button type="button" class="crumb crumb--link" data-scene="${part.scene}">${part.label}</button><span class="crumb-sep">›</span>`;
      })
      .join('');

    breadcrumb.querySelectorAll('.crumb--link').forEach((btn) => {
      btn.addEventListener('click', () => {
        const scene = (btn as HTMLElement).dataset.scene as SceneKey;
        options.onBreadcrumbNavigate(scene);
      });
    });
  }

  function runSearch() {
    const q = searchInput.value.trim();
    const category = filterSelect.value || undefined;
    if (q.length < 2 && !category) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
      return;
    }
    const results = options.onSearch(q, { category });
    if (!results.length) {
      resultsEl.innerHTML = '<div class="search-empty">Nessun risultato</div>';
      resultsEl.hidden = false;
      return;
    }
    resultsEl.innerHTML = results
      .map(
        (r) => `
          <button type="button" class="search-item" role="option" data-id="${r.id}">
            <span class="search-item-name">${r.name}</span>
            <span class="search-item-meta">${r.type} · ${r.category}</span>
          </button>
        `
      )
      .join('');
    resultsEl.hidden = false;
    resultsEl.querySelectorAll('.search-item').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        options.onSearchSelect(results[i]);
        resultsEl.hidden = true;
        searchInput.value = '';
      });
    });
  }

  let debounce = 0;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = window.setTimeout(runSearch, 120);
  });
  filterSelect.addEventListener('change', runSearch);

  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      resultsEl.hidden = true;
    }, 180);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  return {
    element: bar,
    renderBreadcrumb,
    setSearchFilter: (text: string, category?: string) => {
      searchInput.value = text;
      if (category) filterSelect.value = category;
      runSearch();
      searchInput.focus();
    },
  };
}
