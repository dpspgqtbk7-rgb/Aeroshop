// js/modules/experiences.js
import { experiencesData } from './data.js';
import { escapeHTML as e, openModalState, closeModalState, showToast } from '../ui.js';
import { stopAllEmergency } from './emergency.js';

/* ==========================================
   HERRAMIENTAS INTERNAS
   ========================================== */

// Abre una ventana (modal u overlay) y bloquea el scroll del fondo
function openOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    openModalState();
    el.classList.add('active');
    return el;
}

function closeOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
    closeModalState();
    return el;
}

// Videos con carga diferida (data-src): se cargan y reproducen al abrir la vista
function cargarYReproducirVideos(contenedor) {
    if (!contenedor) return;
    contenedor.querySelectorAll('video').forEach(v => {
        if (v.dataset.src && !v.getAttribute('src')) v.src = v.dataset.src;
        v.muted = true;
        v.play().catch(() => { /* el navegador puede bloquear el autoplay */ });
    });
}

function pausarVideos(contenedor) {
    if (!contenedor) return;
    contenedor.querySelectorAll('video').forEach(v => v.pause());
}

function openView(id, { videos = false } = {}) {
    const view = openOverlay(id);
    if (!view) return null;
    view.scrollTop = 0;
    if (videos) cargarYReproducirVideos(view);
    return view;
}

function closeView(id) {
    const view = closeOverlay(id);
    pausarVideos(view);
}

/* ==========================================
   MODAL DETALLADO DE TARJETAS (INFO MODAL)
   ========================================== */
export function openCardModal(tipo, id) {
    const item = experiencesData[tipo] && experiencesData[tipo][id];
    const body = document.getElementById('infoModalBody');

    if (!item || !body) return;

    const mediaHTML = item.isVideo
        ? `<video src="${e(item.media)}" controls autoplay loop muted playsinline style="width:100%; max-height:300px; object-fit:cover; border-radius:16px; margin-bottom:15px;"></video>`
        : `<img src="${e(item.media)}" alt="${e(item.title)}" style="width:100%; max-height:300px; object-fit:cover; border-radius:16px; margin-bottom:15px;">`;

    let contentHTML = `
        <span class="badge-tag" style="margin-bottom:10px; display:inline-block;">${e(item.badge || '')}</span>
        <h2 style="font-size:1.6rem; color:#fff; margin-bottom:12px;">${e(item.title)}</h2>
        ${mediaHTML}
    `;

    const mapsBtn = item.mapsUrl
        ? `<a href="${e(item.mapsUrl)}" target="_blank" rel="noopener" class="btn-add" style="display:block; text-align:center; text-decoration:none; margin-top:15px;">📍 Abrir en Google Maps</a>`
        : '';

    if (tipo === 'rutas') {
        contentHTML += `
            <p style="color:#cbd5e1; margin-bottom:8px;"><strong>📍 Ubicación:</strong> ${e(item.zona)}</p>
            <p style="color:#cbd5e1; margin-bottom:8px;"><strong>🚇 Conexión:</strong> ${e(item.conexion)}</p>
            <p style="color:#facc15; margin-bottom:12px;"><strong>⭐ Calificación:</strong> ${e(item.calificacion)}</p>
            <p style="color:#e2e8f0; line-height:1.6; background:rgba(255,255,255,0.05); padding:14px; border-radius:12px; margin-bottom:12px;">${e(item.bitacora)}</p>
            <p style="color:#a3b899; margin-bottom:15px;"><strong>🛡️ Radar de Discreción:</strong> ${e(item.discrecion)}</p>
            ${item.extraInfo ? `<p style="color:#38bdf8; margin-bottom:15px; font-size:0.9rem;">${e(item.extraInfo)}</p>` : ''}
            ${mapsBtn}
        `;
    } else if (tipo === 'monchis') {
        if (item.ingredientes) {
            contentHTML += `
                <p style="color:#facc15; margin-bottom:12px;"><strong>⭐ Calificación:</strong> ${e(item.calificacion)}</p>
                <div style="background:rgba(255,255,255,0.05); padding:14px; border-radius:12px; margin-bottom:12px;">
                    <h4 style="color:#fff; margin-bottom:6px;">🛒 Ingredientes:</h4>
                    <p style="color:#cbd5e1; font-size:0.92rem;">${e(item.ingredientes)}</p>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:14px; border-radius:12px;">
                    <h4 style="color:#fff; margin-bottom:6px;">👨‍🍳 Preparación Paso a Paso:</h4>
                    <p style="color:#e2e8f0; font-size:0.92rem; white-space:pre-line;">${e(item.preparacion)}</p>
                </div>
            `;
        } else {
            contentHTML += `
                <p style="color:#cbd5e1; margin-bottom:8px;"><strong>📍 Ubicación:</strong> ${e(item.ubicacion)}</p>
                <p style="color:#facc15; margin-bottom:8px;"><strong>⭐ Calificación:</strong> ${e(item.calificacion)}</p>
                <p style="color:#38bdf8; margin-bottom:12px;"><strong>🔥 Tipo de Bajón:</strong> ${e(item.tipo)}</p>
                <p style="color:#e2e8f0; line-height:1.6; background:rgba(255,255,255,0.05); padding:14px; border-radius:12px; margin-bottom:12px;">${e(item.resena)}</p>
                <p style="color:#cbd5e1; margin-bottom:8px;"><strong>💰 Presupuesto:</strong> ${e(item.presupuesto)}</p>
                ${item.horario ? `<p style="color:#a3b899; margin-bottom:15px;">${e(item.horario)}</p>` : ''}
                ${mapsBtn}
            `;
        }
    } else if (tipo === 'cine' || tipo === 'music') {
        // Antes "music" no tenía formato propio y salía sin información
        contentHTML += `
            <p style="color:#cbd5e1; margin-bottom:8px;"><strong>🌀 Categoría:</strong> ${e(item.categoria)}</p>
            <p style="color:#38bdf8; margin-bottom:12px;"><strong>📺 Disponible en:</strong> ${e(item.plataforma)}</p>
            <p style="color:#e2e8f0; line-height:1.6; background:rgba(255,255,255,0.05); padding:14px; border-radius:12px;">${e(item.resena)}</p>
        `;
    }

    body.innerHTML = contentHTML;
    openOverlay('infoModalOverlay');
}

