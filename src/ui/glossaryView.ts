import type { GlossaryEntry } from '../data/glossary.js';
import { searchGlossary } from '../data/glossary.js';

export interface GlossaryViewOptions {
  entries: GlossaryEntry[];
  onTermRead?: (term: string) => void;
}

export function createGlossaryView(root: HTMLElement, options: GlossaryViewOptions) {
  const panel = document.createElement('aside');
  panel.className = 'glossary-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="glossary-header">
      <h2>Glossario astronomico <span class="glossary-count"></span></h2>
      <button type="button" class="glossary-close" aria-label="Chiudi glossario">×</button>
    </header>
    <input type="search" class="glossary-search" placeholder="Cerca tra ${options.entries.length} termini…" />
    <div class="glossary-list" role="list"></div>
  `;
  root.appendChild(panel);

  const list = panel.querySelector('.glossary-list') as HTMLElement;
  const searchInput = panel.querySelector('.glossary-search') as HTMLInputElement;
  const countEl = panel.querySelector('.glossary-count') as HTMLElement;
  countEl.textContent = `(${options.entries.length})`;

  function render(entries = options.entries) {
    const slice = entries.slice(0, 80);
    list.innerHTML = slice
      .map(
        (e) => `
      <article class="glossary-entry" role="listitem" data-term="${e.term}">
        <h3>${e.term}</h3>
        <p>${e.definition}</p>
        ${e.simple ? `<p class="glossary-simple"><em>In parole semplici:</em> ${e.simple}</p>` : ''}
      </article>
    `
      )
      .join('');
    if (entries.length > 80) {
      list.innerHTML += `<p class="glossary-more">…e altri ${entries.length - 80} termini. Affina la ricerca.</p>`;
    }
    list.querySelectorAll('.glossary-entry').forEach((el) => {
      el.addEventListener('click', () => {
        options.onTermRead?.(el.getAttribute('data-term') || '');
      });
    });
  }

  render();

  let debounce = 0;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      render(searchGlossary(options.entries, searchInput.value.trim(), 200));
    }, 100);
  });

  panel.querySelector('.glossary-close')?.addEventListener('click', () => {
    panel.hidden = true;
  });

  return {
    element: panel,
    show() {
      panel.hidden = false;
      searchInput.focus();
    },
    hide() {
      panel.hidden = true;
    },
  };
}
