// service-worker.js
const CACHE_NAME = 'card-game-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  // 他にキャッシュしたいファイルを列挙
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
