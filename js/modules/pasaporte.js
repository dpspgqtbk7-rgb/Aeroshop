// js/modules/pasaporte.js — Pasaporte: vuelos acumulados, pedidos e historial
import { store } from '../core/store.js';
import { escapeHTML as e } from '../ui.js';
import { db, fbMethods } from '../../firebase-config.js';

let detener = null;

const fechaCorta = (iso) => {
    const f = iso ? new Date(iso) : null;
    return f && !isNaN(f) ? f.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
};
const dinero = (n) => '$' + Number(n || 0).toLocaleString('es-MX') + ' MXN';

// Cada pedido ENTREGADO es un vuelo. Cada 3 vuelos el ciclo reinicia; con 2 vuelos el siguiente pedido lleva regalo.
export function calcularVuelos(pedidos) {
    const entregados = pedidos.filter(p => p.estado === 'entregado');
    return { entregados, total: entregados.length, ciclo: entregados.length % 3 };
}

export function iniciarPasaporte(uid) {
    detenerPasaporte();
    try {
        detener = fbMethods.onSnapshot(
            fbMethods.collection(db, 'usuarios', uid, 'pedidos'),
            (snap) => {
                const pedidos = [];
                snap.forEach(d => pedidos.push({ id: d.id, ...d.data() }));
                pedidos.sort((a, b) => String(b.creadoEn).localeCompare(String(a.creadoEn)));
                renderPasaporte(pedidos);
            },
            (err) => console.warn('No se pudo leer el Pasaporte:', err.code || err)
        );
    } catch (err) {
        console.warn('Pasaporte no disponible:', err);
    }
}

export function detenerPasaporte() {
    if (detener) { detener(); detener = null; }
    renderPasaporte([]);
}

// Guarda el pedido como "pendiente". Tú lo cambias a "entregado" en Firebase y ahí suma el vuelo.
export async function registrarPedido(items, total, promo420) {
    const { currentUserProfile } = store.getState();
    if (!currentUserProfile) return;
    await fbMethods.addDoc(fbMethods.collection(db, 'usuarios', currentUserProfile.uid, 'pedidos'), {
        items: items.map(i => ({
            title: String(i.title).slice(0, 120),
            price: Number(i.price),
            quantity: Number(i.quantity),
            image: String(i.image || '').slice(0, 200)
        })),
        total: Number(total),
        promo420: !!promo420,
        estado: 'pendiente',
        creadoEn: new Date().toISOString()
    });
}

export function renderPasaporte(pedidos) {
    const { entregados, total, ciclo } = calcularVuelos(pedidos);
    const $ = (id) => document.getElementById(id);

    if ($('vuelosCountText')) $('vuelosCountText').textContent = `${ciclo} / 3 VUELOS`;
    $('step1')?.classList.toggle('active', ciclo >= 1);
    $('step2')?.classList.toggle('active', ciclo >= 2);
    $('step3')?.classList.toggle('active', ciclo === 2);

    const hint = document.querySelector('#profileModal .vuelos-hint');
    if (hint) {
        hint.textContent = ciclo === 2
            ? '🎁 ¡Tu próximo pedido lleva un producto de regalo!'
            : ciclo === 1
                ? '💡 Te falta 1 pedido más para desbloquear tu regalo.'
                : '💡 Haz 2 pedidos y en el 3º te regalamos un producto.';
    }

    const badge = $('userVipBadge');
    if (badge) {
        const vip = total >= 6;
        badge.className = 'status-pill-badge ' + (vip ? 'vip' : 'normal');
        badge.textContent = vip ? 'TRIPULANTE VIP 👑' : (total > 0 ? 'PASAJERO FRECUENTE ✈️' : 'PASAJERO NUEVO 🛫');
    }

    const caja = $('customerOrderStatusBox');
    if (caja) {
        const pendientes = pedidos.filter(p => p.estado === 'pendiente');
        caja.innerHTML = pendientes.map(p => `
            <div class="order-status-card">
                <strong>🛫 Pedido en proceso</strong>
                <span>${e(dinero(p.total))} · ${e(fechaCorta(p.creadoEn))}</span>
                <small>${e((p.items || []).map(i => `${i.quantity}× ${i.title}`).join(', '))}</small>
                <small>Te confirmamos por WhatsApp. Al entregarse, suma un vuelo ✈️</small>
            </div>`).join('');
    }

    const grid = $('purchasedProductsGrid');
    if (grid) {
        const tarjetas = entregados.flatMap(p => (p.items || []).map(i => `
            <div class="purchased-item-card">
                <img src="${e(i.image || './avion.png')}" alt="${e(i.title)}" loading="lazy" onerror="this.src='./avion.png'">
                <div class="purchased-item-info">
                    <h4>${e(i.title)}</h4>
                    <span class="purchased-date">${e(fechaCorta(p.creadoEn))}</span>
                </div>
            </div>`));
        grid.innerHTML = tarjetas.length
            ? tarjetas.join('')
            : '<p class="empty-purchases-box" style="color:#94a3b8; text-align:center;">Aún no tienes productos adquiridos 🛬<br><small>Aquí aparecerán cuando se entregue tu primer pedido.</small></p>';
    }
}
