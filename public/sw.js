const CACHE = 'planetario-v4';
const PRECACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon.png',
  '/icons/favicon-64.png',
  '/icons/favicon-128.png',
  '/icons/planetario-192.png',
  '/icons/planetario-512.png',
];
const DEV_PORTS = new Set(['5173', '5174', '5175', '4173']);

function isDevHost() {
  const { hostname, port } = self.location;
  return (hostname === '127.0.0.1' || hostname === 'localhost') && DEV_PORTS.has(port);
}

function shouldBypassCache(url) {
  return (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.includes('/node_modules/.vite/') ||
    url.pathname.includes('/node_modules/vite/') ||
    url.search.includes('?t=') ||
    url.search.includes('?import') ||
    url.search.includes('?v=')
  );
}

self.addEventListener('install', (event) => {
  if (isDevHost()) {
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  if (isDevHost()) {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
    return;
  }

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (isDevHost()) return;

  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (shouldBypassCache(url)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok && request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
