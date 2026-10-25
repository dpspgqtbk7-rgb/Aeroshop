// js/ui.js

export function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, function (tag) {
        const charsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        };
        return charsToReplace[tag] || tag;
    });
}

export function vibrar(duracion = 25) {
    if ('vibrate' in navigator) {
        try {
            navigator.vibrate(duracion);
        } catch (e) { /* algunos navegadores no lo permiten */ }
    }
}

export function showToast(mensaje, tipo = 'success') {
    vibrar(20);
    const toast = document.createElement('div');
    toast.className = `toast-notification ${tipo === 'error' ? 'error' : ''}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

let savedScrollPosition = 0;

export function saveMainScrollPosition() {
    // Solo registra la posición si todavía no hay un modal abierto
    if (!document.body.classList.contains('modal-open')) {
        savedScrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    }
}

export function restoreMainScrollPosition() {
    window.scrollTo({ top: savedScrollPosition, behavior: 'instant' });
}

export function openModalState() {
    saveMainScrollPosition();
    document.body.classList.add('modal-open');
}

// Lista única de todo lo que cuenta como "ventana abierta".
const OVERLAYS_ACTIVOS = [
    '.product-modal-overlay.active',   // producto, buzón, FAQ
    '.info-modal-overlay.active',
    '.cart-overlay.active',
    '.modal-overlay.active',           // promo, login, perfil
    '.monchis-fullscreen-view.active', // monchis, cine, música
    '.rutas-fullscreen-view.active',
    '.brand-fullscreen-view.active',
    '.emergency-fullscreen-view.active'
].join(', ');

export function closeModalState() {
    if (document.querySelectorAll(OVERLAYS_ACTIVOS).length === 0) {
        document.body.classList.remove('modal-open');
        restoreMainScrollPosition();
    }
}
