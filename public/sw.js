const CACHE_NAME = 'finance-close-calendar-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/app-icon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/maskable-icon.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS') {
    return;
  }

  const urls = Array.isArray(event.data.payload) ? event.data.payload : [];
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        urls.map((url) =>
          cache.add(url).catch(() => undefined),
        ),
      ),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone));
          return response;
        })
        .catch(async () => {
          const cachedApp = await caches.match('/index.html');
          return cachedApp || caches.match('/offline.html');
        }),
    );
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }

          return response;
        })
        .catch(() => caches.match('/offline.html'));
    }),
  );
});
