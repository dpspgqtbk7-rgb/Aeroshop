// js/modules/experiences.js
import { experiencesData } from './data.js';
import { escapeHTML as e, openModalState, closeModalState, showToast } from '../ui.js';
import { stopAllEmergency } from './emergency.js';
import { productsData, tienePrecio } from './catalog.js';
import { store } from '../core/store.js';

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

// Imagen extra (mapa del CENART, rutas de Pumabús...) dentro de la tarjeta
function imagenExtraHTML(img) {
    if (!img) return '';
    return `
        <div style="margin:4px 0 16px;">
            <h4 style="color:#fff; margin-bottom:8px;">${e(img.titulo)}</h4>
            <a href="${e(img.src)}" target="_blank" rel="noopener">
                <img src="${e(img.src)}" alt="${e(img.titulo)}" loading="lazy" style="width:100%; border-radius:14px; border:1px solid rgba(255,255,255,0.15); background:#fff;">
            </a>
            ${img.nota ? `<p style="color:#94a3b8; font-size:0.82rem; margin-top:6px;">${e(img.nota)} (toca la imagen para verla grande)</p>` : ''}
        </div>`;
}

// Botones de "Cómo llegar" en transporte público (Google Maps, modo transporte)
function comoLlegarHTML(cl) {
    if (!cl) return '';
    const url = (origen) =>
        'https://www.google.com/maps/dir/?api=1' +
        (origen ? '&origin=' + encodeURIComponent(origen + ' CDMX') : '') +
        '&destination=' + encodeURIComponent(cl.destino + ' CDMX') +
        '&travelmode=transit';
    const chips = (cl.desde || []).map(d =>
        `<a href="${e(url(d))}" target="_blank" rel="noopener" style="display:inline-block; margin:0 8px 8px 0; padding:8px 12px; border-radius:999px; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.45); color:#7dd3fc; font-size:0.85rem; text-decoration:none;">Desde ${e(d)}</a>`
    ).join('');
    return `
        <div style="background:rgba(255,255,255,0.05); padding:14px; border-radius:12px; margin-bottom:12px;">
            <h4 style="color:#fff; margin-bottom:8px;">🚇 Cómo llegar en transporte público</h4>
            <a href="${e(url(''))}" target="_blank" rel="noopener" class="btn-add" style="display:block; text-align:center; text-decoration:none; margin-bottom:12px;">🧭 Desde donde estoy ahora</a>
            <p style="color:#94a3b8; font-size:0.82rem; margin-bottom:8px;">O sal desde un punto cercano:</p>
            ${chips}
        </div>`;
}

