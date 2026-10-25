// js/core/events.js
import { addToCart, increaseQuantity, removeFromCart, sendWhatsAppOrder, toggleCart } from '../modules/cart.js';
import { openProductModal, closeProductModal, addModalProductToCart } from '../modules/catalog.js';
import { toggleBrownNoise, toggleBreathingGuide } from '../modules/emergency.js';
import { showToast, vibrar, closeModalState } from '../ui.js';

// Firebase se carga solo cuando se necesita, así si falla no se cae todo el sitio.
async function conAuth(accion) {
    try {
        const auth = await import('../modules/auth.js');
        await auth[accion]();
    } catch (err) {
        console.error('Auth no disponible:', err);
        showToast('El inicio de sesión no está disponible ahora', 'error');
    }
}

export function initGlobalEvents() {
    document.addEventListener('click', (event) => {
        // Tocar el fondo oscuro del carrito lo cierra
        if (event.target.id === 'cartOverlay') {
            toggleCart(false);
            return;
        }

        // Buscar el elemento interactivo más cercano con atributo data-action
        const target = event.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;

        switch (action) {
            case 'add-to-cart': {
                const title = target.dataset.title;
                const price = parseFloat(target.dataset.price);
                const image = target.dataset.image || '';
                if (title && !isNaN(price)) {
                    addToCart(title, price, image);
                    vibrar(20);
                    showToast('🛒 Agregado al carrito');
                }
                break;
            }

            case 'add-modal-to-cart':
                addModalProductToCart();
                break;

            case 'qty-plus': {
                const title = target.dataset.title;
                if (title) increaseQuantity(title);
                break;
            }

            case 'qty-minus': {
                const title = target.dataset.title;
                if (title) removeFromCart(title);
                break;
            }

            case 'send-whatsapp':
                sendWhatsAppOrder();
                break;

            case 'toggle-cart':
                toggleCart();
                break;

            case 'open-product':
            case 'open-product-modal': {
                const id = target.dataset.id || target.dataset.productId;
                if (id) openProductModal(id);
                break;
            }

            case 'close-product':
            case 'close-product-modal':
                closeProductModal();
                break;

            case 'toggle-brown-noise':
                toggleBrownNoise();
                break;

            case 'toggle-breathing':
                toggleBreathingGuide();
                break;

            case 'login-google':
                conAuth('loginWithGoogle');
                break;

            case 'send-whatsapp-guest':
                // Seguir sin cuenta: se cierra el login y se manda el pedido en el mismo toque
                document.getElementById('loginModal')?.classList.remove('active');
                if (document.getElementById('loginModal')) delete document.getElementById('loginModal').dataset.desdePedido;
                closeModalState();
                sendWhatsAppOrder({ sinCuenta: true });
                break;

            case 'enable-push':
                import('../modules/push.js').then(m => m.activarNotificaciones())
                    .catch(() => showToast('Los avisos no están disponibles ahora', 'error'));
                break;

            case 'install-app':
                import('../modules/pwa.js').then(async (m) => {
                    await m.instalarApp();
                    import('../modules/push.js').then(p => p.renderBloquePush()).catch(() => {});
                });
                break;

            case 'login-apple':
                conAuth('loginWithApple');
                break;

            case 'logout':
                conAuth('logoutUser');
                break;

            default:
                break;
        }
    });

    // Accesibilidad: que Enter o Espacio activen los elementos role="button"
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const el = event.target.closest('[role="button"][data-action]');
        if (!el) return;
        event.preventDefault();
        el.click();
    });
}
