// js/main.js
import { renderCart } from './modules/cart.js';
import { initGlobalEvents } from './core/events.js';
import { initAuthObserver } from './modules/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    initGlobalEvents();    // Event Delegation
    initAuthObserver();    // Escuchador de Firebase Auth
    renderCart();          // Cargar carrito desde Store/LocalStorage
    registerServiceWorker();
});

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('✅ Service Worker registrado:', reg.scope))
                .catch(err => console.error('❌ Error al registrar SW:', err));
        });
    }
}