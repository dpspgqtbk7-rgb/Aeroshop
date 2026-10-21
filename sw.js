// sw.js
const CACHE_NAME = 'aeroshop-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/firebase-config.js',
    '/js/main.js',
    '/js/core/store.js',
    '/js/core/events.js',
    '/js/modules/cart.js',
    '/js/modules/catalog.js',
    '/js/modules/experiences.js',
    '/js/modules/emergency.js',
    '/js/modules/auth.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('🧹 Eliminando caché antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});