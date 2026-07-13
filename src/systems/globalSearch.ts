import { SCENES } from '../config.js';
import { NEBULA_DATA } from '../data/phenomena.js';

export interface SearchEntry {
  id: string;
  name: string;
  type: string;
  category: string;
  scene?: string;
  keywords: string[];
  data: Record<string, unknown>;
}

function tokenize(text: string) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^a-z0-9àèéìòù]+/i)
    .filter((w) => w.length > 1);
}

function add(entries: SearchEntry[], item: Record<string, unknown>, meta: Partial<SearchEntry>) {
  if (!item?.id || !item?.name) return;
  const keywords = [
    ...tokenize(String(item.name)),
    ...tokenize(String(item.type || '')),
    ...tokenize(String(item.category || '')),
    ...tokenize(String(meta.category || '')),
    ...(Array.isArray(item.facts) ? item.facts.flatMap((f) => tokenize(String(f))) : []),
  ];
  entries.push({
    id: String(item.id),
    name: String(item.name),
    type: String(item.type || meta.type || 'Oggetto'),
    category: meta.category || 'oggetto',
    scene: meta.scene,
    keywords: [...new Set(keywords)],
    data: item,
  });
}

export function buildSearchIndex(datasets: Record<string, unknown>): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const {
    planets,
    moons,
    stars,
    galaxies,
    exoplanets,
    extreme,
    smallBodies,
    sun,
  } = datasets as Record<string, any>;

  (planets?.planets || []).forEach((p: Record<string, unknown>) =>
    add(entries, p, { category: 'pianeta', scene: SCENES.SOLAR_SYSTEM })
  );
  (moons?.moons || []).forEach((m: Record<string, unknown>) =>
    add(entries, m, { category: 'luna', scene: SCENES.SOLAR_SYSTEM })
  );
  if (sun) add(entries, { ...sun, id: 'sun', name: 'Sole' }, { category: 'stella', scene: SCENES.SOLAR_SYSTEM });
  (stars?.stars || []).forEach((s: Record<string, unknown>) =>
    add(entries, s, { category: 'stella', scene: SCENES.MILKY_WAY })
  );
  (galaxies?.galaxies || []).forEach((g: Record<string, unknown>) =>
    add(entries, g, { category: 'galassia', scene: SCENES.LOCAL_GROUP })
  );
  (exoplanets?.systems || []).forEach((system: Record<string, any>) => {
    (system.planets || []).forEach((p: Record<string, unknown>) =>
      add(entries, { ...p, constellation: system.constellation }, {
        category: 'esopianeta',
        scene: SCENES.EXOPLANETS,
      })
    );
  });
  (extreme?.objects || []).forEach((o: Record<string, unknown>) =>
    add(entries, o, { category: 'oggetto estremo', scene: SCENES.EXTREME })
  );
  (smallBodies?.asteroids || []).forEach((a: Record<string, unknown>) =>
    add(entries, a, { category: 'asteroide', scene: SCENES.SOLAR_SYSTEM })
  );
  (smallBodies?.comets || []).forEach((c: Record<string, unknown>) =>
    add(entries, c, { category: 'cometa', scene: SCENES.SOLAR_SYSTEM })
  );
  (smallBodies?.kuiper || []).forEach((k: Record<string, unknown>) =>
    add(entries, k, { category: 'kuiper', scene: SCENES.SOLAR_SYSTEM })
  );
  if (smallBodies?.oort) {
    add(entries, smallBodies.oort, { category: 'regione', scene: SCENES.SOLAR_SYSTEM });
  }
  NEBULA_DATA.forEach((n) => add(entries, n, { category: 'nebulosa', scene: SCENES.MILKY_WAY }));

  return entries;
}

export type SearchFilters = {
  category?: string;
  scene?: string;
};

export function searchCatalog(
  index: SearchEntry[],
  query: string,
  filters: SearchFilters = {},
  limit = 12
): SearchEntry[] {
  const tokens = tokenize(query);
  if (!tokens.length && !filters.category && !filters.scene) return [];

  const scores = index.map((entry) => {
    let score = 0;
    const name = entry.name.toLowerCase();
    tokens.forEach((t) => {
      if (name === t) score += 20;
      else if (name.startsWith(t)) score += 12;
      else if (name.includes(t)) score += 8;
      else if (entry.keywords.some((k) => k.includes(t) || t.includes(k))) score += 3;
    });
    if (filters.category && entry.category === filters.category) score += 5;
    if (filters.scene && entry.scene === filters.scene) score += 4;
    if (!tokens.length && filters.category && entry.category === filters.category) score = 1;
    return { entry, score };
  });

  return scores
    .filter(({ score, entry }) => score > 0 || (filters.category && entry.category === filters.category))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}
