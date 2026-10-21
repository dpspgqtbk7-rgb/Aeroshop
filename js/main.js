// js/main.js
import { renderCart } from './modules/cart.js';
import { initGlobalEvents } from './core/events.js';
import { initAuthObserver } from './modules/auth.js';
import { openProductModal, closeProductModal } from './modules/catalog.js';

import {
    openRutasVuelo, closeRutasVuelo,
    openMonchisVuelo, closeMonchisVuelo,
    openCineVuelo, closeCineVuelo,
    openMusicVuelo, closeMusicVuelo,
    openEmergencyVuelo, closeEmergencyVuelo,
    openFullscreenBrand, closeFullscreenBrand,
    openCardModal, closeInfoModal, closeInfoModalOnOverlay,
    switchMonchisTab, filterMonchisCards, filterCineCards, filterMusicCards,
    openBuzonModal, closeBuzonModal, closeBuzonOnOverlay, sendBuzonWhatsApp,
    openFaqModal, closeFaqModal, closeFaqOnOverlay,
    cerrarPromo, irALoginDesdePromo, cerrarLogin, abrirPerfilOClick, cerrarPerfil, guardarDatosPerfil,
    toggleBreathingGuide, startHoverSlider, stopHoverSlider, compartirContenido
} from './modules/experiences.js';

// Asignación explícita al ámbito global (window)
Object.assign(window, {
    openRutasVuelo, closeRutasVuelo,
    openMonchisVuelo, closeMonchisVuelo,
    openCineVuelo, closeCineVuelo,
    openMusicVuelo, closeMusicVuelo,
    openEmergencyVuelo, closeEmergencyVuelo,
    openFullscreenBrand, closeFullscreenBrand,
    openCardModal, closeInfoModal, closeInfoModalOnOverlay,
    switchMonchisTab, filterMonchisCards, filterCineCards, filterMusicCards,
    openBuzonModal, closeBuzonModal, closeBuzonOnOverlay, sendBuzonWhatsApp,
    openFaqModal, closeFaqModal, closeFaqOnOverlay,
    cerrarPromo, irALoginDesdePromo, cerrarLogin, abrirPerfilOClick, cerrarPerfil, guardarDatosPerfil,
    toggleBreathingGuide, startHoverSlider, stopHoverSlider, compartirContenido,
    openProductModal, closeProductModal
});

document.addEventListener('DOMContentLoaded', () => {
    initGlobalEvents();    
    initAuthObserver();    
    renderCart();          
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