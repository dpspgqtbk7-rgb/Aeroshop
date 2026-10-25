// firebase-messaging-sw.js — recibe avisos cuando la página está cerrada
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCMuec9un_xOU2T3AP4SxElQWz14Js8HHU",
    authDomain: "aeroshop-cdmx.firebaseapp.com",
    projectId: "aeroshop-cdmx",
    storageBucket: "aeroshop-cdmx.firebasestorage.app",
    messagingSenderId: "990438625408",
    appId: "1:990438625408:web:e14f86cb118cf934f29665"
});

const messaging = firebase.messaging();

// Si el aviso trae "notification", Firebase ya lo muestra solo. Si viene solo con "data", lo mostramos aquí.
messaging.onBackgroundMessage((payload) => {
    if (payload.notification) return;
    const d = payload.data || {};
    self.registration.showNotification(d.title || 'AEROSHOP CDMX', {
        body: d.body || '',
        icon: './avion.png',
        badge: './avion.png',
        data: { url: d.url || './' }
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || './';
    event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
        for (const c of lista) { if ('focus' in c) return c.focus(); }
        return clients.openWindow(url);
    }));
});
