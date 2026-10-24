// sw.js
const CACHE_NAME = 'aeroshop-v5';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/firebase-config.js',
    '/js/main.js',
    '/js/ui.js',
    '/js/core/store.js',
    '/js/core/events.js',
    '/js/modules/cart.js',
    '/js/modules/catalog.js',
    '/js/modules/experiences.js',
    '/js/modules/emergency.js',
    '/js/modules/auth.js',
    '/js/modules/data.js'
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
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia de Caché Dinámica (Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('firestore.googleapis.com')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                }
                return networkResponse;
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});

// SOPORTE PARA NOTIFICACIONES PUSH
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'AEROSHOP CDMX 🛸', body: '¡Hay nuevos vuelos y lanzamientos disponibles!' };
    const options = {
        body: data.body,
        icon: '/avion.png',
        badge: '/avion.png',
        vibrate: [100, 50, 100]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});