import * as THREE from 'three';
import { validateCatalog } from './validateCatalog.js';
import { toKtx2Url, loadKTX2Texture } from './ktx2Loader.js';
import { FEATURES } from '../config.js';

const TEXTURE_TIMEOUT_MS = 15000;
let sharedRenderer = null;

export function setTextureRenderer(renderer) {
  sharedRenderer = renderer;
}

const textureLoader = new THREE.TextureLoader();
const cache = new Map();
const blobUrls = new Set();

textureLoader.setCrossOrigin('anonymous');

const NASA_HOST = 'https://images-assets.nasa.gov';

/** Riscrive URL NASA come path same-origin servito dal proxy Vite. */
export function resolveProxiedUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith(NASA_HOST)) {
    return `/nasa-assets${url.slice(NASA_HOST.length)}`;
  }
  return url;
}

function isExternalUrl(url) {
  return /^https?:\/\//i.test(url);
}

/** NASA/CDN non pubblicano varianti .ktx2: evita richieste 403 in console. */
function canTryKtx2Variant(url) {
  if (!url || typeof url !== 'string') return false;
  if (/\.ktx2(\?|$)/i.test(url)) return true;
  if (isExternalUrl(url)) return false;
  return url.startsWith('/');
}

function loadTextureFromBlob(objectUrl, options = {}) {
  return new Promise((resolve, reject) => {
    textureLoader.load(
      objectUrl,
      (tex) => {
        tex.colorSpace = options.colorSpace ?? THREE.SRGBColorSpace;
        if (options.maxSize) {
          const max = Math.max(tex.image.width, tex.image.height);
          if (max > options.maxSize) {
            tex.image = downscaleImage(tex.image, options.maxSize);
            tex.needsUpdate = true;
          }
        }
        if (options.anisotropy) tex.anisotropy = options.anisotropy;
        resolve(tex);
      },
      undefined,
      (err) => reject(err instanceof Error ? err : new Error(`Texture load failed: ${objectUrl}`))
    );
  });
}

