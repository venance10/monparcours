const CACHE = "venanceportfolio-v11";
const ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./assets/css/variables.css",
  "./assets/css/base.css",
  "./assets/css/components.css",
  "./assets/css/layout.css",
  "./assets/css/sections.css",
  "./assets/js/app.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => Promise.allSettled(
      ASSETS.map(asset => fetch(asset).then(response => {
        if (response.ok) return cache.put(asset, response);
        return undefined;
      }).catch(() => undefined))
    ))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/data.json")) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request).catch(() => caches.match("./index.html")))
  );
});
