// js/main.js
import { openModalState, closeModalState, showToast } from './ui.js';
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

// ==========================================
// CONTROL DE MODO MANTENIMIENTO
// ==========================================
const MODO_MANTENIMIENTO = true; // 👈 En 'true' para mantenimiento, 'false' para la app normal

function activarMantenimientoUI() {
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
}

if (MODO_MANTENIMIENTO) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', activarMantenimientoUI);
    } else {
        activarMantenimientoUI();
    }
}

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

window.addEventListener('error', (event) => {
    console.error('⚠️ Error detectado:', event.error);
    if (typeof showToast === 'function') {
        showToast('⚙️ Página en actualización / mantenimiento. Comunícate al 5561446446 para más información.', 'error');
    }
});

function initApp() {
    if (!MODO_MANTENIMIENTO) {
        initGlobalEvents();    
        initAuthObserver();    
        renderCart();          
        registerServiceWorker();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('✅ Service Worker activo:', reg.scope))
                .catch(err => console.error('❌ Error SW:', err));
        });
    }
}