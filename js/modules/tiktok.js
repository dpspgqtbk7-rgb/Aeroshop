// js/modules/tiktok.js
// "Modo TikTok": ver los videos de una sección en pantalla completa, deslizando hacia arriba
import { experiencesData } from './data.js';
import { showToast } from '../ui.js';

const SECCIONES = {
    rutasFullscreenView: { tipo: 'rutas', titulo: 'Rutas de Vuelo ✈️' },
    monchisFullscreenView: { tipo: 'monchis', titulo: 'Monchis 🌮' },
    cineFullscreenView: { tipo: 'cine', titulo: 'Trip Visual & Cine 🎬' },
};
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const corto = (t, n = 110) => { t = String(t || '').trim(); return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t; };

let feed = null, io = null, conSonido = true;

function tarjetasVisibles(vista) {
    return [...vista.querySelectorAll('.compact-card')].filter(c => c.offsetParent !== null && !c.classList.contains('vb-off'))
        .map(c => {
            const m = (c.getAttribute('onclick') || '').match(/openCardModal\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/);
            const v = c.querySelector('video');
            const src = v && (v.getAttribute('data-src') || v.getAttribute('src') || (v.querySelector('source') || {}).getAttribute?.('data-src'));
            if (!m || !src) return null;
            const item = (experiencesData[m[1]] || {})[m[2]] || {};
            return { tipo: m[1], id: m[2], src, item, titulo: item.title || (c.querySelector('h4') || {}).textContent || '', badge: item.badge || (c.querySelector('.badge-tag') || {}).textContent || '' };
        }).filter(Boolean);
}

function slideHTML(s, i, total) {
    const texto = corto(s.item.resena || s.item.bitacora || s.item.preparacion || s.item.tipo || '');
    return `
    <section class="tt-slide" data-i="${i}">
        <video class="tt-video" data-src="${esc(s.src)}" loop muted playsinline webkit-playsinline preload="none"></video>
        <div class="tt-shade"></div>
        <div class="tt-info">
            <span class="tt-badge">${esc(s.badge)}</span>
            <h3>${esc(s.titulo)}</h3>
            ${texto ? `<p>${esc(texto)}</p>` : ''}
            <button type="button" class="tt-more" data-tt="info" data-tipo="${esc(s.tipo)}" data-id="${esc(s.id)}">Ver ficha completa →</button>
        </div>
        <div class="tt-rail">
            <button type="button" class="tt-act" data-tt="sound" aria-label="Sonido"><span class="tt-ico">🔊</span><small>Sonido</small></button>
            <button type="button" class="tt-act" data-tt="info" data-tipo="${esc(s.tipo)}" data-id="${esc(s.id)}" aria-label="Ver ficha"><span class="tt-ico">ℹ️</span><small>Ficha</small></button>
            ${s.item.mapsUrl ? `<a class="tt-act" href="${esc(s.item.mapsUrl)}" target="_blank" rel="noopener" aria-label="Abrir en Maps"><span class="tt-ico">📍</span><small>Maps</small></a>` : ''}
            <button type="button" class="tt-act" data-tt="share" data-titulo="${esc(s.titulo)}" aria-label="Compartir"><span class="tt-ico">↗️</span><small>Compartir</small></button>
        </div>
        <span class="tt-count">${i + 1} / ${total}</span>
        ${i === 0 ? '<span class="tt-swipe">Desliza hacia arriba ☝️</span>' : ''}
    </section>`;
}

function reproducir(slide) {
    feed.querySelectorAll('.tt-video').forEach(v => { if (!slide.contains(v)) v.pause(); });
    const cargar = (s) => { const v = s && s.querySelector('.tt-video'); if (v && !v.src) { v.src = v.dataset.src; v.load(); } return v; };
    const v = cargar(slide);
    cargar(slide.nextElementSibling);
    if (!v) return;
    v.muted = !conSonido;
    const p = v.play();
    if (p && p.catch) p.catch(() => {
        // El navegador no dejó sonar: seguimos en silencio y el botón 🔇 lo activa
        conSonido = false; actualizarIconos(); v.muted = true; v.play().catch(() => {});
    });
}

