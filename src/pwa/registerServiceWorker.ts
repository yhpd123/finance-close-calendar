function getCacheableAssetPaths(): string[] {
  const urls = performance
    .getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((url) => url.startsWith(window.location.origin))
    .map((url) => {
      const parsed = new URL(url);
      return `${parsed.pathname}${parsed.search}`;
    });

  return Array.from(new Set(['/', '/index.html', ...urls]));
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
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      await sendAssetsToServiceWorker(registration);
    } catch (error) {
      console.error('Service worker registration failed', error);
    }
  });
}
