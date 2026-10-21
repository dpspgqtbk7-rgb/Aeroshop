// ui.js

export function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, function(tag) {
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
        } catch (e) {}
    }
}

export function showToast(mensaje, tipo = 'success') {
    vibrar(20);
    const toast = document.createElement('div');
    toast.className = `toast-notification ${tipo === 'error' ? 'error' : ''}`;
    toast.innerText = mensaje;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

let savedScrollPosition = 0;

export function saveMainScrollPosition() {
    // Solo registra la posición si el body no tiene activo un modal previo
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

export function closeModalState() {
    // Revisa si queda algún overlay o pantalla completa activa
    const activeOverlays = document.querySelectorAll(
        '.product-modal-overlay.active, .info-modal-overlay.active, .cart-overlay.active, .cart-overlay[style*="flex"], .monchis-fullscreen-view.active, .rutas-fullscreen-view.active, .brand-fullscreen-view.active, .emergency-fullscreen-view.active, #promoModal.active, #loginModal.active, #profileModal.active, #buzonModalOverlay.active, #faqModalOverlay.active'
    );
    
    if (activeOverlays.length === 0) {
        document.body.classList.remove('modal-open');
        restoreMainScrollPosition();
    }
}