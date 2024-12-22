const cacheName = "minigame-cache-v1";
const assetsToCache = [
    "/minigame.html",
    "/css/minigame.css",
    "/js/minigame.js",
    "/pictures/icon-192x192.png",
    "/pictures/icon-512x512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(assetsToCache).catch((err) => {
                console.error("Failed to cache some assets", err);
            });
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
