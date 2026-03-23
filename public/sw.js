const CACHE_NAME = 'finance-close-calendar-v1';
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '');
const ROOT_URL = BASE_PATH ? `${BASE_PATH}/` : '/';

function withBase(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}` || normalizedPath;
}

const INDEX_URL = withBase('/index.html');
const OFFLINE_URL = withBase('/offline.html');
const APP_SHELL = [
  ROOT_URL,
  INDEX_URL,
  OFFLINE_URL,
  withBase('/manifest.webmanifest'),
  withBase('/icons/app-icon.svg'),
  withBase('/icons/icon-192.svg'),
  withBase('/icons/icon-512.svg'),
  withBase('/icons/maskable-icon.svg'),
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
          caches.open(CACHE_NAME).then((cache) => cache.put(INDEX_URL, responseClone));
          return response;
        })
        .catch(async () => {
          const cachedApp = await caches.match(INDEX_URL);
          return cachedApp || caches.match(OFFLINE_URL);
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
        .catch(() => caches.match(OFFLINE_URL));
    }),
  );
});
