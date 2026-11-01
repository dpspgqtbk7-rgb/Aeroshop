// js/modules/diagnostico.js — guarda los últimos errores del sitio para poder revisarlos.
// Ver: abre la página con ?debug=1 (aparece un botón 🐞 con el reporte y "Copiar").
const KEY = 'aeroshop-errores';
const MAX = 20;

function leer() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
function escribir(l) { try { localStorage.setItem(KEY, JSON.stringify(l.slice(-MAX))); } catch (e) {} }

function registrar(tipo, msg, extra) {
    const l = leer();
    l.push({ t: new Date().toISOString(), tipo, msg: String(msg || '').slice(0, 300), extra: String(extra || '').slice(0, 300), url: location.pathname });
    escribir(l);
}

export function iniciarDiagnostico() {
    window.addEventListener('error', (e) => registrar('error', e.message, (e.filename || '') + ':' + (e.lineno || '')));
    window.addEventListener('unhandledrejection', (e) => registrar('promesa', e.reason && (e.reason.message || e.reason)));
    if (new URLSearchParams(location.search).get('debug') === '1') mostrarPanel();
}

function mostrarPanel() {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = '🐞';
    b.setAttribute('aria-label', 'Diagnóstico');
    b.style.cssText = 'position:fixed;bottom:80px;left:12px;z-index:99999;width:44px;height:44px;border-radius:50%;border:0;font-size:20px;background:#fff;box-shadow:0 2px 8px #0005';
    b.onclick = () => {
        const l = leer();
        const texto = 'AEROSHOP diagnóstico\n' + navigator.userAgent + '\n\n' +
            (l.length ? l.map(x => `${x.t} [${x.tipo}] ${x.msg} ${x.extra}`).join('\n') : 'Sin errores guardados ✅');
        const box = document.createElement('div');
        box.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#000d;color:#fff;padding:16px;overflow:auto;font:12px/1.4 monospace;white-space:pre-wrap';
        box.textContent = texto;
        const copiar = document.createElement('button');
        copiar.textContent = 'Copiar'; copiar.style.cssText = 'position:sticky;top:0;margin-right:8px;padding:8px 14px';
        copiar.onclick = () => { try { navigator.clipboard.writeText(texto); copiar.textContent = '¡Copiado!'; } catch (e) {} };
        const limpiar = document.createElement('button');
        limpiar.textContent = 'Borrar'; limpiar.style.cssText = 'position:sticky;top:0;margin-right:8px;padding:8px 14px';
        limpiar.onclick = () => { escribir([]); box.remove(); };
        const cerrar = document.createElement('button');
        cerrar.textContent = 'Cerrar'; cerrar.style.cssText = 'position:sticky;top:0;padding:8px 14px';
        cerrar.onclick = () => box.remove();
        box.prepend(cerrar); box.prepend(limpiar); box.prepend(copiar);
        document.body.appendChild(box);
    };
    document.body.appendChild(b);
}
