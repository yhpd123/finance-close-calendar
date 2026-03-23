function getBaseUrl() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function getBasePath() {
  const baseUrl = getBaseUrl();
  return baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');
}

function getCacheableAssetPaths(): string[] {
  const baseUrl = getBaseUrl();
  const basePath = getBasePath();
  const urls = performance
    .getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((url) => url.startsWith(window.location.origin))
    .map((url) => {
      const parsed = new URL(url);
      return `${parsed.pathname}${parsed.search}`;
    });

  return Array.from(new Set([baseUrl, `${basePath}/index.html`, ...urls]));
}

async function sendAssetsToServiceWorker(registration: ServiceWorkerRegistration) {
  const payload = getCacheableAssetPaths();
  const worker = registration.active || registration.waiting || registration.installing;

  if (worker) {
    worker.postMessage({ type: 'CACHE_URLS', payload });
  }
}

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(`${getBaseUrl()}sw.js`);
      await navigator.serviceWorker.ready;
      await sendAssetsToServiceWorker(registration);
    } catch (error) {
      console.error('Service worker registration failed', error);
    }
  });
}
