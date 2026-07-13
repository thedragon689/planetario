const RADIUS_KM: Record<string, number> = {
  mercury: 2439,
  venus: 6051,
  earth: 6371,
  mars: 3390,
  jupiter: 69911,
  saturn: 58232,
  uranus: 25362,
  neptune: 24622,
  pluto: 1188,
  sun: 696340,
  luna: 1737,
  'trappist-1e': 5920,
  'proxima-b': 7150,
  'kepler-452b': 8500,
};

function parseRadiusKm(data: Record<string, unknown>): number | null {
  if (data.radiusKm && typeof data.radiusKm === 'number') return data.radiusKm;
  const id = String(data.id || '');
  if (RADIUS_KM[id]) return RADIUS_KM[id];
  const diameter = String(data.diameter || '');
  const match = diameter.match(/([\d.,]+)\s*km/i);
  if (match) return parseFloat(match[1].replace(/\./g, '').replace(',', '.')) / 2;
  return null;
}

export function createSizeCompare(root: HTMLElement) {
  const modal = document.createElement('div');
  modal.className = 'size-compare-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="size-compare-dialog" role="dialog" aria-labelledby="size-compare-title">
      <header>
        <h2 id="size-compare-title">Confronto dimensioni</h2>
        <button type="button" class="size-compare-close" aria-label="Chiudi">×</button>
      </header>
      <div class="size-compare-bars"></div>
      <p class="size-compare-note">Confronto schematico basato sui raggi noti (km).</p>
    </div>
  `;
  root.appendChild(modal);

  const bars = modal.querySelector('.size-compare-bars') as HTMLElement;

  function show(a: Record<string, unknown>, b: Record<string, unknown>) {
    const ra = parseRadiusKm(a);
    const rb = parseRadiusKm(b);
    if (!ra || !rb) {
      bars.innerHTML = '<p>Dati dimensionali insufficienti per il confronto.</p>';
    } else {
      const max = Math.max(ra, rb);
      bars.innerHTML = [a, b]
        .map((obj, i) => {
          const r = i === 0 ? ra : rb;
          const pct = Math.max(8, (r / max) * 100);
          return `
          <div class="size-bar-row">
            <span class="size-bar-label">${obj.name}</span>
            <div class="size-bar-track"><div class="size-bar-fill" style="width:${pct}%"></div></div>
            <span class="size-bar-value">${Math.round(r).toLocaleString('it-IT')} km</span>
          </div>
        `;
        })
        .join('');
    }
    modal.hidden = false;
  }

  modal.querySelector('.size-compare-close')?.addEventListener('click', () => {
    modal.hidden = true;
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.hidden = true;
  });

  return { element: modal, show, hide: () => { modal.hidden = true; } };
}
