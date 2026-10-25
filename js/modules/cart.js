// js/modules/cart.js
import { store } from '../core/store.js';
import { escapeHTML, openModalState, closeModalState, showToast } from '../ui.js';

const PHONE_NUMBER = '525561446446';
const DESCUENTO_420 = 0.40; // 40% de descuento cuando isPromo420Active = true

const formatMXN = (n) => `$${Number(n).toLocaleString('es-MX')} MXN`;

function calcularTotales(cart, isPromo420Active) {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = isPromo420Active ? subtotal * (1 - DESCUENTO_420) : subtotal;
    return { subtotal, total };
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
    const { cart, isPromo420Active } = store.getState();

    const cartContainer = document.getElementById('cartItemsContainer');
    const cartCountBadge = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('totalPrice');
    const subtotalElement = document.getElementById('subtotalPrice');

    if (!cartContainer) return;

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const { subtotal, total } = calcularTotales(cart, isPromo420Active);

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

export function sendWhatsAppOrder() {
    const { cart, currentUserProfile, isPromo420Active } = store.getState();

    if (cart.length === 0) {
        showToast('Tu carrito está vacío 🚀', 'error');
        return;
    }

    const { total } = calcularTotales(cart, isPromo420Active);

    let message = '¡Hola Aeroshop! 🚀 Quisiera realizar el siguiente pedido:\n\n';
    cart.forEach(item => {
        message += `• *${item.title}* (x${item.quantity}) - ${formatMXN(item.price * item.quantity)}\n`;
    });

    if (isPromo420Active) {
        message += `\n🔥 *Descuento 420 Aplicado (${Math.round(DESCUENTO_420 * 100)}% OFF)*`;
    }

    if (currentUserProfile) {
        message += `\n\n--- 🎟️ PASAPORTE AEROSHOP ---`;
        message += `\n*Pasajero:* ${currentUserProfile.displayName || 'Pasajero'}`;
        message += `\n*ID Cliente:* #USR-${currentUserProfile.uid.slice(-5).toUpperCase()}`;
    }

    message += `\n\n*TOTAL A PAGAR:* ${formatMXN(total)}`;

    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

// Redibuja el carrito cada vez que cambia
store.subscribe(renderCart);
