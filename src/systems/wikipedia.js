import { WIKIPEDIA_API, SCENES } from '../config.js';
import { fetchJson } from '../core/apiClient.js';

/** Titoli articolo Wikipedia in italiano per oggetti del catalogo. */
const OBJECT_TITLES = {
  earth: 'Terra',
  mercury: 'Mercurio (astronomia)',
  venus: 'Venere (astronomia)',
  mars: 'Marte (astronomia)',
  jupiter: 'Giove (astronomia)',
  saturn: 'Saturno (astronomia)',
  uranus: 'Urano (astronomia)',
  neptune: 'Nettuno (astronomia)',
  pluto: 'Plutone (astronomia)',
  ceres: '1 Cerere',
  eris: 'Eris (astronomia)',
  haumea: 'Haumea',
  makemake: 'Makemake',

  luna: 'Luna',
  europa: 'Europa (satellite)',
  io: 'Io (satellite)',
  titan: 'Titano (satellite)',
  ganymede: 'Ganimede (astronomia)',
  callisto: 'Callisto (satellite)',
  enceladus: 'Encelado (astronomia)',
  charon: 'Caronte (astronomia)',
  triton: 'Tritone (astronomia)',
  phobos: 'Fobos (astronomia)',
  deimos: 'Deimos (astronomia)',
  miranda: 'Miranda (satellite)',
  rhea: 'Rea (satellite)',
  iapetus: 'Iapeto (satellite)',

  sun: 'Sole',
  sirius: 'Sirio',
  betelgeuse: 'Betelgeuse',
  proxima_centauri: 'Proxima Centauri',
  vega: 'Vega',
  rigel: 'Rigel',
  polaris: 'Stella Polare',
  alpha_centauri: 'Alfa Centauri',
  arcturus: 'Arcturus',
  antares: 'Antares',
  aldebaran: 'Aldebaran',

  milky_way: 'Via Lattea',
  andromeda: 'Galassia di Andromeda',
  triangulum: 'Galassia del Triangolo',
  large_magellanic_cloud: 'Grande Nube di Magellano',
  small_magellanic_cloud: 'Piccola Nube di Magellano',
  sombrero: 'Galassia del Sombrero',
  whirlpool: 'Galassia del Vortice',
  pinwheel: 'Galassia del Girandola',
  centaurus_a: 'Centaurus A',
  bodes_m81: 'Galassia di Bode',
  cigar_m82: 'M82',
  southern_pinwheel: 'Messier 83',
  sunflower: 'Messier 63',
  cartwheel: 'Galassia Ruota',
  antennae: 'Galassie delle Antenne',
  hoags_object: 'Oggetto di Hoag',
  ic_1101: 'IC 1101',
  tadpole: 'Galassia del Girino',
  stephans_quintet: 'Quintetto di Stephan',
  black_eye: 'Galassia dell\'Occhio Nero',
  ngc_1300: 'NGC 1300',
  ngc_253: 'NGC 253',
  ngc_300: 'NGC 300',
  ngc_6744: 'NGC 6744',
  ngc_2403: 'NGC 2403',
  ngc_1316: 'NGC 1316',
  ngc_1365: 'NGC 1365',
  ngc_1399: 'NGC 1399',
  ngc_1404: 'NGC 1404',
  ngc_1427a: 'NGC 1427A',
  ngc_1350: 'NGC 1350',
  ngc_1326: 'NGC 1326',
  ic_335: 'IC 335',
  eyes_galaxies: 'Galassie degli Occhi',
  ngc_4565: 'Galassia Ago',
  ngc_4258: 'M106',
  wlm: 'Galassia del Grande Gruppo',
  fornax_dwarf: 'Galassia nana di Fornax',
  sculptor_dwarf: 'Galassia nana di Scultore',
  sagittarius_dwarf: 'Galassia nana del Sagittario',
  leo_a: 'Leo A',
  leo_i: 'Leo I',
  ngc_6822: 'NGC 6822',
  ic_10: 'IC 10',
  ic_1613: 'IC 1613',
  ngc_185: 'NGC 185',
  ngc_147: 'NGC 147',
  m110: 'M110',
  ngc_3109: 'NGC 3109',

  m87: 'M87',
  m86: 'M86',
  m49: 'M49',
  m84: 'M84',
  m88: 'M88',
  m89: 'M89',
  m90: 'M90',
  m100: 'M100',
  m98: 'M98',
  m99: 'M99',
  m61: 'M61',
  m58: 'M58',
  m59: 'M59',
  m60: 'M60',
  ngc_4526: 'NGC 4526',
  ngc_4636: 'NGC 4636',
  ngc_4643: 'NGC 4643',
  ngc_4477: 'NGC 4477',

  nebula_violet: 'Nebulosa',
  nebula_cyan: 'Nebulosa',
  nebula_magenta: 'Nebulosa',
  wormhole: 'Wormhole',
};

