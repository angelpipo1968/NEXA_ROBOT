const CACHE_NAME = 'neuronex-v2-pwa';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './core.js',
  './face-api.min.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones a la API de IA o Hardware (no cachear)
  if (event.request.url.includes('/v1/chat') || event.request.url.includes('/command')) {
      return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