export function closeInfoModal() {
    closeOverlay('infoModalOverlay');
    // Vaciar el contenido detiene el video que estaba sonando
    const body = document.getElementById('infoModalBody');
    if (body) body.innerHTML = '';
}

export function closeInfoModalOnOverlay(event) {
    if (event.target.id === 'infoModalOverlay') closeInfoModal();
}

/* ==========================================
   VISTAS FULLSCREEN PRINCIPALES
   ========================================== */
export function openRutasVuelo()  { openView('rutasFullscreenView',  { videos: true }); }
export function closeRutasVuelo() { closeView('rutasFullscreenView'); }

export function openMonchisVuelo() {
    openView('monchisFullscreenView', { videos: true });
    filterMonchisCards(); // deja visibles solo las tarjetas de la pestaña activa
}
export function closeMonchisVuelo() { closeView('monchisFullscreenView'); }

export function openCineVuelo()  { openView('cineFullscreenView', { videos: true }); }
export function closeCineVuelo() { closeView('cineFullscreenView'); }

export function openMusicVuelo()  { openView('musicFullscreenView'); }
export function closeMusicVuelo() { closeView('musicFullscreenView'); }

export function openEmergencyVuelo() {
    openView('emergencyFullscreenView');
    document.body.classList.add('emergency-active'); // oculta botones flotantes (CSS)
}
export function closeEmergencyVuelo() {
    closeView('emergencyFullscreenView');
    document.body.classList.remove('emergency-active');
    stopAllEmergency(); // apaga el ruido marrón y la respiración guiada
}

/* ==========================================
   MARCAS FULLSCREEN
   ========================================== */
const MARCAS_GENERICAS = {
    backwoods: { name: 'BACKWOODS', logo: './logo-backwoods.png', bg: '#1c1917', color: '#f97316' }
};