function downscaleImage(image, maxSize) {
  const scale = maxSize / Math.max(image.width, image.height);
  if (scale >= 1) return image;

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(image.width * scale);
  canvas.height = Math.floor(image.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function fetchWithTimeout(url, timeoutMs = TEXTURE_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`Timeout caricamento texture: ${url}`, { cause: err });
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function loadTextureViaFetch(url, options = {}) {
  const proxied = resolveProxiedUrl(url);
  const response = await fetchWithTimeout(proxied, options.timeout ?? TEXTURE_TIMEOUT_MS);
  if (!response.ok) throw new Error(`Texture fetch failed: ${proxied} (${response.status})`);

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  blobUrls.add(objectUrl);

  try {
    return await loadTextureFromBlob(objectUrl, options);
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    blobUrls.delete(objectUrl);
    throw err;
  }
}

export function loadTexture(url, options = {}) {
  const key = `tex:${url}`;
  if (cache.has(key)) return cache.get(key);

  const promise = (async () => {
    if (FEATURES.ktx2 && options.tryKtx2 !== false && canTryKtx2Variant(url)) {
      const renderer = options.renderer || sharedRenderer;
      if (renderer) {
        const ktx2Url = /\.ktx2(\?|$)/i.test(url) ? url : toKtx2Url(url);
        const ktx2 = await loadKTX2Texture(renderer, resolveProxiedUrl(ktx2Url));
        if (ktx2) return ktx2;
      }
    }

    if (isExternalUrl(url)) {
      return loadTextureViaFetch(url, options);
    }
    return loadTextureFromBlob(url, options);
  })();

  cache.set(key, promise);
  return promise;
}

export async function loadTextureSafe(url, options = {}) {
  try {
    return await loadTexture(url, options);
  } catch {
    cache.delete(`tex:${url}`);
    if (options.procedural) return createPlanetTexture(options.procedural);
    return createProceduralTexture(options.fallback || 0x1a4a7a);
  }
}

/** Try URLs in order; procedural fallback when all fail. */
export async function loadTextureFirst(urls, options = {}) {
  const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
  for (const url of list) {
    try {
      return await loadTexture(url, options);
    } catch {
      cache.delete(`tex:${url}`);
    }
  }
  if (options.procedural) return createPlanetTexture(options.procedural);
  return createProceduralTexture(options.fallback || 0x1a4a7a);
}

export function createProceduralTexture(color = 0x1a4a7a) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = new THREE.Color(color);
  const r = Math.floor(c.r * 255);
  const g = Math.floor(c.g * 255);
  const b = Math.floor(c.b * 255);

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgb(${r},${g},${b})`);
  grad.addColorStop(0.7, `rgb(${Math.floor(r * 0.6)},${Math.floor(g * 0.8)},${Math.floor(b * 0.5)})`);
  grad.addColorStop(1, `rgb(${Math.floor(r * 0.3)},${Math.floor(g * 0.4)},${Math.floor(b * 0.2)})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function hash(x, y, seed) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

export function createCloudTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      let n = 0;
      let amp = 1;
      let freq = 3;
      for (let o = 0; o < 5; o++) {
        n += hash(u * freq, v * freq, o + 10) * amp;
        amp *= 0.5;
        freq *= 2.1;
      }
      const alpha = Math.max(0, (n - 0.55) * 1.8);
      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = Math.min(255, alpha * alpha * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function worley(u, v, seed, cells = 4) {
  let minDist = 1;
  for (let cy = -1; cy <= 1; cy++) {
    for (let cx = -1; cx <= 1; cx++) {
      const cellX = Math.floor(u * cells + cx) + seed * 0.1;
      const cellY = Math.floor(v * cells + cy) + seed * 0.13;
      const px = (cellX + hash(cellX, cellY, seed + 3)) / cells;
      const py = (cellY + hash(cellY, cellX, seed + 7)) / cells;
      const dx = u - px;
      const dy = v - py;
      minDist = Math.min(minDist, Math.sqrt(dx * dx + dy * dy));
    }
  }
  return minDist;
}

export function createPlanetTexture({ color = 0x888888, seed = 0, type = 'rocky', craters = false } = {}) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const base = new THREE.Color(color);
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      let n = 0;
      let amp = 1;
      let freq = 4;

      for (let o = 0; o < 4; o++) {
        n += hash(u * freq, v * freq, seed + o) * amp;
        amp *= 0.5;
        freq *= 2;
      }

      let shade;
      const worleyN = worley(u, v, seed + 50, 5);
      if (type === 'gas') {
        const bands = Math.sin(v * Math.PI * 8 + n * 2) * 0.5 + 0.5;
        shade = 0.55 + bands * 0.35 + n * 0.1;
      } else if (type === 'ice') {
        shade = 0.7 + n * 0.25 + worleyN * 0.08;
      } else {
        shade = 0.45 + n * 0.5;
        if (craters || type === 'rocky') {
          const crater = worleyN < 0.08 ? 0.75 : worleyN < 0.14 ? 0.9 : 1;
          shade *= crater;
        }
      }

      const i = (y * size + x) * 4;
      data[i] = Math.min(255, base.r * 255 * shade);
      data[i + 1] = Math.min(255, base.g * 255 * shade);
      data[i + 2] = Math.min(255, base.b * 255 * shade);
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function loadJSON(url) {
  const key = `json:${url}`;
  if (cache.has(key)) return cache.get(key);

  const promise = fetchWithTimeout(url, 12000).then(async (r) => {
    if (!r.ok) throw new Error(`Failed to load ${url} (${r.status})`);
    const type = r.headers.get('content-type') || '';
    if (!type.includes('json')) {
      throw new Error(
        `${url} returned ${type || 'non-JSON'} — is the Planetario dev server running on the correct port?`
      );
    }
    const data = await r.json();
    return validateCatalog(url, data);
  });
  cache.set(key, promise);
  return promise;
}
