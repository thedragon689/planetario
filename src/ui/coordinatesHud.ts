import { mockEquatorialCoords } from '../utils/science.js';

export type CoordSystem = 'equatorial' | 'ecliptic' | 'galactic' | 'altaz';

export function createCoordinatesHud(root: HTMLElement) {
  const hud = document.createElement('div');
  hud.className = 'coords-hud';
  hud.hidden = true;
  hud.innerHTML = `
    <select class="coords-system" aria-label="Sistema coordinate">
      <option value="equatorial">Equatoriali RA/Dec</option>
      <option value="ecliptic">Eclittiche λ/β</option>
      <option value="galactic">Galattiche l/b</option>
      <option value="altaz">Alt-Az</option>
    </select>
    <span class="coords-values">—</span>
  `;
  root.appendChild(hud);

  const system = hud.querySelector('.coords-system') as HTMLSelectElement;
  const values = hud.querySelector('.coords-values') as HTMLElement;
  let objectId = '';

  function format(sys: CoordSystem, id: string) {
    const eq = mockEquatorialCoords(id || 'default');
    if (sys === 'equatorial') return `RA ${eq.ra} · Dec ${eq.dec}`;
    if (sys === 'ecliptic') return `λ ${eq.ra.replace('h', '°')} · β ${eq.dec}`;
    if (sys === 'galactic') return `l ${eq.ra} · b ${eq.dec}`;
    return `Alt ${(Math.abs(id.length * 7) % 90).toFixed(0)}° · Az ${(id.length * 13 % 360).toFixed(0)}°`;
  }

  function update() {
    values.textContent = objectId ? format(system.value as CoordSystem, objectId) : 'Seleziona un oggetto';
  }

  system.addEventListener('change', update);

  return {
    element: hud,
    setObject(id: string, _name?: string) {
      objectId = id;
      update();
    },
    setVisible(v: boolean) { hud.hidden = !v; },
    update,
  };
}
