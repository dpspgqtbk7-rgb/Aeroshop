// js/core/store.js

class Store {
    constructor() {
        this.state = {
            cart: JSON.parse(localStorage.getItem('aeroshop_cart')) || [],
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
            localStorage.setItem('aeroshop_cart', JSON.stringify(this.state.cart));
        }

        // Notificar a los componentes suscritos
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