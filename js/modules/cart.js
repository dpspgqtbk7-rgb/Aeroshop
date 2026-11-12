// js/modules/cart.js
import { store } from '../core/store.js';
import { escapeHTML, openModalState, closeModalState, showToast } from '../ui.js';
import { WHATSAPP } from '../config.js';
import { descuentoActual } from './promos.js';

const PHONE_NUMBER = WHATSAPP;
const formatMXN = (n) => `$${Number(n).toLocaleString('es-MX')} MXN`;

// Subtotal, descuento que aplica (4:20 o bienvenida, el más alto) y total
function calcularTotales(cart, state = store.getState()) {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const desc = descuentoActual(state, cart);
    const ahorro = desc.ahorro;
    return { subtotal, total: subtotal - ahorro, ahorro, desc };
}

// Renglón del descuento dentro del carrito (se crea solo la primera vez)
function pintarDescuento(state, ahorro, desc, hayProductos) {
    const resumen = document.querySelector('.cart-summary');
    const totalRow = document.getElementById('totalPrice')?.closest('.summary-row');
    if (!resumen || !totalRow) return;
    let fila = document.getElementById('descuentoRow');
    if (!fila) {
        fila = document.createElement('div');
        fila.id = 'descuentoRow';
        fila.className = 'summary-row descuento-row';
        resumen.insertBefore(fila, totalRow);
    }
    let pista = document.getElementById('descuentoPista');
    if (!pista) {
        pista = document.createElement('p');
        pista.id = 'descuentoPista';
        pista.className = 'descuento-pista';
        resumen.insertBefore(pista, totalRow.nextSibling);
    }
    const verFila = !!(desc.ahorro && hayProductos);
    fila.style.display = verFila ? '' : 'none';
    if (verFila) fila.innerHTML = `<span>${escapeHTML(desc.etiqueta)}</span><span>-${formatMXN(ahorro)}</span>`;
    const verPista = !state.currentUserProfile && !desc.ahorro && hayProductos;
    pista.style.display = verPista ? '' : 'none';
    if (verPista) pista.textContent = '🎁 Inicia sesión y llévate 10% OFF en tu primer pedido';
}

export function addToCart(title, price, image = '') {
    const { cart } = store.getState();
    const existe = cart.some(item => item.title === title);

    // Siempre se crea un carrito nuevo (no se modifica el anterior)
    const updatedCart = existe
        ? cart.map(item => item.title === title ? { ...item, quantity: item.quantity + 1 } : item)
        : [...cart, { title, price, image, quantity: 1 }];

    store.setState({ cart: updatedCart });
}

export function increaseQuantity(title) {
    const { cart } = store.getState();
    store.setState({
        cart: cart.map(item => item.title === title ? { ...item, quantity: item.quantity + 1 } : item)
    });
}

export function removeFromCart(title) {
    const { cart } = store.getState();
    const updatedCart = cart
        .map(item => item.title === title ? { ...item, quantity: item.quantity - 1 } : item)
        .filter(item => item.quantity > 0);

    store.setState({ cart: updatedCart });
}

// Abre o cierra el panel del carrito (una sola función para todo el sitio)
export function toggleCart(forceOpen) {
    const overlay = document.getElementById('cartOverlay');
    if (!overlay) return;

    const abrir = typeof forceOpen === 'boolean' ? forceOpen : !overlay.classList.contains('active');
    overlay.classList.toggle('active', abrir);

    if (abrir) {
        openModalState();
    } else {
        closeModalState();
    }
}

export function renderCart() {
    const state = store.getState();
    const { cart } = state;

    const cartContainer = document.getElementById('cartItemsContainer');
    const cartCountBadge = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('totalPrice');
    const subtotalElement = document.getElementById('subtotalPrice');

    if (!cartContainer) return;

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const { subtotal, total, ahorro, desc } = calcularTotales(cart, state);
    pintarDescuento(state, ahorro, desc, cart.length > 0);

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:30px 0;">Tu carrito está vacío 🚀</p>';
    } else {
        cartContainer.innerHTML = cart.map(item => {
            const title = escapeHTML(item.title);
            return `
                <div class="cart-item">
                    <img src="${escapeHTML(item.image)}" alt="${title}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${title}</div>
                        <div style="color:#16a34a; font-weight:bold;">${formatMXN(item.price)}</div>
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" data-action="qty-minus" data-title="${title}">-</button>
                        <span style="font-weight:bold;">${item.quantity}</span>
                        <button class="qty-btn" data-action="qty-plus" data-title="${title}">+</button>
                    </div>
                </div>`;
        }).join('');
    }

    if (cartCountBadge) cartCountBadge.textContent = totalItems;
    if (subtotalElement) subtotalElement.textContent = formatMXN(subtotal);
    if (cartTotalElement) cartTotalElement.textContent = formatMXN(total);
}

export function sendWhatsAppOrder(opciones = {}) {
    const { cart, currentUserProfile, isPromo420Active } = store.getState();

    if (cart.length === 0) {
        showToast('Tu carrito está vacío 🚀', 'error');
        return;
    }

    // Sin sesión se invita a entrar (así se acumulan vuelos y llegan avisos), pero se puede seguir sin cuenta
    if (!currentUserProfile && !opciones.sinCuenta) {
        const login = document.getElementById('loginModal');
        if (login) {
            toggleCart(false);
            login.dataset.desdePedido = '1';
            login.classList.add('active');
            openModalState();
            showToast('Inicia sesión para acumular vuelos y recibir avisos de tu pedido 🎟️');
            return;
        }
    }

    const { subtotal, total, ahorro, desc } = calcularTotales(cart);

    let message = '¡Hola Aeroshop! 🚀 Quisiera realizar el siguiente pedido:\n\n';
    cart.forEach(item => {
        message += `• *${item.title}* (x${item.quantity}) - ${formatMXN(item.price * item.quantity)}\n`;
    });

    if (desc.ahorro) {
        message += `\n*Subtotal:* ${formatMXN(subtotal)}`;
        message += desc.tipo === '420'
            ? `\n🔥 *PROMO HORA 4:20 (Mieles):* -${formatMXN(ahorro)}`
            : `\n🎁 *10% OFF BIENVENIDA (1er pedido):* -${formatMXN(ahorro)}`;
    }

    if (currentUserProfile) {
        message += `\n\n--- 🎟️ PASAPORTE AEROSHOP ---`;
        message += `\n*Pasajero:* ${currentUserProfile.displayName || 'Pasajero'}`;
        message += `\n*ID Cliente:* #USR-${currentUserProfile.uid.slice(-5).toUpperCase()}`;
    }

    message += `\n\n*TOTAL A PAGAR:* ${formatMXN(total)}`;

    // Se abre WhatsApp primero (el celular solo lo permite justo al tocar el botón)
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

    // Después se guarda el pedido en el Pasaporte (si falla, el pedido por WhatsApp ya salió)
    if (currentUserProfile) {
        import('./pasaporte.js')
            .then(m => m.registrarPedido(cart, total, isPromo420Active))
            .catch(err => console.warn('No se guardó el pedido en el Pasaporte:', err.code || err));
    }
}

// Redibuja el carrito cada vez que cambia
store.subscribe(renderCart);
