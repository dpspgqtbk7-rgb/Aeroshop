// js/modules/cart.js
import { store } from '../core/store.js';

const PHONE_NUMBER = "525561446446";

// Agregar producto al carrito
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
    renderCart();
}

// Remover o decrementar producto
export function removeFromCart(title) {
    const { cart } = store.getState();
    const updatedCart = cart
        .map(item => item.title === title ? { ...item, quantity: item.quantity - 1 } : item)
        .filter(item => item.quantity > 0);

    store.setState({ cart: updatedCart });
    renderCart();
}

// Renderizar la interfaz del carrito
export function renderCart() {
    const { cart, isPromo420Active } = store.getState();
    const cartContainer = document.getElementById('cart-items-container');
    const cartCountBadge = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total-price');

    if (!cartContainer) return;

    let subtotal = 0;
    let totalItems = 0;

    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="cart-empty-msg">Tu carrito está vacío 🚀</p>';
    } else {
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            totalItems += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p>$${item.price} MXN</p>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-qty-minus" data-action="qty-minus" data-title="${item.title}">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-qty-plus" data-action="qty-plus" data-title="${item.title}">+</button>
                </div>
            `;
            cartContainer.appendChild(itemElement);
        });
    }

    const total = isPromo420Active ? subtotal * 0.60 : subtotal;

    if (cartCountBadge) cartCountBadge.innerText = totalItems;
    if (cartTotalElement) cartTotalElement.innerText = `$${total.toLocaleString()} MXN`;
}

// Enviar pedido unificado a WhatsApp
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
        message += `• *${item.title}* (x${item.quantity}) - $${item.price * item.quantity} MXN\n`;
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