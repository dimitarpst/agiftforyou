const CACHE_NAME = "gift-game-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/minigame.html",
    "/css/backup.css",
    "/css/custom.css",
    "/css/minigame.css",
    "/js/minigame.js",
    "/js/particles.min.js",
    "/js/quiz.js",
    "/js/script.js",
    "/pictures/avocado.png",
    "/pictures/avocadoWish.png",
    "/pictures/badbadtzmaru.png",
    "/pictures/basket.png",
    "/pictures/basket.svg",
    "/pictures/cinnamoroll.png",
    "/pictures/clockWish.png",
    "/pictures/fire.gif",
    "/pictures/flower.png",
    "/pictures/heart.png",
    "/pictures/heartWish.png",
    "/pictures/magnetWish",
    "/pictures/pompompurin.png",
    "/pictures/rotate-phone",
    "/pictures/shield1.png",
    "/pictures/shield2.png",
    "/pictures/shield3.png",
    "/pictures/shieldWish.png",
    "/pictures/slide1.jpg",
    "/pictures/slide2.jpg",
    "/pictures/slide3.jpg",
    "/pictures/slide4.jpg",
    "/pictures/slide5.jpg",
    "/pictures/slide6.jpg",
    "/pictures/slide7.jpg",
    "/pictures/slide8.jpg",
    "/pictures/slide9.jpg",
    "/pictures/star.png",
    "/pictures/starconstWish.png",
    "/pictures/us1.jpg",
    "/pictures/us2.jpg",
    "/pictures/us3.jpg",
    "/pictures/us4.jpg",
    "/pictures/us5.jpg",
    "/pictures/us6.jpg",
    "/pictures/us7.jpg",
    "/pictures/us8.jpg",
    "/pictures/wishBox.png",
    "/audio/atmospheric-metallic-swipe-19-196792.mp3",
    "/audio/avocadoCollect.wav",
    "/audio/avocadoCollectMagnet.wav",
    "/audio/clockCollect.wav",
    "/audio/clockCollectMagnet.wav",
    "/audio/heartCollect.wav",
    "/audio/heartCollectMagnet.wav",
    "/audio/heartMiss.wav",
    "/audio/itemReveal.mp3",
    "/audio/itemReveal.wav",
    "/audio/magicBoxOpen.wav",
    "/audio/magnetCollect.wav",
    "/audio/powerUp.wav",
    "/audio/shieldBreak.wav",
    "/audio/shieldUpgrade.wav",
    "/audio/shimmering.wav",
    "/audio/starCollect.wav",
    "/audio/starCollectMagnet.wav",
    "/audio/swordAttack.wav",
    "/audio/veil.wav",
    "/audio/sad.mp3",
    "/audio/yay.mp3"
  ];
  

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
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

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
