const CACHE_NAME = 'second-brain-v4.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './00_MASTER_DATA.json',
  './manifest.json?v=4',
  './icon-192.png?v=4',
  './icon-512.png?v=4',
  './apple-touch-icon.png?v=4',
  './favicon.png?v=4',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// Network-First strategy so updates to index.html and icons always appear immediately
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then((networkRes) => {
      if (networkRes && networkRes.status === 200 && event.request.url.startsWith('http')) {
        const resClone = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
      }
      return networkRes;
    }).catch(() => caches.match(event.request))
  );
});