export function openFullscreenBrand(brandKey) {
    const view = document.getElementById('brandFullscreenView');
    const container = document.getElementById('brandFullscreenContent');
    if (!view || !container) return;

    let brandLayout = '';
    switch (brandKey) {
        case 'muhameds':
            brandLayout = `
                <div class="theme-muhameds-full">
                    <div class="brand-hero-common">
                        <div class="muha-brand-group">
                            <img src="./logo-muhameds.png" class="muha-hero-logo" alt="Muha Meds">
                            <h2 style="font-size:2rem; color:#d4af37;">MUHA MEDS OFFICIAL</h2>
                        </div>
                    </div>
                </div>`;
            break;
        case 'cookies':
            brandLayout = `
                <div class="theme-cookies-full">
                    <div class="brand-hero-common">
                        <img src="./logo-cookies.png" class="cookies-hero-logo" alt="Cookies">
                    </div>
                </div>`;
            break;
        case 'donuts':
            brandLayout = `
                <div class="theme-donuts-full">
                    <div class="brand-hero-common">
                        <img src="./donutslogomarcas.png" class="donuts-interface-logo" alt="Donuts">
                    </div>
                </div>`;
            break;
        case 'packman':
            brandLayout = `
                <div class="theme-packman-full">
                    <div class="brand-hero-common">
                        <img src="./packmanmarcas.png" class="packman-hero-title-img" alt="Packman">
                    </div>
                </div>`;
            break;
        case 'fryd':
            // Estas dos marcas existían solo en la versión vieja del HTML; ahora viven aquí.
            brandLayout = `
                <div class="theme-fryd-full">
                    <div class="brand-hero-common">
                        <img src="./FRYD.jpg" class="fryd-hero-logo" alt="Fryd Extracts" style="max-width:240px; height:auto;">
                        <h2 style="font-size:2rem; color:#a855f7; margin-top:16px;">FRYD EXTRACTS</h2>
                    </div>
                </div>`;
            break;
        case 'backwoods': {
            const b = MARCAS_GENERICAS.backwoods;
            brandLayout = `
                <div style="background:${b.bg}; min-height:100vh; color:#fff;">
                    <div class="brand-hero-common">
                        <img src="${b.logo}" alt="Backwoods" style="max-width:240px; height:auto;">
                        <h2 style="font-size:2rem; color:${b.color}; margin-top:16px;">${b.name}</h2>
                    </div>
                </div>`;
            break;
        }
        default:
            brandLayout = `<div style="padding:100px; text-align:center; color:#fff;"><h2>SECCIÓN DE MARCA</h2></div>`;
            break;
    }

    container.innerHTML = brandLayout;
    openView('brandFullscreenView');
}

export function closeFullscreenBrand() {
    closeView('brandFullscreenView');
}

/* ==========================================
   FILTROS MONCHIS, CINE & MÚSICA
   ========================================== */
export function switchMonchisTab(tab) {
    const calleBtn = document.getElementById('tabCalleBtn');
    const casaBtn = document.getElementById('tabCasaBtn');
    const filtersCalle = document.getElementById('filtersCalle');
    const filtersCasa = document.getElementById('filtersCasa');
    const esCalle = tab === 'calle';

    if (calleBtn) calleBtn.classList.toggle('active', esCalle);
    if (casaBtn) casaBtn.classList.toggle('active', !esCalle);
    if (filtersCalle) filtersCalle.style.display = esCalle ? 'flex' : 'none';
    if (filtersCasa) filtersCasa.style.display = esCalle ? 'none' : 'flex';

    filterMonchisCards();
}

export function filterMonchisCards() {
    const isCalle = document.getElementById('tabCalleBtn')?.classList.contains('active');
    const cards = document.querySelectorAll('#monchisGrid .compact-card');

    if (isCalle) {
        const zona = document.getElementById('filterZona')?.value || 'todos';
        const antojo = document.getElementById('filterAntojoCalle')?.value || 'todos';
        cards.forEach(c => {
            if (c.dataset.tipo !== 'calle') { c.style.display = 'none'; return; }
            const matchZona = zona === 'todos' || c.dataset.zona === zona;
            const matchAntojo = antojo === 'todos' || c.dataset.antojo === antojo;
            c.style.display = (matchZona && matchAntojo) ? 'block' : 'none';
        });
    } else {
        const antojo = document.getElementById('filterAntojoCasa')?.value || 'todos';
        cards.forEach(c => {
            if (c.dataset.tipo !== 'casa') { c.style.display = 'none'; return; }
            const matchAntojo = antojo === 'todos' || c.dataset.antojo === antojo;
            c.style.display = matchAntojo ? 'block' : 'none';
        });
    }
}

export function filterCineCards() {
    const cat = document.getElementById('filterCategoriaCine')?.value || 'todos';
    document.querySelectorAll('#cineGrid .monchis-card').forEach(c => {
        c.style.display = (cat === 'todos' || c.dataset.categoria === cat) ? 'block' : 'none';
    });
}

