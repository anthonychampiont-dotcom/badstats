// BadStats Service Worker - v1.0
// Cache everything for full offline support

const CACHE_NAME = 'badstats-v1';
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap',
  'https://fonts.gstatic.com/s/bebasneuhe/v14/JTUSjIg69CK48gW7PXooxW5rygbi49c.woff2',
];

// Install: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['./', './index.html']).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network, then cache new responses
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // If offline and not cached, return the main app
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
