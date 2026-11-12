// js/modules/promos.js — Hora 4:20 y 10% de bienvenida
import { store } from '../core/store.js';
import { productsData } from './productos.js';

// Hora 4:20 (de 4:20 a 4:25 pm) — SOLO productos de Mieles (Nubes no entra):
//   precio de $600 o menos → 10%   ·   precio de más de $600 → 30%
export const LIMITE_420 = 600;
export const DESCUENTO_420_BAJO = 0.10;
export const DESCUENTO_420_ALTO = 0.30;
export function descuento420De(p) {
    if (!p || p.seccion === 'nubes' || !Number.isFinite(p.price) || p.price <= 0) return 0;
    return p.price > LIMITE_420 ? DESCUENTO_420_ALTO : DESCUENTO_420_BAJO;
}
// El carrito guarda "Nombre [sabor]": se busca el producto por su nombre
export function productoDeTitulo(titulo) {
    const base = String(titulo).replace(/\s*\[.*\]\s*$/, '').trim();
    return Object.values(productsData).find(p => p.title === base) || null;
}
export const DESCUENTO_BIENVENIDA = 0.10; // 10% en el primer pedido (con sesión iniciada)
const INICIO_420 = 16 * 60 + 20;          // 4:20 pm (hora de CDMX)
const FIN_420 = 16 * 60 + 25;             // termina a las 4:25 pm

// Hora de la CDMX aunque el celular tenga otra zona horaria
function segundosDelDiaCDMX(fecha = new Date()) {
    try {
        const partes = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Mexico_City', hour12: false,
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).formatToParts(fecha);
        const v = (t) => Number(partes.find(x => x.type === t)?.value || 0);
        return (v('hour') % 24) * 3600 + v('minute') * 60 + v('second');
    } catch (e) {
        return fecha.getHours() * 3600 + fecha.getMinutes() * 60 + fecha.getSeconds();
    }
}

export function segundosRestantes420(fecha) {
    const s = segundosDelDiaCDMX(fecha);
    return (s >= INICIO_420 * 60 && s < FIN_420 * 60) ? FIN_420 * 60 - s : 0;
}

// ¿Qué descuento le toca a este carrito? (no se juntan: gana el que te ahorre más)
export function descuentoActual(state = store.getState(), cart = state.cart || []) {
    const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
    const opciones = [];
    if (state.isPromo420Active) {
        const ahorro = Math.round(cart.reduce((t, i) => t + i.price * i.quantity * descuento420De(productoDeTitulo(i.title)), 0));
        if (ahorro > 0) opciones.push({ ahorro, tipo: '420', etiqueta: '🔥 Hora 4:20 (Mieles)' });
    }
    if (state.currentUserProfile && state.pedidosCount === 0) {
        opciones.push({ ahorro: Math.round(subtotal * DESCUENTO_BIENVENIDA), tipo: 'bienvenida', etiqueta: '🎁 Bienvenida 1er pedido (10% OFF)' });
    }
    opciones.sort((a, b) => b.ahorro - a.ahorro);
    return opciones[0] && opciones[0].ahorro > 0 ? opciones[0] : { ahorro: 0, tipo: null, etiqueta: '' };
}

// Precio de un producto durante la Hora 4:20 (igual si no le toca descuento)
export const precio420 = (p) => Math.round(p.price * (1 - descuento420De(p)));

function pintarBanner(segs) {
    let banner = document.getElementById('bannerHora420');
    if (!segs) {
        if (banner) banner.remove();
        document.body.classList.remove('hay-420');
        return;
    }
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'bannerHora420';
        banner.setAttribute('role', 'status');
        document.body.appendChild(banner);
        document.body.classList.add('hay-420');
    }
    const min = Math.floor(segs / 60);
    const sec = String(segs % 60).padStart(2, '0');
    banner.textContent = `🔥 ¡HORA 4:20 ACTIVA! Hasta 30% OFF en Mieles 🍯 (${min}:${sec})`;
}

// Revisa la hora cada segundo y prende/apaga la promo
export function iniciarReloj420(alCambiar) {
    const revisar = () => {
        const segs = segundosRestantes420();
        const activa = segs > 0;
        pintarBanner(segs);
        if (activa !== store.getState().isPromo420Active) {
            store.setState({ isPromo420Active: activa });
            if (typeof alCambiar === 'function') alCambiar(activa);
        }
    };
    revisar();
    setInterval(revisar, 1000);
}
