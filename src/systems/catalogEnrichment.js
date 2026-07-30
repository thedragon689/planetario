import { formatDiameterKm, formatMassKg } from './wikidata.js';

/**
 * Converte valori infobox {{M|...}} o {{Val|...}} in numeri.
 * @param {string} raw
 */
export function parseWikiQuantity(raw) {
  const cleaned = String(raw || '')
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\s/g, '')
    .replace(',', '.');
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * Estrae statistiche dall'infobox Wikipedia (wikitext).
 * @param {string} wikitext
 */
export function parseInfoboxStats(wikitext) {
  if (!wikitext) return {};

  const stats = {};
  const readM = (key) => {
    const match = wikitext.match(new RegExp(`${key}\\s*=\\s*\\{\\{M\\|([^\\n|]+)(?:\\|e=(\\d+))?(?:[^\\n|]*\\|ul=([^}|]+))?`, 'i'));
    if (!match) return null;
    const value = parseWikiQuantity(match[1]);
    if (value == null) return null;
    return {
      value,
      exponent: match[2] ? Number.parseInt(match[2], 10) : 0,
      unit: (match[3] || '').trim().toLowerCase(),
    };
  };

  const readVal = (key) => {
    const match = wikitext.match(new RegExp(`${key}\\s*=\\s*\\{\\{Val\\|([^|]+)\\|u=\\[\\[[^\\]|]+\\|([^\\]]+)\\]\\]`, 'i'));
    if (!match) return null;
    const value = parseWikiQuantity(match[1]);
    if (value == null) return null;
    return { value, unit: match[2].trim().toLowerCase() };
  };

  const meanDiameter = readM('diametro_med');
  if (meanDiameter?.unit.includes('km')) {
    stats.diameter = formatDiameterKm(meanDiameter.value, { mean: true });
  } else {
    const eqDiameter = readM('diametro_eq');
    if (eqDiameter?.unit.includes('km')) {
      stats.diameter = formatDiameterKm(eqDiameter.value);
    }
  }

  const mass = readM('massa');
  if (mass?.unit.includes('kg') && mass.value > 0) {
    const kg = mass.value * 10 ** mass.exponent;
    stats.mass = formatMassKg(kg);
  }

  const period = readVal('periodo_orbitale') || readVal('periodo_orbitale_siderale');
  if (period?.unit.includes('giorn')) {
    stats.orbitalPeriod = `${period.value.toLocaleString('it-IT')} giorni`;
  } else if (period?.unit.includes('ann')) {
    const days = period.value * 365.256;
    stats.orbitalPeriod = `${Math.round(days * 100) / 100}`.replace('.', ',') + ' giorni';
  }

  return stats;
}

/**
 * Unisce dati catalogo con statistiche Wikidata / Wikipedia infobox.
 * Wikipedia infobox ha priorità sul diametro medio; Wikidata integra gli altri campi.
 */
export function mergeCatalogStats(catalogData, { wikiStats, wikidataStats, wikiPageUrl, wikidataUrl } = {}) {
  if (!catalogData) return catalogData;

  const merged = { ...catalogData };
  const sources = [...(catalogData.sources || [])];

  if (wikiStats?.diameter) merged.diameter = wikiStats.diameter;
  else if (wikidataStats?.diameter) merged.diameter = wikidataStats.diameter;

  if (wikiStats?.mass) merged.mass = wikiStats.mass;
  else if (wikidataStats?.mass) merged.mass = wikidataStats.mass;

  if (wikiStats?.orbitalPeriod) merged.orbitalPeriod = wikiStats.orbitalPeriod;
  else if (wikidataStats?.orbitalPeriod) merged.orbitalPeriod = wikidataStats.orbitalPeriod;

  if (wikiPageUrl && !sources.includes(wikiPageUrl)) sources.unshift(wikiPageUrl);
  if (wikidataUrl && !sources.includes(wikidataUrl)) sources.push(wikidataUrl);

  merged.sources = sources;
  merged.statsSource = wikiStats?.diameter ? 'wikipedia' : wikidataStats?.diameter ? 'wikidata' : 'catalog';
  return merged;
}

export async function enrichObjectData(catalogData, { wikipedia, wikidata } = {}) {
  if (!catalogData?.id) return catalogData;

  const [wikiInfobox, wikidataResult] = await Promise.all([
    wikipedia?.getInfoboxStatsForObject?.(
      catalogData.id,
      catalogData.name,
      { catalog: catalogData.catalog, type: catalogData.type || catalogData.category }
    ) ?? null,
    wikidata?.getStatsForObject?.(catalogData.id) ?? null,
  ]);

  return mergeCatalogStats(catalogData, {
    wikiStats: wikiInfobox?.stats || null,
    wikidataStats: wikidataResult?.stats || null,
    wikiPageUrl: wikiInfobox?.pageUrl || null,
    wikidataUrl: wikidataResult?.sourceUrl || null,
  });
}
