import { uiStore } from '../store/uiStore.js';

export function createBookmarksView(root: HTMLElement, handlers: {
  onSelect: (id: string) => void;
  onClose?: () => void;
}) {
  const view = document.createElement('aside');
  view.className = 'bookmarks-panel';
  view.setAttribute('aria-label', 'I miei oggetti salvati');
  view.hidden = true;
  view.innerHTML = `
    <div class="bookmarks-header">
      <h2>I miei oggetti</h2>
      <button type="button" class="bookmarks-close" aria-label="Chiudi">×</button>
    </div>
    <div class="bookmarks-actions">
      <button type="button" data-action="export-json">Esporta JSON</button>
      <button type="button" data-action="export-csv">Esporta CSV</button>
      <button type="button" data-action="clear" class="danger">Svuota</button>
    </div>
    <div class="bookmarks-grid"></div>
  `;
  root.appendChild(view);

  const grid = view.querySelector('.bookmarks-grid') as HTMLElement;
  const closeBtn = view.querySelector('.bookmarks-close') as HTMLButtonElement;

  function render() {
    const items = uiStore.getState().bookmarks;
    if (!items.length) {
      grid.innerHTML = '<p class="bookmarks-empty">Nessun oggetto salvato. Usa ♥ nel pannello info.</p>';
      return;
    }
    grid.innerHTML = items
      .map(
        (b) => `
        <button type="button" class="bookmark-card" data-id="${b.id}">
          <span class="bookmark-card-name">${b.name}</span>
          <span class="bookmark-card-type">${b.type || 'Oggetto'}</span>
        </button>
      `
      )
      .join('');
    grid.querySelectorAll('.bookmark-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        handlers.onSelect((btn as HTMLElement).dataset.id || '');
        hide();
      });
    });
  }

  view.querySelector('[data-action="export-json"]')?.addEventListener('click', () => {
    const data = JSON.stringify(uiStore.getState().bookmarks, null, 2);
    downloadText(data, 'planetario-bookmarks.json', 'application/json');
  });

  view.querySelector('[data-action="export-csv"]')?.addEventListener('click', () => {
    const rows = [['id', 'name', 'type', 'scene', 'addedAt']];
    uiStore.getState().bookmarks.forEach((b) => {
      rows.push([b.id, b.name, b.type || '', b.scene || '', b.addedAt]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    downloadText(csv, 'planetario-bookmarks.csv', 'text/csv');
  });

  view.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
    if (confirm('Rimuovere tutti i preferiti?')) {
      uiStore.getState().clearBookmarks();
      render();
    }
  });

  function show() {
    render();
    view.hidden = false;
    view.classList.add('visible');
  }

  function hide() {
    view.hidden = true;
    view.classList.remove('visible');
    handlers.onClose?.();
  }

  closeBtn.addEventListener('click', hide);
  uiStore.subscribe(render);

  return { show, hide, render, element: view };
}

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
