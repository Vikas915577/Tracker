/* Winter Arc Tracker V25.4.1 — safe cache refresh and offline fallback. */
const CACHE = 'winter-arc-v25.4.1';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './v25-overrides.css',
  './app.js',
  './manifest.json',
  './cloud-config.js',
  './icon-192.png',
  './icon-512.png',
  './creator-profile.jpg',
  './creator-photo-1.jpg',
  './creator-photo-2.jpg',
  './creator-photo-3.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(CORE.map(path => cache.add(path)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('winter-arc-') && key !== CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = request.mode === 'navigate'
        ? await fetch(request, { cache: 'no-store' })
        : await fetch(request);

      if (response && response.ok) {
        const cache = await caches.open(CACHE);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (_error) {
      const cached = await caches.match(request);
      if (cached) return cached;

      if (request.mode === 'navigate') {
        const page = await caches.match('./index.html');
        if (page) return page;
      }

      return new Response('Offline: this resource is not available in the current cache.', {
        status: 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      });
    }
  })());
});
