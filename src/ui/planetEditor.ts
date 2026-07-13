import { customSystemsStore, type CustomPlanet } from '../store/customSystemsStore.js';

export function createPlanetEditor(
  root: HTMLElement,
  options: {
    onPreview: (systemId: string) => void;
    onToast?: (msg: string) => void;
  }
) {
  const panel = document.createElement('aside');
  panel.className = 'planet-editor-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="planet-editor-header">
      <h2>Editor sistema planetario</h2>
      <button type="button" class="planet-editor-close" aria-label="Chiudi editor">×</button>
    </header>
    <form class="planet-editor-form">
      <label>Nome stella <input name="name" type="text" value="Il mio sistema" required /></label>
      <label>Colore stella <input name="starColor" type="color" value="#ffdd88" /></label>
      <label>Raggio stella <input name="starRadius" type="number" min="0.5" max="5" step="0.1" value="2" /></label>
      <div class="planet-editor-planets"></div>
      <button type="button" class="planet-editor-add">+ Aggiungi pianeta</button>
      <div class="planet-editor-actions">
        <button type="submit">Salva sistema</button>
        <button type="button" class="planet-editor-preview">Visualizza nel Sistema Solare</button>
      </div>
    </form>
    <div class="planet-editor-saved">
      <h3>Sistemi salvati</h3>
      <div class="planet-editor-list"></div>
    </div>
  `;
  root.appendChild(panel);

  const form = panel.querySelector('.planet-editor-form') as HTMLFormElement;
  const planetsEl = panel.querySelector('.planet-editor-planets') as HTMLElement;
  const savedList = panel.querySelector('.planet-editor-list') as HTMLElement;

  function addPlanetRow(planet: Partial<CustomPlanet> = {}) {
    const row = document.createElement('div');
    row.className = 'planet-editor-row';
    row.innerHTML = `
      <input name="pname" placeholder="Nome" value="${planet.name || 'Pianeta'}" />
      <input name="pdist" type="number" min="3" max="120" value="${planet.distance || 12}" title="Distanza" />
      <input name="prad" type="number" min="0.1" max="2" step="0.05" value="${planet.radius || 0.3}" title="Raggio" />
      <select name="ptype">
        <option value="rocky" ${planet.type === 'rocky' ? 'selected' : ''}>Roccioso</option>
        <option value="gas" ${planet.type === 'gas' ? 'selected' : ''}>Gassoso</option>
        <option value="ice" ${planet.type === 'ice' ? 'selected' : ''}>Ghiacciato</option>
      </select>
      <button type="button" class="planet-row-remove" aria-label="Rimuovi">×</button>
    `;
    row.querySelector('.planet-row-remove')?.addEventListener('click', () => row.remove());
    planetsEl.appendChild(row);
  }

  function readForm() {
    const fd = new FormData(form);
    const name = String(fd.get('name') || 'Sistema');
    const starColor = parseInt(String(fd.get('starColor') || '#ffdd88').replace('#', ''), 16);
    const starRadius = Number(fd.get('starRadius')) || 2;
    const planets: CustomPlanet[] = [];
    planetsEl.querySelectorAll('.planet-editor-row').forEach((row, i) => {
      const pname = (row.querySelector('[name="pname"]') as HTMLInputElement).value;
      const pdist = Number((row.querySelector('[name="pdist"]') as HTMLInputElement).value);
      const prad = Number((row.querySelector('[name="prad"]') as HTMLInputElement).value);
      const ptype = (row.querySelector('[name="ptype"]') as HTMLSelectElement).value as CustomPlanet['type'];
      planets.push({
        id: `custom-p-${i}-${Date.now()}`,
        name: pname,
        distance: pdist,
        radius: prad,
        type: ptype,
      });
    });
    return { name, starColor, starRadius, planets };
  }

  function renderSaved() {
    const systems = customSystemsStore.getState().systems;
    savedList.innerHTML = systems.length
      ? systems
          .map(
            (s) => `
        <div class="planet-editor-saved-item">
          <span>${s.name} (${s.planets.length} pianeti)</span>
          <button type="button" data-preview="${s.id}">Vedi</button>
          <button type="button" data-delete="${s.id}">Elimina</button>
        </div>
      `
          )
          .join('')
      : '<p class="panel-empty">Nessun sistema salvato.</p>';

    savedList.querySelectorAll('[data-preview]').forEach((btn) => {
      btn.addEventListener('click', () => {
        options.onPreview((btn as HTMLElement).dataset.preview!);
        options.onToast?.('Sistema caricato nella scena');
      });
    });
    savedList.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        customSystemsStore.getState().deleteSystem((btn as HTMLElement).dataset.delete!);
        renderSaved();
      });
    });
  }

  panel.querySelector('.planet-editor-add')?.addEventListener('click', () => addPlanetRow());
  panel.querySelector('.planet-editor-preview')?.addEventListener('click', () => {
    const data = readForm();
    const id = customSystemsStore.getState().saveSystem(data);
    renderSaved();
    options.onPreview(id);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = readForm();
    customSystemsStore.getState().saveSystem(data);
    options.onToast?.('Sistema salvato');
    renderSaved();
  });

  panel.querySelector('.planet-editor-close')?.addEventListener('click', () => {
    panel.hidden = true;
  });

  addPlanetRow({ name: 'Pianeta 1', distance: 12, radius: 0.35, type: 'rocky' });

  return {
    element: panel,
    show() {
      panel.hidden = false;
      renderSaved();
    },
    hide() {
      panel.hidden = true;
    },
  };
}
