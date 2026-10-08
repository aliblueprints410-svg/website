const CACHE_NAME = 'space-cache-v1';
const ASSETS = [
  'index.html',
  'apps.html',
  'app.html',
  'posts.html',
  'post.html',
  'about.html',
  'contact.html',
  'site.css',
  'i18n.js',
  'site.js',
  'data.js',
  'page-data.js',
  'content-pages.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
