import type { SearchEntry } from '../systems/globalSearch.js';

export interface ComparePanelOptions {
  onSearch: (query: string) => SearchEntry[];
  onClose?: () => void;
  onSizeCompare?: (a: Record<string, unknown>, b: Record<string, unknown>) => void;
}

export function createComparePanel(root: HTMLElement, options: ComparePanelOptions) {
  const panel = document.createElement('aside');
  panel.className = 'compare-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="compare-header">
      <h2>Confronto oggetti</h2>
      <button type="button" class="compare-close" aria-label="Chiudi confronto">×</button>
    </header>
    <div class="compare-grid">
      <section class="compare-slot" data-slot="a">
        <h3>Oggetto A</h3>
        <div class="compare-body compare-body--empty">Seleziona un oggetto dal pannello info</div>
      </section>
      <section class="compare-slot" data-slot="b">
        <h3>Oggetto B</h3>
        <input type="search" class="compare-search" placeholder="Cerca secondo oggetto…" />
        <div class="compare-results" hidden></div>
        <div class="compare-body compare-body--empty">Cerca un oggetto da confrontare</div>
      </section>
    </div>
    <div class="compare-summary" hidden></div>
  `;
  root.appendChild(panel);

  const slotA = panel.querySelector('[data-slot="a"] .compare-body') as HTMLElement;
  const slotB = panel.querySelector('[data-slot="b"] .compare-body') as HTMLElement;
  const searchInput = panel.querySelector('.compare-search') as HTMLInputElement;
  const resultsEl = panel.querySelector('.compare-results') as HTMLElement;
  const summary = panel.querySelector('.compare-summary') as HTMLElement;

  let objectA: Record<string, unknown> | null = null;
  let objectB: Record<string, unknown> | null = null;

  function renderSlot(el: HTMLElement, data: Record<string, unknown> | null) {
    if (!data) {
      el.className = 'compare-body compare-body--empty';
      el.textContent = 'Nessun oggetto';
      return;
    }
    el.className = 'compare-body';
    const facts = Array.isArray(data.facts) ? data.facts.slice(0, 3) : [];
    el.innerHTML = `
      <h4>${data.name}</h4>
      <p class="compare-type">${data.type || ''}</p>
      <dl class="compare-stats">
        ${data.diameter ? `<div><dt>Diametro</dt><dd>${data.diameter}</dd></div>` : ''}
        ${data.mass ? `<div><dt>Massa</dt><dd>${data.mass}</dd></div>` : ''}
        ${data.distance ? `<div><dt>Distanza</dt><dd>${data.distance}</dd></div>` : ''}
        ${data.temperature ? `<div><dt>Temperatura</dt><dd>${data.temperature}</dd></div>` : ''}
        ${data.constellation ? `<div><dt>Costellazione</dt><dd>${data.constellation}</dd></div>` : ''}
      </dl>
      ${facts.length ? `<ul class="compare-facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>` : ''}
    `;
  }

  function updateSummary() {
    if (!objectA || !objectB) {
      summary.hidden = true;
      return;
    }
    summary.hidden = false;
    summary.innerHTML = `
      <h3>Riepilogo</h3>
      <p><strong>${objectA.name}</strong> vs <strong>${objectB.name}</strong></p>
      <button type="button" class="compare-size-btn">Confronto dimensioni</button>
      <p class="compare-hint">Usa i dati del catalogo per confrontare dimensioni, distanza e caratteristiche fisiche.</p>
    `;
    summary.querySelector('.compare-size-btn')?.addEventListener('click', () => {
      if (objectA && objectB) options.onSizeCompare?.(objectA, objectB);
    });
  }

  panel.querySelector('.compare-close')?.addEventListener('click', () => {
    panel.hidden = true;
    options.onClose?.();
  });

  let debounce = 0;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      const q = searchInput.value.trim();
      if (q.length < 2) {
        resultsEl.hidden = true;
        return;
      }
      const results = options.onSearch(q);
      resultsEl.innerHTML = results
        .map(
          (r, i) => `
        <button type="button" class="compare-result-item" data-i="${i}">
          <span>${r.name}</span>
          <small>${r.type}</small>
        </button>
      `
        )
        .join('');
      resultsEl.hidden = !results.length;
      resultsEl.querySelectorAll('.compare-result-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number((btn as HTMLElement).dataset.i);
          objectB = results[idx].data;
          renderSlot(slotB, objectB);
          updateSummary();
          resultsEl.hidden = true;
          searchInput.value = results[idx].name;
        });
      });
    }, 120);
  });

  return {
    element: panel,
    show(primary: Record<string, unknown>) {
      objectA = primary;
      renderSlot(slotA, objectA);
      panel.hidden = false;
      updateSummary();
    },
    hide() {
      panel.hidden = true;
    },
    isVisible: () => !panel.hidden,
  };
}
