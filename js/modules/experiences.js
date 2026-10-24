// js/modules/experiences.js
import { experiencesData } from './data.js';
import { openModalState, closeModalState, saveMainScrollPosition, showToast } from '../ui.js';

// --- MODAL DETALLADO DE TARJETAS (INFO MODAL) ---
export function openCardModal(tipo, id) {
    saveMainScrollPosition();
    const item = experiencesData[tipo] && experiencesData[tipo][id];
    const modal = document.getElementById('infoModalOverlay');
    const body = document.getElementById('infoModalBody');

    if (!item || !modal || !body) return;

    let mediaHTML = item.isVideo 
        ? `<video src="${item.media}" controls autoplay loop muted playsinline style="width:100%; max-height:300px; object-fit:cover; border-radius:16px; margin-bottom:15px;"></video>`
        : `<img src="${item.media}" alt="${item.title}" style="width:100%; max-height:300px; object-fit:cover; border-radius:16px; margin-bottom:15px;">`;

    let contentHTML = `
        <span class="badge-tag" style="margin-bottom:10px; display:inline-block;">${item.badge || ''}</span>
        <h2 style="font-size:1.6rem; color:#fff; margin-bottom:12px;">${item.title}</h2>
        ${mediaHTML}
    `;

    if (tipo === 'rutas') {
        contentHTML += `
            <p style="color:#cbd5e1; margin-bottom:8px;"><strong>📍 Ubicación:</strong> ${item.zona}</p>
            <p style="color:#cbd5e1; margin-bottom:8px;"><strong>🚇 Conexión:</strong> ${item.conexion}</p>
            <p style="color:#facc15; margin-bottom:12px;"><strong>⭐ Calificación:</strong> ${item.calificacion}</p>
            <p style="color:#e2e8f0; line-height:1.6; background:rgba(255,255,255,0.05); padding:14px; border-radius:12px; margin-bottom:12px;">${item.bitacora}</p>
            <p style="color:#a3b899; margin-bottom:15px;"><strong>🛡️ Radar de Discreción:</strong> ${item.discrecion}</p>
            ${item.extraInfo ? `<p style="color:#38bdf8; margin-bottom:15px; font-size:0.9rem;">${item.extraInfo}</p>` : ''}
            <a href="${item.mapsUrl}" target="_blank" class="btn-add" style="display:block; text-align:center; text-decoration:none; margin-top:15px;">📍 Abrir en Google Maps</a>
        `;
    } else if (tipo === 'monchis') {
        if (item.ingredientes) {
            contentHTML += `
                <p style="color:#facc15; margin-bottom:12px;"><strong>⭐ Calificación:</strong> ${item.calificacion}</p>
                <div style="background:rgba(255,255,255,0.05); padding:14px; border-radius:12px; margin-bottom:12px;">
                    <h4 style="color:#fff; margin-bottom:6px;">🛒 Ingredientes:</h4>
                    <p style="color:#cbd5e1; font-size:0.92rem;">${item.ingredientes}</p>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:14px; border-radius:12px;">
                    <h4 style="color:#fff; margin-bottom:6px;">👨‍🍳 Preparación Paso a Paso:</h4>
                    <p style="color:#e2e8f0; font-size:0.92rem; white-space:pre-line;">${item.preparacion}</p>
                </div>
            `;
        } else {
            contentHTML += `
                <p style="color:#cbd5e1; margin-bottom:8px;"><strong>📍 Ubicación:</strong> ${item.ubicacion}</p>
                <p style="color:#facc15; margin-bottom:8px;"><strong>⭐ Calificación:</strong> ${item.calificacion}</p>
                <p style="color:#38bdf8; margin-bottom:12px;"><strong>🔥 Tipo de Bajón:</strong> ${item.tipo}</p>
                <p style="color:#e2e8f0; line-height:1.6; background:rgba(255,255,255,0.05); padding:14px; border-radius:12px; margin-bottom:12px;">${item.resena}</p>
                <p style="color:#cbd5e1; margin-bottom:8px;"><strong>💰 Presupuesto:</strong> ${item.presupuesto}</p>
                ${item.horario ? `<p style="color:#a3b899; margin-bottom:15px;">${item.horario}</p>` : ''}
                <a href="${item.mapsUrl}" target="_blank" class="btn-add" style="display:block; text-align:center; text-decoration:none; margin-top:15px;">📍 Abrir en Google Maps</a>
            `;
        }
    } else if (tipo === 'cine') {
        contentHTML += `
            <p style="color:#cbd5e1; margin-bottom:8px;"><strong>🌀 Categoría:</strong> ${item.categoria}</p>
            <p style="color:#38bdf8; margin-bottom:12px;"><strong>📺 Disponible en:</strong> ${item.plataforma}</p>
            <p style="color:#e2e8f0; line-height:1.6; background:rgba(255,255,255,0.05); padding:14px; border-radius:12px;">${item.resena}</p>
        `;
    }

    body.innerHTML = contentHTML;
    modal.classList.add('active');
    openModalState();
}

