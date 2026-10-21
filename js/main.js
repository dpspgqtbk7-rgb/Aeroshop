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
import { openModalState, closeModalState } from './ui.js';

// Exponer las funciones al objeto global window para que funcionen con onclick=""
window.cerrarPromo = function() {
    const promoModal = document.getElementById('promoModal');
    if (promoModal) {
        promoModal.classList.remove('active');
    }
    closeModalState();
};

window.irALoginDesdePromo = function() {
    window.cerrarPromo();
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('active');
        openModalState();
    }
};

window.cerrarLogin = function() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('active');
    }
    closeModalState();
};

window.cerrarPerfil = function() {
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.classList.remove('active');
    }
    closeModalState();
};