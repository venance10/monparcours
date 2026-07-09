const CACHE = "venanceportfolio-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./data.json",
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
  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request).catch(() => caches.match("./index.html")))
  );
});
