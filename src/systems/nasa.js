import { NASA_API } from '../config.js';
import { fetchJson } from '../core/apiClient.js';

const OBJECT_QUERIES = {
  mercury: 'Mercury planet NASA',
  venus: 'Venus planet',
  earth: 'Earth planet blue marble',
  mars: 'Mars planet surface',
  jupiter: 'Jupiter planet',
  saturn: 'Saturn planet rings',
  uranus: 'Uranus planet',
  neptune: 'Neptune planet',
  pluto: 'Pluto New Horizons planet',
  ceres: 'Ceres dwarf planet Dawn',
  luna: 'Moon full disk NASA',
  europa: 'Europa moon Jupiter ice',
  titan: 'Titan moon Saturn',
  sun: 'Sun solar NASA',
  sirius: 'Sirius star',
  betelgeuse: 'Betelgeuse Orion',
  proxima_centauri: 'Proxima Centauri',
  milky_way: 'Milky Way galaxy',
  andromeda: 'Andromeda galaxy M31',
};

const TEXTURE_QUERIES = {
  mercury: 'Mercury planet full disk',
  venus: 'Venus planet cloud cover',
  mars: 'Mars planet Hubble global',
  jupiter: 'Jupiter planet global storm',
  saturn: 'Saturn planet rings global',
  uranus: 'Uranus planet Voyager blue',
  neptune: 'Neptune planet Voyager blue',
  pluto: 'Pluto New Horizons global',
  ceres: 'Ceres dwarf planet surface',
  luna: 'Moon full disk',
  europa: 'Europa moon surface cracks',
  titan: 'Titan moon orange atmosphere',
};

function pickImageUrl(links = [], { preferTexture = false } = {}) {
  const order = preferTexture
    ? ['~medium.jpg', '~large.jpg', '~small.jpg', '~thumb.jpg', '~orig.jpg']
    : ['~orig.jpg', '~large.jpg', '~medium.jpg', '~small.jpg', '~thumb.jpg'];

  for (const suffix of order) {
    const link = links.find((l) => l.render === 'image' && l.href?.includes(suffix));
    if (link) return link.href;
  }
  return links.find((l) => l.render === 'image')?.href || null;
}

/** Preferisce risoluzioni gestibili da WebGL (~2048px). */
export function normalizeTextureUrl(url) {
  if (!url) return url;
  return url
    .replace('~orig.jpg', '~medium.jpg')
    .replace('~orig.png', '~medium.png')
    .replace('~large.jpg', '~medium.jpg');
}

function parseVideoItem(item) {
  const meta = item.data?.[0];
  if (!meta || meta.media_type !== 'video') return null;

  const videoLink = item.links?.find((l) => l.render === 'video' || /\.mp4/i.test(l.href || ''));
  const preview = item.links?.find((l) => l.render === 'image')?.href;
  if (!videoLink?.href) return null;

  return {
    nasa_id: meta.nasa_id,
    title: meta.title || 'NASA Video',
    description: meta.description || '',
    videoUrl: videoLink.href,
    previewUrl: preview,
    detailUrl: `https://images.nasa.gov/details-${meta.nasa_id}.html`,
  };
}

function parseSearchItem(item) {
  const meta = item.data?.[0];
  if (!meta || meta.media_type !== 'image') return null;

  const imageUrl = pickImageUrl(item.links, { preferTexture: false });
  if (!imageUrl) return null;

  return {
    nasa_id: meta.nasa_id,
    title: meta.title || 'NASA Image',
    description: meta.description || '',
    date_created: meta.date_created,
    center: meta.center,
    photographer: meta.photographer,
    secondary_creator: meta.secondary_creator,
    keywords: meta.keywords || [],
    imageUrl,
    detailUrl: `https://images.nasa.gov/details-${meta.nasa_id}.html`,
  };
}

export function createNasaClient() {
  const cache = new Map();

  async function request(path, params = {}) {
    const url = new URL(`${NASA_API.root}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') url.searchParams.set(key, String(value));
    });

    return fetchJson(url.toString(), { ttlMs: 5 * 60 * 1000 });
  }

  async function search(params = {}) {
    const cacheKey = JSON.stringify(params);
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const promise = request('/search', params).then((json) => {
      const isVideo = params.media_type === 'video';
      const items = (json.collection?.items || [])
        .map(isVideo ? parseVideoItem : parseSearchItem)
        .filter(Boolean);

      return {
        total: json.collection?.metadata?.total_hits ?? items.length,
        items,
        href: json.collection?.href,
      };
    });

    cache.set(cacheKey, promise);
    return promise;
  }

  async function getAsset(nasaId) {
    const cacheKey = `asset:${nasaId}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const promise = request(`/asset/${nasaId}`).then((json) => ({
      nasa_id: nasaId,
      files: (json.collection?.items || []).map((item) => item.href).filter(Boolean),
    }));

    cache.set(cacheKey, promise);
    return promise;
  }

  async function getMetadata(nasaId) {
    const cacheKey = `meta:${nasaId}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const promise = request(`/metadata/${nasaId}`);
    cache.set(cacheKey, promise);
    return promise;
  }

  async function searchForObject(id, name, pageSize = NASA_API.pageSize) {
    const query = OBJECT_QUERIES[id] || name || id;
    const [images, videos] = await Promise.all([
      search({ q: query, media_type: 'image', page_size: pageSize }),
      search({ q: query, media_type: 'video', page_size: 2 }).catch(() => ({ items: [], total: 0 })),
    ]);

    return { ...images, videoItems: videos.items || [] };
  }

  function getSearchUrl(query) {
    return `https://images.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;
  }

  async function fetchPlanetTextureUrl(id) {
    const cacheKey = `texurl:${id}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const query = TEXTURE_QUERIES[id] || OBJECT_QUERIES[id] || id;
    const promise = search({ q: query, media_type: 'image', page_size: 8 }).then((result) => {
      const scored = result.items
        .map((item) => {
          let score = 0;
          const title = (item.title || '').toLowerCase();
          const keywords = (item.keywords || []).join(' ').toLowerCase();
          const blob = `${title} ${keywords} ${item.description || ''}`.toLowerCase();

          if (blob.includes('planet') || blob.includes('moon') || blob.includes('dwarf')) score += 3;
          if (blob.includes('global') || blob.includes('full') || blob.includes('disk')) score += 2;
          if (blob.includes('surface') || blob.includes('hemisphere')) score += 1;
          if (item.imageUrl?.includes('~medium')) score += 4;
          if (item.imageUrl?.includes('~large')) score += 2;
          if (item.imageUrl?.includes('~orig')) score -= 2;
          if (blob.includes('artist') || blob.includes('concept') || blob.includes('illustration')) score -= 4;

          return { item, score };
        })
        .sort((a, b) => b.score - a.score);

      const url = scored[0]?.item?.imageUrl || result.items[0]?.imageUrl || null;
      return normalizeTextureUrl(url);
    });

    cache.set(cacheKey, promise);
    return promise;
  }

  return {
    search,
    getAsset,
    getMetadata,
    searchForObject,
    fetchPlanetTextureUrl,
    getSearchUrl,
    getQueryForObject: (id, name) => OBJECT_QUERIES[id] || name || id,
  };
}
