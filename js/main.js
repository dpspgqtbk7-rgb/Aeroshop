// js/main.js
import { openModalState, showToast } from './ui.js';
import { renderCart, toggleCart } from './modules/cart.js';
import { initGlobalEvents } from './core/events.js';
import { openProductModal, closeProductModal, closeModalOnOverlay } from './modules/catalog.js';
import { toggleBreathingGuide } from './modules/emergency.js';

import {
    openRutasVuelo, closeRutasVuelo,
    openMonchisVuelo, closeMonchisVuelo,
    openCineVuelo, closeCineVuelo,
    openMusicVuelo, closeMusicVuelo,
    openEmergencyVuelo, closeEmergencyVuelo,
    openFullscreenBrand, closeFullscreenBrand,
    openCardModal, closeInfoModal, closeInfoModalOnOverlay,
    switchMonchisTab, filterMonchisCards, filterRutas, filterCineCards, filterMusicCards,
    openBuzonModal, closeBuzonModal, closeBuzonOnOverlay, sendBuzonWhatsApp,
    openFaqModal, closeFaqModal, closeFaqOnOverlay,
    cerrarPromo, irALoginDesdePromo, cerrarLogin, abrirPerfilOClick, cerrarPerfil,
    startHoverSlider, stopHoverSlider, compartirContenido, initLazyVideos
} from './modules/experiences.js';

// Avisa a la red de seguridad de index.html que este archivo sí cargó
window.__aeroshopListo = true;

// ==========================================
// CONTROL DE MODO MANTENIMIENTO
// ==========================================
const MODO_MANTENIMIENTO = false; // 👈 true = letrero de mantenimiento | false = página normal

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
                <a href="https://wa.me/525561446446" target="_blank" rel="noopener" style="display: inline-block; margin-top: 8px; color: #22c55e; font-size: 1.3rem; font-weight: 800; text-decoration: none;">
                    💬 55 6144 6446
                </a>
            </div>
        </div>
    `;
}

// ==========================================
// FUNCIONES DISPONIBLES PARA LOS onclick DEL HTML
// ==========================================
Object.assign(window, {
    openRutasVuelo, closeRutasVuelo,
    openMonchisVuelo, closeMonchisVuelo,
    openCineVuelo, closeCineVuelo,
    openMusicVuelo, closeMusicVuelo,
    openEmergencyVuelo, closeEmergencyVuelo,
    openFullscreenBrand, closeFullscreenBrand,
    openCardModal, closeInfoModal, closeInfoModalOnOverlay,
    switchMonchisTab, filterRutas, filterMonchisCards, filterCineCards, filterMusicCards,
    openBuzonModal, closeBuzonModal, closeBuzonOnOverlay, sendBuzonWhatsApp,
    openFaqModal, closeFaqModal, closeFaqOnOverlay,
    cerrarPromo, irALoginDesdePromo, cerrarLogin, abrirPerfilOClick, cerrarPerfil,
    toggleBreathingGuide, startHoverSlider, stopHoverSlider, compartirContenido,
    openProductModal, closeProductModal, closeModalOnOverlay, toggleCart
});

// Firebase se carga solo cuando hace falta (si falla, el resto del sitio sigue vivo)
window.guardarDatosPerfil = async function () {
    try {
        const auth = await import('./modules/auth.js');
        await auth.guardarDatosPerfil();
    } catch (err) {
        console.error('Perfil no disponible:', err);
        showToast('Tu Pasaporte no está disponible ahora', 'error');
    }
};

async function initAuth() {
    try {
        const auth = await import('./modules/auth.js');
        auth.initAuthObserver();
    } catch (err) {
        console.error('No se pudo cargar el inicio de sesión:', err);
    }
}

// Aviso al cliente solo si algo realmente falla (máximo uno cada 15 s)
let ultimoAviso = 0;
window.addEventListener('error', (event) => {
    console.error('⚠️ Error detectado:', event.error || event.message);
    if (!event.error) return; // errores de imágenes/recursos se ignoran
    const ahora = Date.now();
    if (ahora - ultimoAviso < 15000) return;
    ultimoAviso = ahora;
    showToast('⚠️ Algo no cargó bien. Recarga la página.', 'error');
});

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    const registrar = () => navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('✅ Service Worker activo:', reg.scope))
        .catch(err => console.error('❌ Error SW:', err));

    if (document.readyState === 'complete') {
        registrar();
    } else {
        window.addEventListener('load', registrar, { once: true });
    }
}

function initApp() {
    if (MODO_MANTENIMIENTO) {
        activarMantenimientoUI();
        return;
    }

    initGlobalEvents();
    initAuth();
    renderCart();
    initLazyVideos();
    registerServiceWorker();

    // El anuncio de bienvenida viene abierto desde el HTML: bloquea el scroll del fondo
    const promo = document.getElementById('promoModal');
    if (promo && promo.classList.contains('active')) openModalState();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