export function closeInfoModal() {
    const modal = document.getElementById('infoModalOverlay');
    if (modal) modal.classList.remove('active');
    closeModalState();
}

export function closeInfoModalOnOverlay(event) {
    if (event.target.id === 'infoModalOverlay') {
        closeInfoModal();
    }
}

// --- VISTAS FULLSCREEN PRINCIPALES ---
export function openRutasVuelo() {
    saveMainScrollPosition();
    const v = document.getElementById('rutasFullscreenView');
    if (v) v.classList.add('active');
    openModalState();
}
export function closeRutasVuelo() {
    const v = document.getElementById('rutasFullscreenView');
    if (v) v.classList.remove('active');
    closeModalState();
}

export function openMonchisVuelo() {
    saveMainScrollPosition();
    const v = document.getElementById('monchisFullscreenView');
    if (v) v.classList.add('active');
    openModalState();
}
export function closeMonchisVuelo() {
    const v = document.getElementById('monchisFullscreenView');
    if (v) v.classList.remove('active');
    closeModalState();
}

export function openCineVuelo() {
    saveMainScrollPosition();
    const v = document.getElementById('cineFullscreenView');
    if (v) v.classList.add('active');
    openModalState();
}
export function closeCineVuelo() {
    const v = document.getElementById('cineFullscreenView');
    if (v) v.classList.remove('active');
    closeModalState();
}

export function openMusicVuelo() {
    saveMainScrollPosition();
    const v = document.getElementById('musicFullscreenView');
    if (v) v.classList.add('active');
    openModalState();
}
export function closeMusicVuelo() {
    const v = document.getElementById('musicFullscreenView');
    if (v) v.classList.remove('active');
    closeModalState();
}

export function openEmergencyVuelo() {
    saveMainScrollPosition();
    const v = document.getElementById('emergencyFullscreenView');
    if (v) v.classList.add('active');
    openModalState();
}
export function closeEmergencyVuelo() {
    const v = document.getElementById('emergencyFullscreenView');
    if (v) v.classList.remove('active');
    closeModalState();
}

// --- MARCAS FULLSCREEN INTERFAZ DEDICADA ---
export function openFullscreenBrand(brandKey) {
    saveMainScrollPosition();
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
        default:
            brandLayout = `<div style="padding:100px; text-align:center; color:#fff;"><h2>SECCIÓN DE MARCA</h2></div>`;
            break;
    }

    container.innerHTML = brandLayout;
    view.classList.add('active');
    openModalState();
}

export function closeFullscreenBrand() {
    const view = document.getElementById('brandFullscreenView');
    if (view) view.classList.remove('active');
    closeModalState();
}

