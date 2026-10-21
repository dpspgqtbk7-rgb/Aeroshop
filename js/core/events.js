// js/core/events.js
import { addToCart, removeFromCart, sendWhatsAppOrder } from '../modules/cart.js';
import { openProductModal, closeProductModal, addModalProductToCart } from '../modules/catalog.js';
import { toggleBrownNoise, toggleBreathingGuide } from '../modules/emergency.js';
import { loginWithGoogle, logoutUser } from '../modules/auth.js';

export function initGlobalEvents() {
    document.addEventListener('click', (event) => {
        // Buscar el elemento interactivo más cercano con atributo data-action
        const target = event.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;

        switch (action) {
            case 'add-to-cart': {
                const title = target.dataset.title;
                const price = parseFloat(target.dataset.price);
                const image = target.dataset.image;
                if (title && !isNaN(price)) {
                    addToCart(title, price, image);
                }
                break;
            }

            case 'add-modal-to-cart': {
                addModalProductToCart();
                break;
            }

            case 'qty-plus': {
                const title = target.dataset.title;
                const price = parseFloat(target.dataset.price || 0);
                const image = target.dataset.image || '';
                if (title) addToCart(title, price, image);
                break;
            }

            case 'qty-minus': {
                const title = target.dataset.title;
                if (title) removeFromCart(title);
                break;
            }

            case 'send-whatsapp': {
                sendWhatsAppOrder();
                break;
            }

            case 'toggle-cart': {
                const cartModal = document.getElementById('cartOverlay') || document.getElementById('cart-modal') || document.getElementById('side-cart');
                if (cartModal) {
                    cartModal.classList.toggle('active');
                    cartModal.classList.toggle('open');
                }
                break;
            }

            case 'open-product':
            case 'open-product-modal': {
                const id = target.dataset.id || target.dataset.productId;
                if (id) openProductModal(id);
                break;
            }

            case 'close-product':
            case 'close-product-modal': {
                closeProductModal();
                break;
            }

            case 'toggle-brown-noise': {
                toggleBrownNoise();
                break;
            }

            case 'toggle-breathing': {
                toggleBreathingGuide();
                break;
            }

            case 'login-google': {
                loginWithGoogle();
                break;
            }

            case 'logout': {
                logoutUser();
                break;
            }

            default:
                break;
        }
    });
}