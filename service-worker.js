const CACHE_NAME = 'profmarshrut-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles/main.css',
  './components/modal.js',
  './components/game-card.js',
  './components/timer.js',
  './components/scoreboard.js',
  './scripts/storage.js',
  './scripts/local-data.js',
  './scripts/data-loader.js',
  './scripts/router.js',
  './scripts/ui.js',
  './scripts/teacher-mode.js',
  './scripts/app.js',
  './games/guess-profession.js',
  './games/myth-or-truth.js',
  './games/skill-match.js',
  './games/career-wheel.js',
  './games/future-careers.js',
  './data/professions.json',
  './data/questions.json',
  './data/myths.json',
  './data/skills-matching.json',
  './data/future-generator.json',
  './assets/images/hero-pattern.svg',
  './assets/icons/favicon.svg',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
