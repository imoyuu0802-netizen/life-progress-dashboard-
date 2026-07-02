const cacheName = "life-progress-dashboard-v67";
const assets = [
  "./",
  "./index.html",
  "./styles.css?v=66",
  "./jflec-data.js?v=53",
  "./app.js?v=67",
  "./firebase-config.js?v=53",
  "./firebase-sync.js?v=53",
  "./manifest.webmanifest?v=5",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(assets))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(cacheName).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() =>
      caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
    )
  );
});
