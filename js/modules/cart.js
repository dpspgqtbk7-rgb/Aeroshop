// js/modules/cart.js
import { store } from '../core/store.js';

const PHONE_NUMBER = "525561446446";

export function addToCart(title, price, image) {
    const { cart } = store.getState();
    const existingIndex = cart.findIndex(item => item.title === title);
    
    let updatedCart = [...cart];
    if (existingIndex > -1) {
        updatedCart[existingIndex].quantity += 1;
    } else {
        updatedCart.push({ title, price, image, quantity: 1 });
    }

    store.setState({ cart: updatedCart });
}

export function removeFromCart(title) {
    const { cart } = store.getState();
    const updatedCart = cart
        .map(item => item.title === title ? { ...item, quantity: item.quantity - 1 } : item)
        .filter(item => item.quantity > 0);

    store.setState({ cart: updatedCart });
}

export function renderCart() {
    const { cart, isPromo420Active } = store.getState();
    
    const cartContainer = document.getElementById('cartItemsContainer');
    const cartCountBadge = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('totalPrice');
    const subtotalElement = document.getElementById('subtotalPrice');

    if (!cartContainer) return;

    let subtotal = 0;
    let totalItems = 0;

    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:30px 0;">Tu carrito está vacío 🚀</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            totalItems += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div style="color:#16a34a; font-weight:bold;">$${item.price.toLocaleString()} MXN</div>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" data-action="qty-minus" data-title="${item.title}">-</button>
                    <span style="font-weight:bold;">${item.quantity}</span>
                    <button class="qty-btn" data-action="qty-plus" data-title="${item.title}">+</button>
                </div>
            `;
            cartContainer.appendChild(itemElement);
        });
    }

    const total = isPromo420Active ? subtotal * 0.60 : subtotal;

    if (cartCountBadge) cartCountBadge.innerText = totalItems;
    if (subtotalElement) subtotalElement.innerText = `$${subtotal.toLocaleString()} MXN`;
    if (cartTotalElement) cartTotalElement.innerText = `$${total.toLocaleString()} MXN`;
}

export function sendWhatsAppOrder() {
    const { cart, currentUserProfile, isPromo420Active } = store.getState();

    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let total = isPromo420Active ? subtotal * 0.60 : subtotal;

    let message = "¡Hola Aeroshop! 🚀 Quisiera realizar el siguiente pedido:\n\n";
    cart.forEach(item => {
        message += `• *${item.title}* (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString()} MXN\n`;
    });

    if (isPromo420Active) {
        message += `\n🔥 *Descuento 420 Aplicado (40% OFF)*`;
    }

    if (currentUserProfile) {
        message += `\n\n--- 🎟️ PASAPORTE AEROSHOP ---`;
        message += `\n*Pasajero:* ${currentUserProfile.displayName || 'Pasajero'}`;
        message += `\n*ID Cliente:* #USR-${currentUserProfile.uid.slice(-5).toUpperCase()}`;
    }

    message += `\n\n*TOTAL A PAGAR:* $${total.toLocaleString()} MXN`;

    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

// Escuchar cambios de estado para actualizar interfaz
store.subscribe(renderCart);