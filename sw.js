const CACHE_NAME = 'space-cache-v5';
const ASSETS = [
  '/',
  '/index.html',
  '/apps.html',
  '/app.html',
  '/posts.html',
  '/post.html',
  '/about.html',
  '/contact.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/site.css',
  '/i18n.js',
  '/site.js',
  '/data.js',
  '/page-data.js',
  '/content-pages.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => {})
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
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
        return new Response('Network error occurred', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
