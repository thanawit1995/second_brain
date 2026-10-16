const CACHE_NAME = "secondbrain-cache-v4";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon-32x32.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Never cache live Google Apps Script or live JSON database requests
  if (
    url.hostname.includes("script.google.com") ||
    url.hostname.includes("googleusercontent.com") ||
    url.pathname.endsWith("00_MASTER_DATA.json")
  ) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
    return;
  }

  // Network-first with ignoreSearch fallback so ?pwa=v4 or ?pwa_id=... always resolves offline
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => {
        return caches.match(e.request, { ignoreSearch: true }).then((cached) => {
          if (cached) return cached;
          if (e.request.mode === "navigate") {
            return caches.match("./index.html", { ignoreSearch: true }) || caches.match("./", { ignoreSearch: true });
          }
          return cached;
        });
      })
  );
});