function actualizarIconos() {
    if (feed) feed.querySelectorAll('[data-tt="sound"] .tt-ico').forEach(i => { i.textContent = conSonido ? '🔊' : '🔇'; });
}

function cerrar() {
    if (!feed) return;
    if (io) io.disconnect();
    feed.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
    feed.remove(); feed = null;
    document.removeEventListener('keydown', teclas);
}
function teclas(ev) { if (ev.key === 'Escape' && !document.querySelector('#infoModalOverlay.active')) cerrar(); }

export function abrirModoTikTok(vistaId) {
    const vista = document.getElementById(vistaId);
    const cfg = SECCIONES[vistaId];
    if (!vista || !cfg) return;
    const slides = tarjetasVisibles(vista);
    if (!slides.length) { showToast('No hay videos con este filtro 🛬'); return; }
    cerrar();
    feed = document.createElement('div');
    feed.className = 'tt-feed';
    feed.setAttribute('role', 'dialog');
    feed.setAttribute('aria-label', 'Modo TikTok: ' + cfg.titulo);
    feed.innerHTML = `
        <div class="tt-top">
            <button type="button" class="tt-close" data-tt="close">✕ Tarjetas</button>
            <span class="tt-title">${esc(cfg.titulo)}</span>
        </div>
        <div class="tt-scroller">${slides.map((s, i) => slideHTML(s, i, slides.length)).join('')}</div>`;
    document.body.appendChild(feed);
    const scroller = feed.querySelector('.tt-scroller');

    io = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) reproducir(en.target); });
    }, { root: scroller, threshold: 0.6 });
    feed.querySelectorAll('.tt-slide').forEach(s => io.observe(s));

    feed.addEventListener('click', ev => {
        const b = ev.target.closest('[data-tt]');
        if (!b) {
            const v = ev.target.closest('.tt-slide') && ev.target.closest('.tt-slide').querySelector('.tt-video');
            if (v && !ev.target.closest('a,button')) { v.paused ? v.play().catch(() => {}) : v.pause(); }
            return;
        }
        const accion = b.dataset.tt;
        if (accion === 'close') cerrar();
        else if (accion === 'sound') {
            conSonido = !conSonido;
            feed.querySelectorAll('.tt-video').forEach(v => { v.muted = !conSonido; });
            actualizarIconos();
        } else if (accion === 'info' && window.openCardModal) {
            feed.querySelectorAll('.tt-video').forEach(v => v.pause()); // que no suenen dos videos a la vez
            window.openCardModal(b.dataset.tipo, b.dataset.id);
        }
        else if (accion === 'share') {
            const titulo = b.dataset.titulo;
            if (navigator.share) navigator.share({ title: titulo, text: `${titulo} — míralo en AEROSHOP ✈️`, url: location.origin }).catch(() => {});
            else if (window.compartirContenido) window.compartirContenido(titulo, 'AEROSHOP CDMX', 'Míralo en AEROSHOP ✈️');
        }
    });
    document.addEventListener('keydown', teclas);
}

// Pone el interruptor "Tarjetas / Modo TikTok" arriba de cada sección con videos
export function initModoTikTok() {
    Object.keys(SECCIONES).forEach(id => {
        const vista = document.getElementById(id);
        if (!vista || vista.querySelector('.tt-toggle')) return;
        const back = vista.querySelector('.btn-back-main');
        const ancla = back ? back.parentElement : vista.firstElementChild;
        const bar = document.createElement('div');
        bar.className = 'tt-toggle';
        bar.innerHTML = `<button type="button" class="tt-tab active" aria-pressed="true">▦ Tarjetas</button><button type="button" class="tt-tab tt-go" aria-pressed="false">▶ Modo TikTok</button>`;
        bar.querySelector('.tt-go').addEventListener('click', () => abrirModoTikTok(id));
        ancla.insertAdjacentElement('afterend', bar);
    });
}
