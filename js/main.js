// ==========================================
// CONTROL DE MODO MANTENIMIENTO
// ==========================================
const MODO_MANTENIMIENTO = false; // 👈 Cambia a 'true' para ACTIVAR, o 'false' para DESACTIVAR

if (MODO_MANTENIMIENTO) {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.innerHTML = `
            <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0f172a; color: #ffffff; text-align: center; padding: 20px; font-family: 'Space Grotesk', sans-serif;">
                <div style="font-size: 4rem; margin-bottom: 10px;">🛸⚙️</div>
                <h1 style="font-size: 2.2rem; color: #facc15; margin-bottom: 12px;">PÁGINA EN MANTENIMIENTO</h1>
                <p style="font-size: 1.1rem; color: #cbd5e1; max-width: 500px; line-height: 1.6; margin-bottom: 25px;">
                    Estamos actualizando el catálogo y calibrando el sistema de vuelo para darte una mejor experiencia.
                </p>
                <div style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); padding: 16px 24px; border-radius: 16px;">
                    <p style="margin: 0; color: #38bdf8; font-weight: 700; font-size: 0.95rem;">
                        📞 ¿Dudas o pedidos urgentes? Comunícate directo al:
                    </p>
                    <a href="https://wa.me/525561446446" target="_blank" style="display: inline-block; margin-top: 8px; color: #22c55e; font-size: 1.3rem; font-weight: 800; text-decoration: none;">
                        💬 55 6144 6446
                    </a>
                </div>
            </div>
        `;
    });
}
import 
{ openModalState, closeModalState } from './ui.js';
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
// Exposición global
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
// AVISO GLOBAL DE MANTENIMIENTO ANTE ERRORES O ACTUALIZACIONES
window.addEventListener('error', (event) => {
    console.error('⚠️ Error detectado:', event.error);
    showToast('⚙️ Página en actualización / mantenimiento. Comunícate al 5561446446 para más información.', 'error');
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
// SOLICITUD DE NOTIFICACIONES PUSH PARA USUARIOS
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showToast('🔔 ¡Notificaciones de vuelo activadas!');
                }
            });
        }, 5000);
    }
}

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