import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildSearchIndex, searchCatalog } from '../src/systems/globalSearch.js';

function loadDatasets() {
  const read = (name: string) => JSON.parse(readFileSync(`./public/data/${name}`, 'utf8'));
  return {
    planets: read('planets.json'),
    moons: read('moons.json'),
    stars: read('stars.json'),
    galaxies: read('galaxies.json'),
    exoplanets: read('exoplanets.json'),
    extreme: read('extreme-objects.json'),
    smallBodies: read('small-bodies.json'),
    sun: read('sun.json'),
  };
}

describe('globalSearch', () => {
  const index = buildSearchIndex(loadDatasets());

  it('builds a non-empty catalog index', () => {
    expect(index.length).toBeGreaterThan(50);
  });

  it('finds planets by partial name', () => {
    const results = searchCatalog(index, 'marte');
    expect(results.some((r) => r.id === 'mars')).toBe(true);
  });

  it('returns category matches without a text query', () => {
    const results = searchCatalog(index, '', { category: 'pianeta' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.category === 'pianeta')).toBe(true);
  });

  it('requires at least two characters when no filter is set', () => {
    expect(searchCatalog(index, 'm')).toHaveLength(0);
    expect(searchCatalog(index, 'ma').length).toBeGreaterThan(0);
  });
});
