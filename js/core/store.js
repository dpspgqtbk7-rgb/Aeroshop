// js/core/store.js

const CART_KEY = 'aeroshop_cart';

// Lee el carrito guardado sin romper la página si el dato está dañado.
function loadCart() {
    try {
        const raw = JSON.parse(localStorage.getItem(CART_KEY));
        if (!Array.isArray(raw)) return [];
        return raw
            .filter(i => i && typeof i.title === 'string'
                && Number.isFinite(i.price)
                && Number.isInteger(i.quantity) && i.quantity > 0)
            .map(i => ({
                title: i.title,
                price: i.price,
                image: typeof i.image === 'string' ? i.image : '',
                quantity: i.quantity
            }));
    } catch (e) {
        return [];
    }
}

class Store {
    constructor() {
        this.state = {
            cart: loadCart(),
            currentUserProfile: null,
            isPromo420Active: false
        };
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };

        // Guardar el carrito en localStorage automáticamente
        if ('cart' in newState) {
            try {
                localStorage.setItem(CART_KEY, JSON.stringify(this.state.cart));
            } catch (e) { /* modo privado o almacenamiento lleno */ }
        }

        this.listeners.forEach(listener => listener(this.state));
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
}

export const store = new Store();
