// js/modules/promos.js — Hora 4:20 y 10% de bienvenida
import { store } from '../core/store.js';

export const DESCUENTO_420 = 0.40;        // 40% en todo de 4:20 a 4:25 pm
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

// ¿Qué descuento le toca a este carrito? (no se juntan: gana el más alto)
export function descuentoActual(state = store.getState()) {
    if (state.isPromo420Active) {
        return { pct: DESCUENTO_420, tipo: '420', etiqueta: '🔥 Hora 4:20 (40% OFF)' };
    }
    if (state.currentUserProfile && state.pedidosCount === 0) {
        return { pct: DESCUENTO_BIENVENIDA, tipo: 'bienvenida', etiqueta: '🎁 Bienvenida 1er pedido (10% OFF)' };
    }
    return { pct: 0, tipo: null, etiqueta: '' };
}

export const precio420 = (precio) => Math.round(precio * (1 - DESCUENTO_420));

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
    banner.textContent = `🔥 ¡HORA 4:20 ACTIVA! 40% OFF EN TODO 🔥 (${min}:${sec})`;
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