export function filterMusicCards() {
    const cat = document.getElementById('filterCategoriaMusic')?.value || 'todos';
    document.querySelectorAll('#musicGrid .music-card').forEach(c => {
        c.style.display = (cat === 'todos' || c.dataset.categoria === cat) ? 'block' : 'none';
    });
}

/* ==========================================
   MODALES AUXILIARES (BUZÓN, FAQ, PROMO, LOGIN, PERFIL)
   ========================================== */
export function openBuzonModal()  { openOverlay('buzonModalOverlay'); }
export function closeBuzonModal() { closeOverlay('buzonModalOverlay'); }
export function closeBuzonOnOverlay(ev) { if (ev.target.id === 'buzonModalOverlay') closeBuzonModal(); }

export function sendBuzonWhatsApp(ev) {
    ev.preventDefault();
    const tipo = document.getElementById('buzonTipo')?.value || '';
    const nombre = document.getElementById('buzonNombre')?.value || 'Pasajero';
    const mensaje = document.getElementById('buzonMensaje')?.value || '';
    const text = `*📫 BUZÓN AEROSHOP*\n*Tipo:* ${tipo}\n*Nombre:* ${nombre}\n*Mensaje:* ${mensaje}`;
    window.open(`https://wa.me/525561446446?text=${encodeURIComponent(text)}`, '_blank');
    closeBuzonModal();
}

export function openFaqModal()  { openOverlay('faqModalOverlay'); }
export function closeFaqModal() { closeOverlay('faqModalOverlay'); }
export function closeFaqOnOverlay(ev) { if (ev.target.id === 'faqModalOverlay') closeFaqModal(); }

export function cerrarPromo() { closeOverlay('promoModal'); }

export function irALoginDesdePromo() {
    // Se pasa directo de la promo al login sin soltar el bloqueo del scroll
    document.getElementById('promoModal')?.classList.remove('active');
    openOverlay('loginModal');
}

export function cerrarLogin() { closeOverlay('loginModal'); }

export function abrirPerfilOClick() { openOverlay('profileModal'); }
export function cerrarPerfil()      { closeOverlay('profileModal'); }

/* ==========================================
   SLIDERS DE PRODUCTO (HOVER / TOUCH)
   ========================================== */
export function startHoverSlider(container) {
    // Si ya está corriendo no se crea otro (en celular se disparan touch + mouse a la vez)
    if (!container || container._sliderInterval) return;
    const media = container.querySelectorAll('img, video');
    if (media.length < 2) return;

    let index = Array.from(media).findIndex(m => m.classList.contains('active'));
    if (index < 0) index = 0;

    container._sliderInterval = setInterval(() => {
        media[index].classList.remove('active');
        index = (index + 1) % media.length;
        media[index].classList.add('active');
        if (media[index].tagName === 'VIDEO') media[index].play().catch(() => {});
    }, 1200);
}

export function stopHoverSlider(container) {
    if (!container || !container._sliderInterval) return;
    clearInterval(container._sliderInterval);
    container._sliderInterval = null;
    container.querySelectorAll('img, video').forEach((el, idx) => {
        el.classList.toggle('active', idx === 0);
    });
}

// Carga los videos de las tarjetas de producto solo cuando están por verse
export function initLazyVideos() {
    const videos = document.querySelectorAll('.product-img-slider video[data-src]');
    if (!videos.length) return;

    if (!('IntersectionObserver' in window)) {
        videos.forEach(v => { v.src = v.dataset.src; });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const v = entry.target;
            if (entry.isIntersecting) {
                if (!v.getAttribute('src')) v.src = v.dataset.src;
                if (v.classList.contains('active')) v.play().catch(() => {});
            } else {
                v.pause();
            }
        });
    }, { rootMargin: '200px' });

    videos.forEach(v => observer.observe(v));
}

/* ==========================================
   COMPARTIR
   ========================================== */
export async function compartirContenido(titulo, texto, url) {
    const enlace = url || window.location.href;
    if (navigator.share) {
        try {
            await navigator.share({ title: titulo, text: texto, url: enlace });
        } catch (err) { /* la persona cerró el menú de compartir */ }
        return;
    }
    try {
        await navigator.clipboard.writeText(enlace);
        showToast('📋 Enlace copiado al portapapeles');
    } catch (err) {
        showToast('No se pudo copiar el enlace', 'error');
    }
}