// --- FILTROS MONCHIS, CINE & MÚSICA ---
export function switchMonchisTab(tab) {
    const calleBtn = document.getElementById('tabCalleBtn');
    const casaBtn = document.getElementById('tabCasaBtn');
    const filtersCalle = document.getElementById('filtersCalle');
    const filtersCasa = document.getElementById('filtersCasa');
    const cards = document.querySelectorAll('#monchisGrid .compact-card');

    if (tab === 'calle') {
        if (calleBtn) calleBtn.classList.add('active');
        if (casaBtn) casaBtn.classList.remove('active');
        if (filtersCalle) filtersCalle.style.display = 'flex';
        if (filtersCasa) filtersCasa.style.display = 'none';
        cards.forEach(c => c.style.display = c.dataset.tipo === 'calle' ? 'block' : 'none');
    } else {
        if (casaBtn) casaBtn.classList.add('active');
        if (calleBtn) calleBtn.classList.remove('active');
        if (filtersCasa) filtersCasa.style.display = 'flex';
        if (filtersCalle) filtersCalle.style.display = 'none';
        cards.forEach(c => c.style.display = c.dataset.tipo === 'casa' ? 'block' : 'none');
    }
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
    const cards = document.querySelectorAll('#cineGrid .monchis-card');
    cards.forEach(c => {
        c.style.display = (cat === 'todos' || c.dataset.categoria === cat) ? 'block' : 'none';
    });
}

export function filterMusicCards() {
    const cat = document.getElementById('filterCategoriaMusic')?.value || 'todos';
    const cards = document.querySelectorAll('#musicGrid .music-card');
    cards.forEach(c => {
        c.style.display = (cat === 'todos' || c.dataset.categoria === cat) ? 'block' : 'none';
    });
}

// --- MODALES AUXILIARES ---
export function openBuzonModal() {
    saveMainScrollPosition();
    const m = document.getElementById('buzonModalOverlay');
    if (m) m.classList.add('active');
    openModalState();
}
export function closeBuzonModal() {
    const m = document.getElementById('buzonModalOverlay');
    if (m) m.classList.remove('active');
    closeModalState();
}
export function closeBuzonOnOverlay(e) { if (e.target.id === 'buzonModalOverlay') closeBuzonModal(); }

export function sendBuzonWhatsApp(e) {
    e.preventDefault();
    const tipo = document.getElementById('buzonTipo')?.value || '';
    const nombre = document.getElementById('buzonNombre')?.value || 'Pasajero';
    const mensaje = document.getElementById('buzonMensaje')?.value || '';
    const text = `*📫 BUZÓN AEROSHOP*\n*Tipo:* ${tipo}\n*Nombre:* ${nombre}\n*Mensaje:* ${mensaje}`;
    window.open(`https://wa.me/525561446446?text=${encodeURIComponent(text)}`, '_blank');
    closeBuzonModal();
}

export function openFaqModal() {
    saveMainScrollPosition();
    const m = document.getElementById('faqModalOverlay');
    if (m) m.classList.add('active');
    openModalState();
}
export function closeFaqModal() {
    const m = document.getElementById('faqModalOverlay');
    if (m) m.classList.remove('active');
    closeModalState();
}
export function closeFaqOnOverlay(e) { if (e.target.id === 'faqModalOverlay') closeFaqModal(); }

export function cerrarPromo() {
    const m = document.getElementById('promoModal');
    if (m) m.classList.remove('active');
    closeModalState();
}
export function irALoginDesdePromo() {
    cerrarPromo();
    const l = document.getElementById('loginModal');
    if (l) l.classList.add('active');
    openModalState();
}
export function cerrarLogin() {
    const l = document.getElementById('loginModal');
    if (l) l.classList.remove('active');
    closeModalState();
}

export function abrirPerfilOClick() {
    saveMainScrollPosition();
    const p = document.getElementById('profileModal');
    if (p) p.classList.add('active');
    openModalState();
}
export function cerrarPerfil() {
    const p = document.getElementById('profileModal');
    if (p) p.classList.remove('active');
    closeModalState();
}
export function guardarDatosPerfil() {
    showToast('💾 Datos guardados en tu Pasaporte');
}

export function startHoverSlider(element) {
    const v = element.querySelector('video');
    if (v) v.play().catch(() => {});
}
export function stopHoverSlider(element) {
    const v = element.querySelector('video');
    if (v) v.pause();
}

export function compartirContenido(titulo, texto, url) {
    if (navigator.share) {
        navigator.share({ title: titulo, text: texto, url: url || window.location.href }).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('📋 Enlace copiado al portapapeles');
    }
}