/** Titoli per le sezioni / scale cosmiche della navigazione. */
const SCENE_TITLES = {
  [SCENES.EARTH]: 'Terra',
  [SCENES.SOLAR_SYSTEM]: 'Sistema solare',
  [SCENES.MILKY_WAY]: 'Via Lattea',
  [SCENES.EXOPLANETS]: 'Esopianeti',
  [SCENES.EXTREME]: 'Oggetti estremi',
  [SCENES.LOCAL_GROUP]: 'Gruppo Locale',
  [SCENES.OBSERVABLE]: 'Universo osservabile',
  [SCENES.WORMHOLE]: 'Wormhole',
};

/** Titoli per gli ammassi galattici. */
const CLUSTER_TITLES = {
  virgo: 'Ammasso della Vergine',
  fornax: 'Ammasso di Fornax',
  local_group: 'Gruppo Locale',
};

function encodeTitle(title) {
  return encodeURIComponent(title.replace(/ /g, '_'));
}

function parseSummary(json) {
  if (!json || json.type === 'disambiguation' || json.type === 'https') return null;

  const pageUrl =
    json.content_urls?.desktop?.page ||
    json.content_urls?.mobile?.page ||
    `https://${WIKIPEDIA_API.lang}.wikipedia.org/wiki/${encodeTitle(json.title || '')}`;

  return {
    title: json.title || '',
    description: json.description || '',
    extract: json.extract || '',
    thumbnail: json.thumbnail?.source || null,
    pageUrl,
  };
}

function extractCatalogTitle(catalog) {
  if (!catalog) return null;
  const m = catalog.match(/M\s*(\d+)/i);
  if (m) return `M${m[1]}`;
  const ngc = catalog.match(/NGC\s*(\d+)/i);
  if (ngc) return `NGC ${ngc[1]}`;
  const ic = catalog.match(/IC\s*(\d+)/i);
  if (ic) return `IC ${ic[1]}`;
  return null;
}

function buildSearchQueries(id, name, { catalog, type } = {}) {
  const queries = [];
  if (OBJECT_TITLES[id]) queries.push(OBJECT_TITLES[id]);
  const fromCatalog = extractCatalogTitle(catalog);
  if (fromCatalog) queries.push(fromCatalog);
  if (name) {
    queries.push(name);
    if (type?.toLowerCase().includes('galassia') && !name.toLowerCase().includes('galassia')) {
      queries.push(`Galassia ${name.replace(/\s*\(.*\)/, '')}`);
    }
  }
  if (id && !queries.length) queries.push(id.replace(/_/g, ' '));
  return [...new Set(queries.filter(Boolean))];
}

export function createWikipediaClient() {
  const cache = new Map();

  async function searchTitle(query) {
    const url = new URL(WIKIPEDIA_API.apiRoot);
    url.searchParams.set('action', 'opensearch');
    url.searchParams.set('search', query);
    url.searchParams.set('limit', '1');
    url.searchParams.set('namespace', '0');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');

    const response = await fetchJson(url.toString(), { ttlMs: 10 * 60 * 1000 });
    return response[1]?.[0] || null;
  }

  async function getSummary(title) {
    if (!title) return null;

    const cacheKey = `summary:${title}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const promise = (async () => {
      const url = `${WIKIPEDIA_API.restRoot}/page/summary/${encodeTitle(title)}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });

      if (response.status === 404) {
        const found = await searchTitle(title);
        if (found && found !== title) return getSummary(found);
        return null;
      }

      if (!response.ok) throw new Error(`Wikipedia summary ${response.status}`);
      return parseSummary(await response.json());
    })();

    cache.set(cacheKey, promise);
    return promise;
  }

  async function resolveSummary(queries) {
    for (const query of queries) {
      const summary = await getSummary(query);
      if (summary?.extract) return summary;
    }

    for (const query of queries) {
      const found = await searchTitle(query);
      if (!found) continue;
      const summary = await getSummary(found);
      if (summary?.extract) return summary;
    }

    return null;
  }

  async function getSummaryForObject(id, name, meta = {}) {
    const queries = buildSearchQueries(id, name, meta);
    return resolveSummary(queries);
  }

  async function getSummaryForScene(sceneKey) {
    const title = SCENE_TITLES[sceneKey];
    if (!title) return null;
    return getSummary(title);
  }

  async function getSummaryForCluster(clusterId) {
    const title = CLUSTER_TITLES[clusterId];
    if (!title) return null;
    return getSummary(title);
  }

  function getArticleUrl(title) {
    return `https://${WIKIPEDIA_API.lang}.wikipedia.org/wiki/${encodeTitle(title)}`;
  }

  function getTitleForObject(id) {
    return OBJECT_TITLES[id] || null;
  }

  return {
    getSummary,
    getSummaryForObject,
    getSummaryForScene,
    getSummaryForCluster,
    getArticleUrl,
    getTitleForObject,
    searchTitle,
  };
}
