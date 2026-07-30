import { describe, expect, it } from 'vitest';
import {
  formatDiameterKm,
  formatMassKg,
  formatOrbitalPeriodDays,
  parseEntityStats,
} from '../src/systems/wikidata.js';
import { mergeCatalogStats, parseInfoboxStats } from '../src/systems/catalogEnrichment.js';

describe('wikidata formatters', () => {
  it('formatDiameterKm arrotonda il diametro medio terrestre', () => {
    expect(formatDiameterKm(12745.594, { mean: true })).toBe('12.746 km (medio)');
  });

  it('formatMassKg usa notazione scientifica italiana', () => {
    expect(formatMassKg(5.9722e24)).toBe('5,97 × 10²⁴ kg');
  });

  it('formatOrbitalPeriodDays formatta i giorni', () => {
    expect(formatOrbitalPeriodDays(365.256)).toBe('365,26 giorni');
  });

  it('parseEntityStats legge diametro, massa e periodo da claims Wikidata', () => {
    const stats = parseEntityStats({
      P2386: [{ mainsnak: { datavalue: { value: { amount: '+12742', unit: 'http://www.wikidata.org/entity/Q828224' } } } }],
      P2067: [{ mainsnak: { datavalue: { value: { amount: '+5.9722E24', unit: 'http://www.wikidata.org/entity/Q11570' } } } }],
      P2146: [{ mainsnak: { datavalue: { value: { amount: '+365.256363004', unit: 'http://www.wikidata.org/entity/Q573' } } } }],
    });

    expect(stats.diameter).toBe('12.742 km');
    expect(stats.mass).toBe('5,97 × 10²⁴ kg');
    expect(stats.orbitalPeriod).toBe('365,26 giorni');
  });
});

describe('parseInfoboxStats', () => {
  const terraSnippet = `
| diametro_med = {{M|12 745,594|ul=km}}
| massa = {{M|5,9726|e=24|ul=kg}}
| periodo_orbitale = {{Val|365,256366|u=[[giorno|giorni]]}}
`;

  it('estrae diametro medio, massa e periodo da infobox Wikipedia IT', () => {
    const stats = parseInfoboxStats(terraSnippet);
    expect(stats.diameter).toBe('12.746 km (medio)');
    expect(stats.mass).toBe('5,97 × 10²⁴ kg');
    expect(stats.orbitalPeriod).toBe('365,256 giorni');
  });
});

describe('mergeCatalogStats', () => {
  it('prioritizza Wikipedia sul diametro e integra Wikidata sul resto', () => {
    const merged = mergeCatalogStats(
      {
        id: 'earth',
        name: 'Terra',
        diameter: '12.742 km',
        mass: 'catalog mass',
        orbitalPeriod: '365 giorni',
        sources: ['https://science.nasa.gov/earth/facts/'],
      },
      {
        wikiStats: { diameter: '12.746 km (medio)', mass: '5,97 × 10²⁴ kg' },
        wikidataStats: { diameter: '12.742 km', orbitalPeriod: '365,26 giorni' },
        wikiPageUrl: 'https://it.wikipedia.org/wiki/Terra',
        wikidataUrl: 'https://www.wikidata.org/wiki/Q2',
      }
    );

    expect(merged.diameter).toBe('12.746 km (medio)');
    expect(merged.mass).toBe('5,97 × 10²⁴ kg');
    expect(merged.orbitalPeriod).toBe('365,26 giorni');
    expect(merged.sources).toContain('https://it.wikipedia.org/wiki/Terra');
    expect(merged.sources).toContain('https://www.wikidata.org/wiki/Q2');
    expect(merged.statsSource).toBe('wikipedia');
  });
});
