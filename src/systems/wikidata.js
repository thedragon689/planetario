import { WIKIDATA_API } from '../config.js';
import { fetchJson } from '../core/apiClient.js';

/** QID Wikidata per oggetti del catalogo con dati strutturati attendibili. */
export const OBJECT_QIDS = {
  sun: 'Q525',
  mercury: 'Q308',
  venus: 'Q313',
  earth: 'Q2',
  mars: 'Q111',
  jupiter: 'Q319',
  saturn: 'Q193',
  uranus: 'Q324',
  neptune: 'Q332',
  pluto: 'Q339',
  ceres: 'Q596',
  eris: 'Q888',
  haumea: 'Q2265',
  makemake: 'Q831',
  luna: 'Q405',
  europa: 'Q3143',
  io: 'Q3141',
  titan: 'Q2565',
  ganymede: 'Q3169',
  callisto: 'Q3164',
  enceladus: 'Q3303',
  triton: 'Q3359',
  charon: 'Q6798',
  phobos: 'Q7547',
  deimos: 'Q7548',
  miranda: 'Q3352',
  rhea: 'Q6950',
  iapetus: 'Q5686',
  sirius: 'Q7296',
  betelgeuse: 'Q10569',
  proxima_centauri: 'Q71738',
  vega: 'Q8375',
  rigel: 'Q12923',
  polaris: 'Q9307',
  alpha_centauri: 'Q51085',
  arcturus: 'Q10476',
  antares: 'Q41167',
  aldebaran: 'Q12916',
  milky_way: 'Q321',
  andromeda: 'Q2469',
};

const WIKIDATA_UNITS = {
  Q828224: 'km',
  Q11573: 'm',
  Q11570: 'kg',
  Q573: 'day',
  Q577: 'year',
  Q33218: 'earth_mass',
  Q6173: 'jupiter_mass',
  Q68473: 'solar_mass',
};

const FETCH_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'Planetario3D/2.2 (educational; +https://github.com/planetario)',
};

function parseAmount(raw) {
  if (!raw?.amount) return null;
  const value = Number.parseFloat(String(raw.amount).replace('+', ''));
  return Number.isFinite(value) ? value : null;
}

function unitKind(unitUrl = '') {
  const id = unitUrl.split('/').pop();
  return WIKIDATA_UNITS[id] || null;
}

/** @param {number} km */
export function formatDiameterKm(km, { mean = false } = {}) {
  if (!Number.isFinite(km) || km <= 0) return null;
  const rounded = Math.round(km);
  const suffix = mean ? ' (medio)' : '';
  if (Math.abs(km - rounded) < 0.6) {
    return `${rounded.toLocaleString('it-IT')} km${suffix}`;
  }
  const formatted = km.toLocaleString('it-IT', { maximumFractionDigits: 3 });
  return `${formatted} km${suffix}`;
}

/** @param {number} kg */
export function formatMassKg(kg) {
  if (!Number.isFinite(kg) || kg <= 0) return null;
  if (kg >= 1e21) {
    const exp = Math.floor(Math.log10(kg));
    const mantissa = kg / 10 ** exp;
    const mantissaStr = mantissa.toLocaleString('it-IT', { maximumFractionDigits: 2 });
    const superscript = String(exp).replace(/-/g, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
    return `${mantissaStr} × 10${superscript} kg`;
  }
  return `${Math.round(kg).toLocaleString('it-IT')} kg`;
}

/** @param {number} days */
export function formatOrbitalPeriodDays(days) {
  if (!Number.isFinite(days) || days <= 0) return null;
  if (days >= 300) {
    const rounded = Math.round(days * 100) / 100;
    return `${rounded.toLocaleString('it-IT')} giorni`;
  }
  const rounded = Math.round(days * 10) / 10;
  return `${rounded.toLocaleString('it-IT')} giorni`;
}

function quantityToKm(value, unitUrl) {
  const kind = unitKind(unitUrl);
  if (kind === 'km') return value;
  if (kind === 'm') return value / 1000;
  return null;
}

function quantityToKg(value, unitUrl) {
  const kind = unitKind(unitUrl);
  if (kind === 'kg') return value;
  if (kind === 'earth_mass') return value * 5.9722e24;
  if (kind === 'jupiter_mass') return value * 1.898e27;
  if (kind === 'solar_mass') return value * 1.98847e30;
  return null;
}

function quantityToDays(value, unitUrl) {
  const kind = unitKind(unitUrl);
  if (kind === 'day') return value;
  if (kind === 'year') return value * 365.256;
  return null;
}

function firstQuantity(claims, propertyId) {
  const claim = claims?.[propertyId]?.[0]?.mainsnak?.datavalue?.value;
  if (!claim) return null;
  const amount = parseAmount(claim);
  if (amount == null) return null;
  return { amount, unit: claim.unit || '' };
}

/** @param {Record<string, unknown[]>} claims */
export function parseEntityStats(claims) {
  if (!claims) return {};

  const stats = {};
  const diameter = firstQuantity(claims, 'P2386');
  const meanRadius = firstQuantity(claims, 'P2120');
  const mass = firstQuantity(claims, 'P2067');
  const orbitalPeriod = firstQuantity(claims, 'P2146');

  const km = diameter
    ? quantityToKm(diameter.amount, diameter.unit)
    : meanRadius
      ? quantityToKm(meanRadius.amount, meanRadius.unit) * 2
      : null;
  if (km) stats.diameter = formatDiameterKm(km);

  const kg = mass ? quantityToKg(mass.amount, mass.unit) : null;
  if (kg) stats.mass = formatMassKg(kg);

  const days = orbitalPeriod ? quantityToDays(orbitalPeriod.amount, orbitalPeriod.unit) : null;
  if (days) stats.orbitalPeriod = formatOrbitalPeriodDays(days);

  return stats;
}

export function createWikidataClient() {
  const cache = new Map();

  async function getEntity(qid) {
    if (!qid) return null;
    const cacheKey = `entity:${qid}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const promise = fetchJson(`${WIKIDATA_API.entityRoot}/${qid}.json`, {
      ttlMs: 60 * 60 * 1000,
      init: { headers: FETCH_HEADERS },
    }).then((json) => json?.entities?.[qid] || null);

    cache.set(cacheKey, promise);
    return promise;
  }

  async function getStatsForObject(id) {
    const qid = OBJECT_QIDS[id];
    if (!qid) return null;

    const entity = await getEntity(qid);
    if (!entity?.claims) return null;

    const stats = parseEntityStats(entity.claims);
    if (!Object.keys(stats).length) return null;

    return {
      qid,
      stats,
      sourceUrl: `${WIKIDATA_API.pageRoot}/${qid}`,
    };
  }

  function getQidForObject(id) {
    return OBJECT_QIDS[id] || null;
  }

  return {
    getEntity,
    getStatsForObject,
    getQidForObject,
  };
}
