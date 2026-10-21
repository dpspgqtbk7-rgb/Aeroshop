// js/modules/experiences.js
import { store } from '../core/store.js';
import { toggleBrownNoise } from './emergency.js';

// --- BASE DE DATOS DE TARJETAS (SPOT, MONCHIS, CINE Y MÚSICA) ---
export const cardModalData = {
    // 01. RUTAS DE VUELO
    'lagoalgo': {
        video: './lago-algo.MP4',
        badge: '📍 Poniente • ✈️✈️✈️✈️✈️',
        title: 'LagoAlgo — Bosque de Chapultepec',
        subtitle: 'Galería de arte contemporáneo & restaurante frente al lago.',
        description: 'Un espacio arquitectónico impresionante rodeado de naturaleza e instalaciones artísticas. Ideal para caminar tranquilamente y disfrutar de una vista relajante.',
        recommendation: 'Tip: Visítalo entre semana por la tarde para disfrutar la luz del atardecer.'
    },
    'cenart': {
        video: './cenart-hero.mp4',
        badge: '📍 Sur • ✈️✈️✈️✈️',
        title: 'CENART (Centro Nacional de las Artes)',
        subtitle: 'Áreas verdes, arquitectura vibrante y eventos culturales.',
        description: 'Amplios jardines para acostarse a escuchar música o leer rodeado de la arquitectura icónica de Ricardo Legorreta.',
        recommendation: 'Tip: Lleva una manta y snacks suaves.'
    },
    'chapultepec': {
        video: './chapultepec.mp4',
        badge: '📍 Poniente • ✈️✈️✈️✈️',
        title: 'Cineteca de Chapultepec',
        subtitle: 'Cine al aire libre y paisajes boscosos.',
        description: 'Ubicada en la 4ª Sección del Bosque de Chapultepec. Foro al aire libre y andadores entre árboles.',
        recommendation: 'Tip: Consulta la cartelera gratuita de fin de semana.'
    },
    'laguna': {
        video: './LAGUNA.MP4',
        badge: '📍 Centro • ✈️✈️✈️✈️',
        title: 'Laguna CDMX',
        subtitle: 'Fábrica textil recuperada en la Doctores.',
        description: 'Ecosistema creativo con diseño, café de especialidad y ambiente industrial-urbano.',
        recommendation: 'Tip: Pide un café frío y recorre los talleres.'
    },
    'jardin': {
        video: './jardin.mp4',
        badge: '📍 Poniente • ✈️✈️✈️',
        title: 'Jardín Escénico Chapultepec',
        subtitle: 'Rincón escondido de paz y pabellones escénicos.',
        description: 'Un espacio moderno rodeado de humedales urbanos cerca de Auditorio.',
        recommendation: 'Tip: Camina por los senderos elevados.'
    },
    'eden': {
        video: './eden.mp4',
        badge: '📍 Sur • ✈️✈️✈️',
        title: 'Jardín El Edén CU',
        subtitle: 'Oasis universitario en Ciudad Universitaria.',
        description: 'Rincón verde y tranquilo rodeado de roca volcánica y vegetación nativa del Pedregal.',
        recommendation: 'Tip: Mantén la discreción y respeta el espacio.'
    },
    'soumaya': {
        video: './soumaya.mp4',
        badge: '📍 Poniente • ✈️✈️✈️✈️',
        title: 'Museo Soumaya',
        subtitle: 'Arquitectura futurista y recorrido visual.',
        description: 'Estructura de hexágonos de aluminio con entrada gratuita y salas llenas de arte.',
        recommendation: 'Tip: Empieza por el último piso y ve bajando por la rampa.'
    },
    'muac': {
        video: './muac.mp4',
        badge: '📍 Sur • ✈️✈️✈️✈️✈️',
        title: 'MUAC CU (Museo de Arte Contemporáneo)',
        subtitle: 'Arte vanguardista y explanada cultural.',
        description: 'Exposiciones de nivel internacional con instalaciones sonoras y visuales inmersivas.',
        recommendation: 'Tip: Visita las salas de arte sonoro.'
    },

    // 02. MONCHIS
    'oreo': {
        video: './OREO.MP4',
        badge: '🏠 Casa • 🍩 Dulce',
        title: 'Oreo Fritas Crujientes 🍪🔥',
        subtitle: 'Receta express para el monchis dulce definitivo.',
        description: 'Galletas Oreo capeadas en mezcla para hot cakes, fritas hasta lograr un dorado crujiente por fuera y centro derretido.',
        recommendation: 'Acompaña con azúcar glass o cajeta derretida.'
    },
    'cotorras': {
        video: './cotorras.MP4',
        badge: '📍 Centro • 🍿 Salado',
        title: 'Las Cotorras 🌮🍻',
        subtitle: 'Tacos generosos en la Zona Centro.',
        description: 'Especialistas en tacos de guisado abundantes con salsas caseras para calmar cualquier monchis.',
        recommendation: 'Recomendado: Tacos con queso fundido y salsa frita.'
    },
    'salchicha_hawaiana': {
        video: './salchicha.MP4',
        badge: '🏠 Casa • 🍿 Salado',
        title: 'Salchichas Hawaianas Glaseadas 🌭🍍',
        subtitle: 'Mezcla agridulce caliente en 10 minutos.',
        description: 'Salchichas doradas con piña en almíbar, catsup, soya y un toque de chipotle.',
        recommendation: 'Sirve bien caliente con galletas saladas.'
    },
    'pan_muerto': {
        video: './pan-de-muerto.MP4',
        badge: '🏠 Casa • 🍩 Dulce',
        title: 'Pan de Muerto Relleno 🍞🍫',
        subtitle: 'Transformación épica de pan tradicional.',
        description: 'Abre el pan por la mitad y rellénalo con helado de vainilla, Nutella o conejito Turín.',
        recommendation: 'Calienta el pan 10 segundos antes de colocar el helado.'
    },
    'losperros': {
        video: './losperros.MP4',
        badge: '📍 Sur • 🍿 Salado',
        title: 'Los Perros de San Antonio 🌭',
        subtitle: 'Hot dogs monumentales.',
        description: 'Hot dogs con tocino crujiente, cebolla caramelizada y quesos fundidos.',
        recommendation: 'Ubicación: Cerca de Ciudad de los Deportes.'
    },
    'burgergate': {
        video: './burgerg.mp4',
        badge: '📍 Centro • 🍿 Salado',
        title: 'Burger Gate 🍔',
        subtitle: 'Smash burgers ultra jugosas.',
        description: 'Hamburguesas con bordes dorados crujientes, cheddar derretido y pan brioche.',
        recommendation: 'Pide la smash doble con tocino.'
    },
    'pizzadog': {
        video: './pizza-dog.MP4',
        badge: '🏠 Supervivencia en Casa • 🍿 Salado',
        title: 'PizzaDog Express 🌭🍕',
        subtitle: 'Fusión de hot dog y pizza.',
        description: 'Pan de hot dog con salchicha, salsa para pizza, mozzarella y pepperoni gratinado.',
        recommendation: 'Hornea 5 minutos a 200°C hasta gratinar.'
    },
    'sandwich': {
        video: './sandwich.MP4',
        badge: '🏠 Supervivencia en Casa • 🍿 Salado',
        title: 'Sándwich Monchoso de 3 Pisos 🥪',
        subtitle: 'Torre de sabor en pan tostado.',
        description: 'Pan tostado con mantequilla, jamón, manchego, tocino, aguacate y huevo estrellado.',
        recommendation: 'Corta en diagonales para sostener la torre.'
    },
    'salchichas': {
        video: './salchichasbbq.MP4',
        badge: '🏠 Supervivencia en Casa • 🧂 Salado',
        title: 'Salchichas BBQ de Ricardo Pérez 🌭',
        subtitle: 'Botana rápida y sabrosa.',
        description: 'Salchichas en espiral fritas en mantequilla con salsa BBQ, inglesa y limón.',
        recommendation: 'Acompaña con papas o totopos.'
    },

    // 03. CINE
    'robots': {
        video: './robots.MP4',
        badge: '🎬 Antología Animada • ✈️✈️✈️✈️✈️',
        title: 'LOVE, DEATH & ROBOTS 🤖🌀',
        subtitle: 'Disponible en Netflix.',
        description: 'Cortometrajes animados en diversos estilos visuales con historias de ciencia ficción y cyberpunk.',
        recommendation: 'Episodios clave: "The Witness", "Zima Blue", "Jibaro".'
    },
    'congreso': {
        video: './congreso.MP4',
        badge: '🎬 Animación Surrealista • ✈️✈️✈️✈️✈️',
        title: 'THE CONGRESS (2013) 👁️🎭',
        subtitle: 'Dirigida por Ari Folman.',
        description: 'Una historia que se transforma en un mundo animado psicodélico donde la realidad se disuelve.',
        recommendation: 'Experiencia visual profunda e introspectiva.'
    },
    'grasa_fria': {
        video: './grasa-fria.MP4',
        badge: '🎬 Comedia Absurda & Risas • ✈️✈️✈️',
        title: 'CHILLED GREESE 🍟🚗',
        subtitle: 'Comedia delirante.',
        description: 'Secuencias cómicas impredecibles ideales para reír sin esfuerzo.',
        recommendation: 'Ideal para ver en grupo durante el bajón.'
    },
    'pastoral': {
        video: './pastoral.MP4',
        badge: '🎬 Drama Experimental • ✈️✈️✈️✈️✈️',
        title: 'PASTORAL: TO DIE IN THE COUNTRY 👁️',
        subtitle: 'Dirigida por Shūji Terayama.',
        description: 'Obra maestra del cine psicodélico japonés con colores saturados y surrealismo.',
        recommendation: 'Para amantes del cine de arte.'
    },
    'neotokyo': {
        video: './neotokyo.mp4',
        badge: '🎬 Animación Experimental • ✈️✈️✈️✈️',
        title: 'NEO TOKYO (1987) 🚀',
        subtitle: 'Antología de anime de culto.',
        description: 'Historias de animación vanguardista cyberpunk dirigidas por maestros del anime.',
        recommendation: 'Excelente banda sonora de sintetizadores.'
    },
    'dandadan': {
        video: './dandadan.MP4',
        badge: '🎬 Comedia Absurda • ✈️✈️✈️✈️✈️',
        title: 'DANDADAN 👾🛸',
        subtitle: 'Serie en emisión.',
        description: 'Alienígenas, fantasmas y batallas frenéticas con animación fluida cargada de neón.',
        recommendation: 'Gran dinamismo visual.'
    },
    'void': {
        video: './VOID.MP4',
        badge: '🎬 Psicodélica & Inmersiva • ✈️✈️✈️✈️✈️',
        title: 'ENTER THE VOID (2009) 🏙️🌀',
        subtitle: 'Dirigida por Gaspar Noé.',
        description: 'Un viaje en primera persona flotando sobre las luces de neón de Tokio.',
        recommendation: 'Carga visual e hipnótica.'
    },
    'belladonna': {
        video: './BELLADONNA.MP4',
        badge: '🎬 Anime Psicodélico • ✈️✈️✈️✈️✈️',
        title: 'BELLADONNA OF SADNESS (1973) 🌸👁️',
        subtitle: 'Clásico de animación.',
        description: 'Ilustraciones de acuarela fluidas con banda sonora de jazz psicodélico.',
        recommendation: 'Pieza artística de culto.'
    },
    'puparia': {
        video: './PUPARIA.MP4',
        badge: '🍿 Cortometraje Anime • ✈️✈️✈️✈️✈️',
        title: 'PUPARIA 👁️✨',
        subtitle: 'Creado por Shingo Tamagawa.',
        description: 'Tres minutos de animación independiente minuciosamente dibujada a mano.',
        recommendation: 'Disponible en YouTube.'
    },
    'goodtrip': {
        video: './GOOD-TRIP.MP4',
        badge: '🍿 Documental & Comedia • ✈️✈️✈️✈️',
        title: 'HAVE A GOOD TRIP 🍄🧠',
        subtitle: 'Disponible en Netflix.',
        description: 'Celebridades relatan sus vivencias psicodélicas acompañadas de animaciones cómicas.',
        recommendation: 'Ligero y divertido.'
    },
    'entergalactic': {
        video: './ENTERGALACTIC.MP4',
        badge: '🎨 Animación & Romance Urbano • ✈️✈️✈️✈️',
        title: 'ENTERGALACTIC 🎨🌌',
        subtitle: 'Creado por Kid Cudi.',
        description: 'Explosión de color y música que sigue una historia de amor en Nueva York.',
        recommendation: 'Usar audífonos o sonido estéreo.'
    },

    // 04. MÚSICA
    'dubside': {
        image: './dub.png',
        badge: '🎧 Reggae / Dub • ✈️✈️✈️✈️✈️',
        title: 'DUB SIDE OF THE MOON',
        subtitle: 'Easy Star All-Stars',
        description: 'Tributo en clave Dub al legendario álbum de Pink Floyd. Bajos profundos y ecos envolventes.',
        recommendation: 'Escúchalo completo con audífonos.'
    }
};

