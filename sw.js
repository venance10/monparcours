const BUILD_VERSION = "2026-07-10-sw-v21";
const CACHE_PREFIX = "venanceportfolio";
const CACHE = `${CACHE_PREFIX}-${BUILD_VERSION}`;
const ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./manifest.json",
  "./data.json",
  "./assets/css/variables.css",
  "./assets/css/base.css",
  "./assets/css/components.css",
  "./assets/css/layout.css",
  "./assets/css/sections.css",
  "./assets/css/gallery.css",
  "./assets/css/knowledge.css",
  "./assets/css/admin.css",
  "./assets/js/app.js",
  "./assets/js/admin.js",
  "./assets/js/config.js",
  "./assets/js/data.js",
  "./assets/js/render.js",
  "./assets/js/i18n.js",
  "./assets/js/utils.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(
        ASSETS.map(asset => fetch(asset, { cache: "reload" }).then(response => {
          if (response.ok) return cache.put(asset, response);
          return undefined;
        }).catch(() => undefined))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
      .then(() => notifyClients({ type: "BUILD_ACTIVATED", version: BUILD_VERSION }))
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (event.data?.type === "GET_VERSION") {
    event.source?.postMessage({ type: "BUILD_VERSION", version: BUILD_VERSION });
  }
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith("/data.json")) {
    event.respondWith(networkFirst(event.request, { cacheName: CACHE, noStore: true }));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, { cacheName: CACHE, fallback: "./index.html" }));
    return;
  }

  event.respondWith(networkFirst(event.request, { cacheName: CACHE }));
});

function networkFirst(request, options = {}) {
  const cacheName = options.cacheName || CACHE;
  const fetchOptions = options.noStore ? { cache: "no-store" } : { cache: "reload" };
  return fetch(request, fetchOptions)
    .then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(cacheName).then(cache => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => caches.match(request).then(hit => hit || (options.fallback ? caches.match(options.fallback) : undefined)));
}

function notifyClients(message) {
  return self.clients.matchAll({ includeUncontrolled: true, type: "window" })
    .then(clients => clients.forEach(client => client.postMessage(message)));
}






