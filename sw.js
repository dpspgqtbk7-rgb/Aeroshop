// sw.js
// Sube el número cada vez que quieras forzar que todos los celulares limpien su copia guardada.
const CACHE_NAME = 'aeroshop-v7';

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
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            // Antes, si UN archivo fallaba, no se instalaba nada. Ahora se guarda lo que se pueda.
            Promise.allSettled(ASSETS_TO_CACHE.map((url) => cache.add(url)))
        )
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Solo páginas y archivos normales (GET por http/https)
    if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

    // Firebase (base de datos y login) siempre va directo a internet
    if (/googleapis\.com|firebaseio\.com|firebaseapp\.com/.test(url.hostname) && !/fonts\./.test(url.hostname)) return;

    // Los videos pesan mucho: se dejan al navegador y no se guardan
    if (/\.(mp4|webm|mov)$/i.test(url.pathname) || request.headers.has('range')) return;

    // Primero internet (siempre ves lo último); si no hay conexión, usa la copia guardada
    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const copia = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
                }
                return networkResponse;
            })
            .catch(() =>
                caches.match(request).then((cached) =>
                    cached || (request.mode === 'navigate' ? caches.match('/index.html') : undefined)
                )
            )
    );
});
