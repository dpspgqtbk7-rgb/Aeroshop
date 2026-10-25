// js/modules/push.js — notificaciones (Firebase Cloud Messaging)
import { store } from '../core/store.js';
import { showToast } from '../ui.js';
import { db, fbMethods, VAPID_KEY } from '../../firebase-config.js';
import { esIOS, estaInstalada, puedeInstalar } from './pwa.js';

const FIREBASE_MSG = 'https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js';

export function estadoPush() {
    if (esIOS() && !estaInstalada()) return 'ios-instalar';
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'no-soporta';
    if (!VAPID_KEY) return 'pronto';
    if (Notification.permission === 'denied') return 'bloqueado';
    if (Notification.permission === 'granted') return 'activo';
    return 'pedir';
}

const TEXTOS = {
    'ios-instalar': '📲 En iPhone los avisos funcionan desde la app instalada: toca Compartir ⬆️ → "Agregar a pantalla de inicio", ábrela desde ahí e inicia sesión.',
    'no-soporta': 'Este navegador no permite avisos. Prueba con Chrome (Android) o instala la app en iPhone.',
    'pronto': '🔔 Muy pronto: avisos de lanzamientos, promos y el estado de tu pedido.',
    'bloqueado': '🔕 Bloqueaste los avisos. Para activarlos entra a la configuración del navegador > Notificaciones > AEROSHOP > Permitir.',
    'activo': '🔔 Avisos activados ✅ Te avisaremos de lanzamientos, promos y tu pedido.',
    'pedir': '🔔 Activa los avisos y entérate primero de lanzamientos, promos 420 y el estado de tu pedido.'
};

export function renderBloquePush() {
    const texto = document.getElementById('pushTexto');
    const btn = document.getElementById('btnNotificaciones');
    const inst = document.getElementById('btnInstalar');
    if (!texto) return;
    const estado = estadoPush();
    texto.textContent = TEXTOS[estado];
    if (btn) btn.hidden = estado !== 'pedir';
    if (inst) inst.hidden = !puedeInstalar();
}

async function guardarToken(token) {
    const { currentUserProfile } = store.getState();
    if (!currentUserProfile) return;
    await fbMethods.setDoc(fbMethods.doc(db, 'usuarios', currentUserProfile.uid, 'tokens', token), {
        token,
        plataforma: esIOS() ? 'iOS' : (/Android/.test(navigator.userAgent) ? 'Android' : 'Web'),
        creadoEn: new Date().toISOString()
    }, { merge: true });
    await fbMethods.setDoc(fbMethods.doc(db, 'usuarios', currentUserProfile.uid), { notificaciones: true }, { merge: true });
}

async function obtenerToken() {
    const { getMessaging, getToken, onMessage, isSupported } = await import(/* @vite-ignore */ FIREBASE_MSG);
    if (!(await isSupported())) throw new Error('no-soportado');
    const { app } = await import('../../firebase-config.js');
    const registro = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registro });
    // Mensajes que llegan con la página abierta
    onMessage(messaging, (payload) => {
        const n = payload.notification || payload.data || {};
        showToast(`🔔 ${n.title || 'AEROSHOP'}${n.body ? ': ' + n.body : ''}`);
    });
    return token;
}

// Debe llamarse desde un toque del usuario (el navegador lo exige)
export async function activarNotificaciones() {
    if (estadoPush() !== 'pedir') { renderBloquePush(); return; }
    try {
        const permiso = await Notification.requestPermission();
        if (permiso !== 'granted') { renderBloquePush(); showToast('No activaste los avisos', 'error'); return; }
        const token = await obtenerToken();
        if (!token) throw new Error('sin-token');
        await guardarToken(token);
        showToast('🔔 ¡Avisos activados!');
    } catch (err) {
        console.error('❌ Error al activar avisos:', err);
        showToast('No se pudieron activar los avisos. Intenta de nuevo.', 'error');
    }
    renderBloquePush();
}

// Al iniciar sesión: pinta el bloque y, si ya había permiso, renueva el token en segundo plano
export async function iniciarPush() {
    renderBloquePush();
    if (estadoPush() === 'activo') {
        try { await guardarToken(await obtenerToken()); } catch (err) { console.warn('Token de avisos:', err.message || err); }
    }
}
