import { describe, expect, it } from 'vitest';
import { validateCatalog } from '../src/core/validateCatalog.js';

describe('validateCatalog', () => {
  it('preserva center nei cluster galattici', () => {
    const data = {
      galaxies: [{ id: 'andromeda', name: 'Andromeda' }],
      catalog: {
        clusters: {
          local_group: {
            label: 'Gruppo Locale',
            center: [0, 0, 0],
            radius: 840,
          },
        },
      },
    };

    const result = validateCatalog('/data/galaxies.json', data) as typeof data;
    expect(result.catalog?.clusters?.local_group?.center).toEqual([0, 0, 0]);
  });

  it('restituisce dati grezzi se la validazione fallisce', () => {
    const data = { galaxies: [{ name: 'Senza id' }] };
    const result = validateCatalog('/data/planets.json', data);
    expect(result).toBe(data);
  });
});
