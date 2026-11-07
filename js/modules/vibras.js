// js/modules/vibras.js
// "¿Cómo viene tu vuelo?": cada recomendación tiene su vibra y la persona filtra por la suya
const VIBRAS = {
    flotar:      { emoji: '🎈', nombre: 'Flotar',         frase: 'Cuerpo ligero, todo suave' },
    intro:       { emoji: '🌀', nombre: 'Introspectivo',  frase: 'Pensamientos profundos' },
    risa:        { emoji: '😂', nombre: 'Risa y compas',  frase: 'Todo da risa' },
    sensorial:   { emoji: '🎨', nombre: 'Sensorial',      frase: 'Colores y sonidos a tope' },
    sillon:      { emoji: '🛋️', nombre: 'Sillón',         frase: 'Cero ganas de moverse' },
    sobrepensar: { emoji: '😵‍💫', nombre: 'Sobrepensando', frase: 'Ansioso o con pálida' },
};

// Etiquetas de cada recomendación (tipo:id → vibras). Para una nueva, agrégala aquí.
const ETIQUETAS = {
    // Rutas
    'rutas:lagoalgo': ['flotar', 'intro'], 'rutas:cenart': ['sensorial', 'risa'], 'rutas:chapultepec': ['sensorial', 'risa'],
    'rutas:laguna': ['sensorial', 'risa'], 'rutas:jardin': ['flotar'], 'rutas:eden': ['flotar', 'intro'],
    'rutas:soumaya': ['sensorial'], 'rutas:muac': ['sensorial', 'intro'], 'rutas:bicentenario': ['flotar', 'risa'],
    'rutas:audiorama': ['flotar', 'intro'], 'rutas:laberinto': ['risa', 'sensorial'],
    // Monchis
    'monchis:cotorras': ['risa'], 'monchis:losperrines': ['risa'], 'monchis:losperros': ['risa', 'sillon'],
    'monchis:burgergate': ['risa', 'sillon'], 'monchis:oreo': ['sillon'], 'monchis:pan_muerto': ['sillon'],
    'monchis:pizzadog': ['sillon'], 'monchis:salchicha_hawaiana': ['sillon'], 'monchis:salchichas': ['sillon', 'risa'],
    'monchis:sandwich': ['sillon'],
    // Cine
    'cine:midnightgospel': ['intro', 'sensorial'], 'cine:robots': ['sillon', 'sensorial'], 'cine:congreso': ['intro'],
    'cine:grasa_fria': ['risa'], 'cine:entergalactic': ['flotar', 'sensorial'], 'cine:goodtrip': ['risa'],
    'cine:puparia': ['sensorial'], 'cine:belladonna': ['intro', 'sensorial'], 'cine:void': ['intro', 'sensorial'],
    'cine:dandadan': ['risa', 'sensorial'], 'cine:neotokyo': ['sensorial'], 'cine:pastoral': ['intro'],
    // Frecuencias
    'music:dubside': ['flotar', 'sillon'],
};
// Para quien viene sobrepensando: solo lo tranquilo
const CALMADO = ['flotar'];

const VISTAS = ['rutasFullscreenView', 'monchisFullscreenView', 'cineFullscreenView', 'musicFullscreenView'];
const CLAVE = 'aeroshop_vibra';
let vibraActual = '';
try { vibraActual = localStorage.getItem(CLAVE) || ''; } catch (e) {}

const claveDe = (card) => {
    const m = (card.getAttribute('onclick') || '').match(/openCardModal\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/);
    return m ? `${m[1]}:${m[2]}` : '';
};

function chipsHTML(extraClase = '') {
    return `<div class="vb-chips ${extraClase}" role="group" aria-label="Elige tu vibra">
        <button type="button" class="vb-chip" data-vibra="">✨ Todas</button>
        ${Object.entries(VIBRAS).map(([k, v]) => `<button type="button" class="vb-chip" data-vibra="${k}" title="${v.frase}">${v.emoji} ${v.nombre}</button>`).join('')}
    </div>`;
}

function aplicar() {
    const filtro = vibraActual === 'sobrepensar' ? CALMADO : (vibraActual ? [vibraActual] : null);
    VISTAS.forEach(id => {
        const vista = document.getElementById(id);
        if (!vista) return;
        vista.querySelectorAll('[onclick*="openCardModal"]').forEach(card => {
            const tags = ETIQUETAS[claveDe(card)] || [];
            card.classList.toggle('vb-off', !!filtro && !tags.some(t => filtro.includes(t)));
        });
        const aviso = vista.querySelector('.vb-calma');
        if (aviso) aviso.hidden = vibraActual !== 'sobrepensar';
    });
    document.querySelectorAll('.vb-chip').forEach(b => b.classList.toggle('active', b.dataset.vibra === vibraActual));
    const elegido = document.getElementById('vbElegido');
    if (elegido) {
        const v = VIBRAS[vibraActual];
        elegido.textContent = v ? `Tu vibra: ${v.emoji} ${v.nombre}. Las secciones ya vienen filtradas para ti.` : '';
    }
}

function elegir(vibra) {
    vibraActual = vibra;
    try { vibra ? localStorage.setItem(CLAVE, vibra) : localStorage.removeItem(CLAVE); } catch (e) {}
    aplicar();
}

export function initVibras() {
    // 1) Selector en "¿Qué nos diferencia?"
    const ancla = document.querySelector('#que-nos-diferencia .dif-cta-line');
    if (ancla && !document.getElementById('vbHub')) {
        const hub = document.createElement('div');
        hub.id = 'vbHub';
        hub.className = 'vb-hub';
        hub.innerHTML = `<p class="vb-q">¿Cómo viene tu vuelo hoy?</p>${chipsHTML('vb-chips-hub')}<p class="vb-elegido" id="vbElegido" aria-live="polite"></p>`;
        ancla.insertAdjacentElement('beforebegin', hub);
    }
    // 2) Filtro y etiquetas dentro de cada sección
    VISTAS.forEach(id => {
        const vista = document.getElementById(id);
        if (!vista || vista.querySelector('.vb-bar')) return;
        const bar = document.createElement('div');
        bar.className = 'vb-bar';
        bar.innerHTML = `<p class="vb-q">¿Cómo viene tu vuelo?</p>${chipsHTML()}
            <div class="vb-calma" hidden>💚 Tranqui, primero respira. Aquí solo te dejamos lo más calmado.
                <button type="button" class="vb-calma-btn" onclick="openEmergencyVuelo()">Abrir kit para la pálida →</button></div>`;
        const ref = vista.querySelector('.tt-toggle') || (vista.querySelector('.btn-back-main') || {}).parentElement;
        if (ref) ref.insertAdjacentElement('afterend', bar);
        vista.querySelectorAll('[onclick*="openCardModal"]').forEach(card => {
            const tags = ETIQUETAS[claveDe(card)];
            const body = card.querySelector('.compact-card-body') || card;
            if (tags && !card.querySelector('.vb-tags')) {
                const t = document.createElement('span');
                t.className = 'vb-tags';
                t.title = tags.map(k => VIBRAS[k].nombre).join(' · ');
                t.textContent = tags.map(k => VIBRAS[k].emoji).join(' ');
                body.appendChild(t);
            }
        });
    });
    document.addEventListener('click', ev => {
        const b = ev.target.closest('.vb-chip');
        if (b) elegir(b.dataset.vibra);
    });
    aplicar();
}