// Botones para ver la peli / disco en su plataforma
function linksHTML(links) {
    if (!links || !links.length) return '';
    return links.map(l =>
        `<a href="${e(l.url)}" target="_blank" rel="noopener" class="btn-add" style="display:block; text-align:center; text-decoration:none; margin-top:8px;">▶️ Ver en ${e(l.label)}</a>`
    ).join('');
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
            ${imagenExtraHTML(item.imagenExtra)}
            ${comoLlegarHTML(item.comoLlegar)}
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
            <p style="color:#e2e8f0; line-height:1.6; background:rgba(255,255,255,0.05); padding:14px; border-radius:12px; margin-bottom:12px;">${e(item.resena)}</p>
            ${linksHTML(item.links)}
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
export function filterRutas(zona, boton) {
    document.querySelectorAll('.filtros-zonas .btn-filtro').forEach(b => {
        b.classList.toggle('activo', b === boton || (!boton && b.dataset.zona === zona));
    });
    document.querySelectorAll('#rutasGrid .compact-card').forEach(c => {
        const ok = zona === 'todo' || c.dataset.zona === zona;
        c.style.display = ok ? '' : 'none';
    });
}

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

export function openMielesVuelo()  { openView('mielesFullscreenView'); }
export function closeMielesVuelo() { closeView('mielesFullscreenView'); }
export function openNubesVuelo()   { openView('nubesFullscreenView'); }
export function closeNubesVuelo()  { closeView('nubesFullscreenView'); }

export function openManualVuelo()  { openView('manualFullscreenView'); }
export function closeManualVuelo() { closeView('manualFullscreenView'); }

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
   MARCAS FULLSCREEN (cada marca con su propia interfaz)
   ========================================== */
const MARCAS = {
    muhameds: {
        nombre: 'MUHA MEDS', clase: 'brand-muhameds',
        fondo: 'radial-gradient(circle at 50% 0%, #4a3708 0%, #120d02 45%, #000 100%)',
        acento: '#d4af37', texto: '#ffffff',
        logo: './logo-muhameds.png', titulo: './MUHAMEDSINTERFAZ.png',
        lema: 'Vapes de oro para vuelos de lujo ✨',
        productos: ['muhameds2026', 'muhacmeds', 'muhamedual'],
        galeria: ['./muhameds%202026.jpg', './muhamedual3.jpg', './muhacmeds2.jpg'],
        video: './muhadual.mp4'
    },
    cookies: {
        nombre: 'COOKIES', clase: 'brand-cookies',
        fondo: 'linear-gradient(180deg, #0a9bff 0%, #0077d6 55%, #00539b 100%)',
        acento: '#ffffff', texto: '#ffffff',
        logo: './logo-cookies.png',
        lema: 'California sobre la nube 💙',
        productos: ['lebowski', 'muhacmeds'],
        galeria: ['./donutsv23.JPG']
    },
    backwoods: {
        nombre: 'BACKWOODS', clase: 'brand-backwoods',
        fondo: 'linear-gradient(180deg, #2a0707 0%, #120303 50%, #000 100%)',
        acento: '#ef4444', texto: '#ffffff',
        logo: './logo-backwoods.png',
        lema: 'Clásico de toda la vida 🔥',
        productos: [], galeria: []
    },
    donuts: {
        nombre: 'DONUTS', clase: 'brand-donuts',
        fondoImg: './fondoslog.jpg', fondo: '#7cc4f5',
        acento: '#ff4fa3', texto: '#ffffff',
        logo: './donutslogointerfaz.png',
        lema: 'Dulce, esponjosa y en las nubes ☁️🍩',
        productos: ['donutsdonitav3'],
        galeria: ['./donutsv22.JPG', './donutsv23.JPG', './donutsdonasv3.JPG'],
        video: './donuts1.mp4'
    },
    packman: {
        nombre: 'PACKMAN', clase: 'brand-packman',
        fondoImg: './packmanfondo.jpg', fondo: '#000000',
        acento: '#facc15', texto: '#ffffff',
        logo: './PACKMANSEGUNDOLOGO.png',
        lema: 'Insert coin y despega 👾',
        productos: ['packman3g'],
        galeria: ['./packmanbyAceultra1_2.png', './packman2.png', './packman3.png', './packman4.PNG'],
        video: './packmanbyaceultra.mp4'
    },
    fryd: {
        nombre: 'FRYD EXTRACTS', clase: 'brand-fryd',
        fondoImg: './frydfondo.jpg', fondo: '#1e092b',
        acento: '#a855f7', texto: '#ffffff',
        logo: './FRYD.jpg', logoRedondo: true,
        lema: 'Aterrizaje alienígena garantizado 🛸',
        productos: ['frydovni', 'besos2g'],
        galeria: ['./frydgomas2.jpg', './frydgomas3.jpg', './besos.jpg'],
        video: './frydgomas.mp4'
    }
};

function productoMarcaHTML(id) {
    const p = productsData[id];
    if (!p) return '';
    return `
        <article class="brand-product" data-action="open-product-modal" data-product-id="${e(id)}" role="button" tabindex="0">
            <img src="${e(p.image)}" alt="${e(p.title)}" loading="lazy">
            <div class="brand-product-info">
                <h3>${e(p.title)}</h3>
                <p class="brand-product-price">${tienePrecio(p) ? '$' + e(p.price) + ' MXN' : 'Consultar precio 💬'}</p>
                <div class="brand-product-actions">
                    <button type="button" class="btn-add" data-action="open-product-modal" data-product-id="${e(id)}">Ver más</button>
                    ${tienePrecio(p) ? `<button type="button" class="btn-add brand-add" data-action="add-to-cart" data-title="${e(p.title)}" data-price="${e(p.price)}" data-image="${e(p.image)}">🛒 Agregar</button>` : ''}
                </div>
            </div>
        </article>`;
}

function marcaHTML(m) {
    const bg = m.fondoImg
        ? `background:${m.fondo} url('${m.fondoImg}') center/cover no-repeat;`
        : `background:${m.fondo};`;
    const productos = m.productos.map(productoMarcaHTML).join('');
    const galeria = (m.galeria || []).map(src =>
        `<img src="${e(src)}" alt="${e(m.nombre)}" loading="lazy">`).join('');
    const video = m.video
        ? `<video data-src="${e(m.video)}" loop muted playsinline webkit-playsinline preload="metadata" controls></video>` : '';

    return `
        <div class="brand-page ${m.clase}" style="--b-acento:${m.acento}; --b-texto:${m.texto};">
            <div class="brand-bg" style="${bg}"></div>
            <section class="brand-hero">
                <img src="${e(m.logo)}" alt="${e(m.nombre)}" class="brand-hero-logo${m.logoRedondo ? ' round' : ''}">
                ${m.titulo ? `<img src="${e(m.titulo)}" alt="" class="brand-hero-title">` : `<h2 class="brand-hero-name">${e(m.nombre)}</h2>`}
                <p class="brand-hero-lema">${e(m.lema)}</p>
                <button type="button" class="scroll-down-btn" aria-label="Ver productos"
                    onclick="document.getElementById('brandProductos').scrollIntoView({behavior:'smooth'})">↓</button>
            </section>
            <section class="brand-section" id="brandProductos">
                <h2 class="brand-section-title">Productos ${e(m.nombre)}</h2>
                ${productos
                    ? `<div class="brand-products-grid">${productos}</div>`
                    : `<p class="brand-soon">🛬 Próximamente aterrizan productos de esta marca.</p>`}
            </section>
            ${(galeria || video) ? `
            <section class="brand-section">
                <h2 class="brand-section-title">Galería</h2>
                <div class="brand-gallery">${video}${galeria}</div>
            </section>` : ''}
        </div>`;
}

export function openFullscreenBrand(brandKey) {
    const view = document.getElementById('brandFullscreenView');
    const container = document.getElementById('brandFullscreenContent');
    if (!view || !container) return;

    const m = MARCAS[brandKey];
    container.innerHTML = m
        ? marcaHTML(m)
        : `<div style="padding:100px; text-align:center; color:#fff;"><h2>SECCIÓN DE MARCA</h2></div>`;
    openView('brandFullscreenView', { videos: true });
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

export function cerrarLogin() {
    delete document.getElementById('loginModal')?.dataset.desdePedido;
    closeOverlay('loginModal');
}

// Con sesión abre el Pasaporte; sin sesión abre el inicio de sesión
export function abrirPerfilOClick() {
    openOverlay(store.getState().currentUserProfile ? 'profileModal' : 'loginModal');
}
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