// --- GESTIÓN DE VISTAS Y MODALES ---
export function openRutasVuelo() { toggleFullscreenView('rutasFullscreenView', true); }
export function closeRutasVuelo() { toggleFullscreenView('rutasFullscreenView', false); }

export function openMonchisVuelo() { toggleFullscreenView('monchisFullscreenView', true); }
export function closeMonchisVuelo() { toggleFullscreenView('monchisFullscreenView', false); }

export function openCineVuelo() { toggleFullscreenView('cineFullscreenView', true); }
export function closeCineVuelo() { toggleFullscreenView('cineFullscreenView', false); }

export function openMusicVuelo() { toggleFullscreenView('musicFullscreenView', true); }
export function closeMusicVuelo() { toggleFullscreenView('musicFullscreenView', false); }

export function openEmergencyVuelo() { toggleFullscreenView('emergencyFullscreenView', true); }
export function closeEmergencyVuelo() { toggleFullscreenView('emergencyFullscreenView', false); }

function toggleFullscreenView(id, show) {
    const el = document.getElementById(id);
    if (!el) return;
    if (show) {
        el.classList.add('active');
        document.body.classList.add('modal-open');
        triggerLazyVideos(el);
    } else {
        el.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// Carga e inicio de videos
function triggerLazyVideos(container) {
    const videos = container.querySelectorAll('video');
    videos.forEach(v => {
        if (v.dataset.src && !v.src) v.src = v.dataset.src;
        v.play().catch(() => {});
    });
}

// Abrir Modal Detallado de Tarjetas
export function openCardModal(type, key) {
    const modal = document.getElementById('infoModalOverlay');
    const body = document.getElementById('infoModalBody');
    if (!modal || !body) return;

    const item = cardModalData[key];
    if (item) {
        let media = item.video 
            ? `<video src="${item.video}" controls autoplay loop muted playsinline style="width:100%; max-height:300px; border-radius:16px; object-fit:cover; margin-bottom:16px;"></video>`
            : `<img src="${item.image}" style="width:100%; max-height:300px; border-radius:16px; object-fit:cover; margin-bottom:16px;">`;

        body.innerHTML = `
            ${media}
            <span class="badge-tag" style="margin-bottom:8px; display:inline-block;">${item.badge}</span>
            <h2 style="font-size:1.5rem; font-weight:800; color:#fff; margin-bottom:4px;">${item.title}</h2>
            ${item.subtitle ? `<p style="color:#facc15; font-size:0.9rem; font-weight:700; margin-bottom:12px;">${item.subtitle}</p>` : ''}
            <div style="background:rgba(255,255,255,0.06); padding:14px; border-radius:12px; margin-bottom:14px; border-left:4px solid #facc15;">
                <p style="color:#e2e8f0; font-size:0.92rem; line-height:1.5; margin:0;">${item.description}</p>
            </div>
            ${item.recommendation ? `<p style="color:#38bdf8; font-size:0.85rem; font-weight:600;">💡 ${item.recommendation}</p>` : ''}
        `;
    }
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

export function closeInfoModal() {
    const modal = document.getElementById('infoModalOverlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

export function closeInfoModalOnOverlay(e) {
    if (e.target === e.currentTarget) closeInfoModal();
}

// --- TAB Y FILTROS MONCHIS ---
export function switchMonchisTab(tab) {
    const btnCalle = document.getElementById('tabCalleBtn');
    const btnCasa = document.getElementById('tabCasaBtn');
    const fCalle = document.getElementById('filtersCalle');
    const fCasa = document.getElementById('filtersCasa');

    if (tab === 'calle') {
        if (btnCalle) btnCalle.classList.add('active');
        if (btnCasa) btnCasa.classList.remove('active');
        if (fCalle) fCalle.style.display = 'flex';
        if (fCasa) fCasa.style.display = 'none';
    } else {
        if (btnCasa) btnCasa.classList.add('active');
        if (btnCalle) btnCalle.classList.remove('active');
        if (fCalle) fCalle.style.display = 'none';
        if (fCasa) fCasa.style.display = 'flex';
    }
    filterMonchisCards();
}

export function filterMonchisCards() {
    const isCalle = document.getElementById('tabCalleBtn')?.classList.contains('active');
    const cards = document.querySelectorAll('#monchisGrid .compact-card');
    const targetType = isCalle ? 'calle' : 'casa';

    const zVal = document.getElementById('filterZona')?.value || 'todos';
    const aCalleVal = document.getElementById('filterAntojoCalle')?.value || 'todos';
    const aCasaVal = document.getElementById('filterAntojoCasa')?.value || 'todos';

    cards.forEach(card => {
        const cTipo = card.dataset.tipo;
        const cZona = card.dataset.zona;
        const cAntojo = card.dataset.antojo;

        let match = (cTipo === targetType);
        if (isCalle) {
            if (zVal !== 'todos') match = match && (cZona === zVal);
            if (aCalleVal !== 'todos') match = match && (cAntojo === aCalleVal);
        } else {
            if (aCasaVal !== 'todos') match = match && (cAntojo === aCasaVal);
        }

        card.style.display = match ? 'block' : 'none';
    });
}

export function filterCineCards() {
    const val = document.getElementById('filterCategoriaCine')?.value || 'todos';
    document.querySelectorAll('#cineGrid .monchis-card').forEach(card => {
        card.style.display = (val === 'todos' || card.dataset.categoria === val) ? 'block' : 'none';
    });
}

export function filterMusicCards() {
    const val = document.getElementById('filterCategoriaMusic')?.value || 'todos';
    document.querySelectorAll('#musicGrid .music-card').forEach(card => {
        card.style.display = (val === 'todos' || card.dataset.categoria === val) ? 'block' : 'none';
    });
}

// --- MARCAS FULLSCREEN ---
export function openFullscreenBrand(brand) {
    const view = document.getElementById('brandFullscreenView');
    const content = document.getElementById('brandFullscreenContent');
    if (!view || !content) return;

    content.innerHTML = `
        <div class="brand-hero-common" style="background:#090d16; color:#fff; min-height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <h1 style="font-size:2.5rem; text-transform:uppercase; font-family:'Space Grotesk';">${brand}</h1>
            <p style="color:#94a3b8; margin-top:10px;">Catálogo Oficial & Ediciones Limitadas</p>
        </div>
    `;
    view.classList.add('active');
    document.body.classList.add('modal-open');
}

export function closeFullscreenBrand() {
    const view = document.getElementById('brandFullscreenView');
    if (view) {
        view.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// --- MODALES AUXILIARES (BUZÓN, FAQ, PROMO, PERFIL) ---
export function openBuzonModal() { toggleModal('buzonModalOverlay', true); }
export function closeBuzonModal() { toggleModal('buzonModalOverlay', false); }
export function closeBuzonOnOverlay(e) { if (e.target === e.currentTarget) closeBuzonModal(); }

export function openFaqModal() { toggleModal('faqModalOverlay', true); }
export function closeFaqModal() { toggleModal('faqModalOverlay', false); }
export function closeFaqOnOverlay(e) { if (e.target === e.currentTarget) closeFaqModal(); }

export function cerrarPromo() { toggleModal('promoModal', false); }
export function irALoginDesdePromo() { cerrarPromo(); toggleModal('loginModal', true); }
export function cerrarLogin() { toggleModal('loginModal', false); }

export function abrirPerfilOClick() {
    const { currentUserProfile } = store.getState();
    if (currentUserProfile) {
        toggleModal('profileModal', true);
    } else {
        toggleModal('loginModal', true);
    }
}
export function cerrarPerfil() { toggleModal('profileModal', false); }

export function guardarDatosPerfil() {
    alert("¡Datos guardados en tu Pasaporte Digital!");
}

export function sendBuzonWhatsApp(e) {
    e.preventDefault();
    const tipo = document.getElementById('buzonTipo')?.value || '';
    const nombre = document.getElementById('buzonNombre')?.value || 'Pasajero';
    const msg = document.getElementById('buzonMensaje')?.value || '';

    const text = `📬 *BUZÓN AEROSHOP*\n*Tipo:* ${tipo}\n*De:* ${nombre}\n*Mensaje:* ${msg}`;
    window.open(`https://wa.me/525561446446?text=${encodeURIComponent(text)}`, '_blank');
    closeBuzonModal();
}

function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (show) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    } else {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// --- RESPIRACIÓN GUIADA (PARA LA PÁLIDA) ---
let breathingTimer = null;
let isBreathingActive = false;

export function toggleBreathingGuide() {
    const circle = document.getElementById('breathingCircle');
    const status = document.getElementById('btnBreathingToggle');
    if (!circle) return;

    if (isBreathingActive) {
        clearTimeout(breathingTimer);
        isBreathingActive = false;
        circle.className = 'breathing-circle';
        if (status) status.innerText = '▶️ Iniciar Respiración Guiada';
        return;
    }

    isBreathingActive = true;
    let step = 0;

    const cycle = () => {
        if (!isBreathingActive) return;
        if (step === 0) {
            circle.className = 'breathing-circle inhale';
            if (status) status.innerText = '🫁 Inhala (4s)...';
            step = 1;
            breathingTimer = setTimeout(cycle, 4000);
        } else if (step === 1) {
            circle.className = 'breathing-circle hold';
            if (status) status.innerText = '⏸️ Sostén (4s)...';
            step = 2;
            breathingTimer = setTimeout(cycle, 4000);
        } else {
            circle.className = 'breathing-circle exhale';
            if (status) status.innerText = '😮‍💨 Exhala (6s)...';
            step = 0;
            breathingTimer = setTimeout(cycle, 6000);
        }
    };
    cycle();
}

// Slider Hover en Tarjetas de Productos
let sliderTimer = null;
export function startHoverSlider(container) {
    const media = container.querySelectorAll('img, video');
    if (media.length <= 1) return;
    let idx = 0;

    stopHoverSlider(container);
    sliderTimer = setInterval(() => {
        media[idx].classList.remove('active');
        idx = (idx + 1) % media.length;
        media[idx].classList.add('active');
        if (media[idx].tagName === 'VIDEO') media[idx].play().catch(() => {});
    }, 1800);
}

export function stopHoverSlider(container) {
    if (sliderTimer) {
        clearInterval(sliderTimer);
        sliderTimer = null;
    }
}

// Compartir
export function compartirContenido(title, text, desc) {
    if (navigator.share) {
        navigator.share({ title, text: `${text} - ${desc}`, url: window.location.href }).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('¡Enlace copiado al portapapeles!');
    }
}