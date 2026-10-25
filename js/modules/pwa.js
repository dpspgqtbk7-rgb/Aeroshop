// js/modules/pwa.js — instalación de la app en el celular (no usa Firebase)
let eventoInstalacion = null;

export function esIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function estaInstalada() {
    return window.navigator.standalone === true ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
}

export function puedeInstalar() { return !!eventoInstalacion; }

// Android/Chrome avisa cuando la app se puede instalar; guardamos el aviso para usarlo con un botón
export function capturarInstalacion(alCambiar) {
    window.addEventListener('beforeinstallprompt', (ev) => {
        ev.preventDefault();
        eventoInstalacion = ev;
        if (alCambiar) alCambiar();
    });
    window.addEventListener('appinstalled', () => {
        eventoInstalacion = null;
        if (alCambiar) alCambiar();
    });
}

export async function instalarApp() {
    if (!eventoInstalacion) return false;
    eventoInstalacion.prompt();
    try { await eventoInstalacion.userChoice; } catch (e) { /* cerró el aviso */ }
    eventoInstalacion = null;
    return true;
}
