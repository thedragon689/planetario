import { uiStore } from '../store/uiStore.js';
import type { SearchEntry, SearchFilters } from '../systems/globalSearch.js';

export interface TopBarOptions {
  onThemeToggle: () => void;
  onSettingsOpen: () => void;
  onSearch: (query: string, filters?: SearchFilters) => SearchEntry[];
  onSearchSelect: (entry: SearchEntry) => void;
}

export function createTopBar(root: HTMLElement, options: TopBarOptions) {
  const bar = document.createElement('header');
  bar.className = 'app-topbar';
  bar.innerHTML = `
    <div class="topbar-main">
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
      <div class="topbar-coords-host" data-coords-host></div>
    </div>
    <div class="topbar-actions">
      <button type="button" class="topbar-btn" data-action="theme" aria-label="Cambia tema">🌙</button>
      <button type="button" class="topbar-btn" data-action="settings" aria-label="Impostazioni accessibilità" aria-expanded="false" aria-haspopup="dialog">⚙</button>
    </div>
  `;
  root.appendChild(bar);

  const searchInput = bar.querySelector('.topbar-search') as HTMLInputElement;
  const filterSelect = bar.querySelector('.topbar-search-filter') as HTMLSelectElement;
  const resultsEl = bar.querySelector('.search-results') as HTMLElement;
  const themeBtn = bar.querySelector('[data-action="theme"]') as HTMLButtonElement;
  const settingsBtn = bar.querySelector('[data-action="settings"]') as HTMLButtonElement;

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

  // Keep focus on the input while clicking a result (blur would hide the list first).
  resultsEl.addEventListener('mousedown', (e) => e.preventDefault());

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
    coordsHost: bar.querySelector('[data-coords-host]') as HTMLElement,
    settingsButton: settingsBtn,
    setSearchFilter: (text: string, category?: string) => {
      searchInput.value = text;
      if (category) filterSelect.value = category;
      runSearch();
      searchInput.focus();
    },
  };
}
