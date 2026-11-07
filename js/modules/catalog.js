// js/modules/catalog.js
import { addToCart } from './cart.js';
import { openModalState, closeModalState, showToast } from '../ui.js';
import { waLink } from '../config.js';

// Base de datos oficial de productos para la vista detallada
export const productsData = {
    'cookies1g': {
        gramos: 1, marca: 'Cookies',
        title: 'Cookies 1g 💙',
        price: 400,
        image: './cookies-1g.jpg',
        description: 'Cookies Delta 8 Vape de 1G desechable 💙 Listo para usar, sin recargas. Varios sabores de la línea Cookies, como Cereal Milk Caramel y Peach Pie. Pregunta por los sabores disponibles.',
        strains: ['Cereal Milk Caramel 🥣', 'Peach Pie 🍑', 'Pregunta por más sabores 💬']
    },
    'corridostumbados': {
        gramos: 2.5, marca: 'Corridos Tumbados',
        title: 'CORRIDOS TUMBADOS × LOS CT 🔥',
        price: 790,
        image: './ace-ct-1.jpg',
        description: 'Edición Corridos Tumbados de Natanael Cano · LOS CT Records. Bolsas de colección con Liquid Diamonds 2.5G + Infused Preroll + Gummies en 7 variedades. También hay pack de 3 gomitas infusionadas (300 MG) + 1.5G premium preroll. Pregunta por disponibilidad.',
        strains: ['EL F — Acapulco', 'ENRE LAS DE 20 — Frescout Cookie', 'ORULA — Amnesia', 'CHICLONA — Bubba Kush', 'JUEVES 10 — Juice Bar', 'CARLITOS — Sour Diesel', 'TUMBADOS — Runtz']
    },
    'luigi': {
        gramos: 0.5, marca: 'ACE ULTRA',
        title: 'LUIGI',
        price: 700,
        image: './ace-luigi.jpg',
        description: 'LUIGI Infused Fattone. Dispositivo rosa con pre-roll Dream Cream (Indica) de 0.5G incluido en estuche de colección. Producto ACE ULTRA.',
        strains: ['Dream Cream — Indica 🌙', 'Pregunta por disponibilidad 💬']
    },
    'muhacajas3000': {
        gramos: 3, marca: 'Muha Meds',
        title: 'MUHA MEDS 3000 MG',
        price: 850,
        image: './ace-muha-cajas.jpg',
        description: 'Muha Meds 3000 MG (0.106 OZ). Dispositivo negro con cuatro variedades en caja de colección. Producto ACE ULTRA.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️', 'Pregunta por disponibilidad 💬']
    },
    'muhameds2000': {
        gramos: 2, marca: 'Muha Meds',
        title: 'MUHA MEDS 2000 MG',
        price: 800,
        image: './ace-muha-2026.jpg',
        description: 'Muha Meds 2000 MG (0.071 OZ). Edición negro y oro con detalles metálicos. Producto ACE ULTRA.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️', 'Pregunta por disponibilidad 💬']
    },
    'lebowski': {
        gramos: 2, marca: 'Cookies',
        title: 'Cookies × Lebowski 2g 🥃',
        price: 780,
        image: './lebo.JPG',
        description: 'Cookies × Lebowski 🥃 Dispositivo DUO de 2g (1g + 1g) con Liquid Diamonds + Live Resin. Dos vuelos en un solo equipo, edición de colección en azul Cookies. Relax total, estilo "The Dude". Pregunta por las variedades disponibles.',
        strains: ['Variedad surtida ☯️', 'Pregunta por disponibilidad 💬']
    },
    'snoopdog': {
        gramos: 3.5, marca: 'Death Row',
        title: 'Snoop Dogg × Death Row 🎤',
        price: 1200,
        image: './snoop-dog.jpg',
        description: 'Death Row Records 🔥 La edición de Snoop Dogg aterriza en la cabina: vape de 3.5 ml con dos vuelos distintos. Sour Diesel para despegar con energía y Grape Ape para bajar suave. Vibra West Coast directo a tu equipaje.',
        strains: ['Sour Diesel — Sativa 🚀', 'Grape Ape — Indica 🌙']
    },
    'muhameds2026': {
        gramos: 2, marca: 'Muha Meds',
        title: 'MUHA MEDS 2026 ✨ All-in-One',
        price: 700,
        image: './muhameds%202026.jpg',
        description: 'Muha Meds 2026 ✨ All-in-One de 2g (2000 mg) en negro y oro. Galactic Diesel, perfil Indica: relajado, aromático y con vibra espacial. Todo en un solo dispositivo, listo para despegar.',
        strains: ['Galactic Diesel — Indica 🌙']
    },
    'crybaby': {
        gramos: 2, marca: 'CryBaby',
        title: 'CryBaby 2g 🍼 + Gomitas',
        price: 800,
        image: './crybaby.jpg',
        description: 'CryBaby 🍼 2G Liquid Diamonds con Live Resin, sabor Mango Ice Cream (Híbrida). Dulce, helado y con certificado de autenticidad. Incluye gomitas Gumballs para completar la experiencia.',
        strains: ['Mango Ice Cream — Híbrida ☯️']
    },
    'frydovni': {
        gramos: 2, marca: 'FRYD',
        title: 'FRYD Ovni 🛸 + Gomitas 2g',
        price: 850,
        image: './frydgomas2.jpg',
        description: 'Edición especial FRYD Ovni con gomitas infundidas. Extracto Premium de Live Resin + Liquid Batter para una experiencia física y cerebral de alta potencia.',
        strains: ['Híbrida ☯️', 'Sativa 🚀', 'Indica 🌙']
    },
    'donutsdonitav3': {
        marca: 'Donuts',
        title: 'donuts donita v3',
        price: 500,
        antes: 850, // precio normal: mientras exista "antes", se muestra como PROMO
        image: './donusdonitav31.JPG',
        description: 'Dona Mágica ✨🪴. Extracto ultra limpio con sabores naturales y perfil terpénico refinado.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️']
    },
    'besos2g': {
        gramos: 2, marca: 'Besos',
        title: 'Besos Liquid Diamonds 2g 💋',
        price: 850,
        image: './besos.jpg',
        description: '2G Liquid Diamonds con perfil Cherry Berry Kiss. Potencia pura y sabor dulce e intenso.',
        strains: ['Híbrida ☯️', 'Indica 🌙']
    },
    'packman3g': {
        gramos: 3, marca: 'Packman',
        title: 'PACKMAN 3g + Pre-Roll',
        price: 950,
        antes: 1300,
        image: './packman1.jpg',
        description: 'Packman × PartyBoyz. 3G Live Resin + .5G Infused Pre-Roll de regalo. Combo de potencia máxima.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️']
    },
    'muhacmeds': {
        gramos: 2, marca: 'Muha Meds',
        title: 'MUHACMEDS 2g',
        price: 700,
        image: './Muhacmeds1.JPG',
        description: 'Muha Meds × Cookies. Colaboración exclusiva con perfil terpénico idéntico a flor recién cosechada.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️']
    },
    'waka36k': {
        marca: 'Waka',
        title: 'Waka 36k 💨',
        price: 510,
        image: './waka-mango.jpg',
        description: 'Waka 36k 💨 Desechable recargable con pantalla Turbo 24W. Elige tu sabor y mira cómo se ve.',
        strains: ['Peach Mango Watermelon 🍑🥭🍉', 'Menta Ice 🌿', 'Strawberry Watermelon 🍓🍉', 'Fresa Kiwi 🍓'],
        // Al elegir un sabor, la foto cambia a la de ese sabor
        strainImages: {
            'Peach Mango Watermelon 🍑🥭🍉': './waka-mango.jpg',
            'Menta Ice 🌿': './waka-menta.jpg',
            'Strawberry Watermelon 🍓🍉': './waka-sandia.jpg',
            'Fresa Kiwi 🍓': './waka-fresakiwi.jpg'
        }
    },
    'waka15k': {
        marca: 'Waka',
        title: 'Waka 15k 💨',
        price: 250,
        image: './waka15-mango.jpg',
        description: 'Waka SoPro 15,000 puffs 💨 con 5% de nicotina y pantalla digital. Elige tu sabor y mira cómo se ve.',
        strains: ['Mango Ice 🥭', 'Kiwi Dragon Berry 🐉', 'Strawberry Burst 🍓'],
        strainImages: {
            'Mango Ice 🥭': './waka15-mango.jpg',
            'Kiwi Dragon Berry 🐉': './waka15-kiwi.jpg',
            'Strawberry Burst 🍓': './waka15-strawberry.jpg'
        }
    },
    'lostmary5k': {
        marca: 'Lost Mary',
        title: 'Lost Mary 5k 🔥',
        price: 150,
        image: './lostmary-alphonso.jpg',
        description: 'Lost Mary MO5000 Black Gold 🔥 Edición limitada con 5,000 inhalaciones. Sabor Alphonso Mango Ice: mango dulce y jugoso con un final helado.',
        strains: ['Alphonso Mango Ice 🥭'],
        strainImages: { 'Alphonso Mango Ice 🥭': './lostmary-alphonso.jpg' }
    },
    'muhamedual': {
        gramos: 2, marca: 'Muha Meds',
        title: 'MUHAMEDual 2g',
        price: 800,
        image: './muhamedual 2.JPG',
        description: 'Dispositivo dual Muha Meds. Doble tanque con variante seleccionable y doble resistencia.',
        strains: ['Sativa/Indica ☯️', 'Sativa/Sativa 🚀']
    }
};

export const tienePrecio = (p) => Number.isFinite(p && p.price) && p.price > 0;
export const enPromo = (p) => tienePrecio(p) && Number.isFinite(p.antes) && p.antes > p.price;
const mxn = (n) => `$${Number(n).toLocaleString('es-MX')}`;
// Precio listo para pintar: si está en promo, muestra el precio normal tachado
export function precioHTML(p) {
    if (!tienePrecio(p)) return 'Precio por confirmar';
    return enPromo(p)
        ? `<s class="price-old">${mxn(p.antes)}</s> <span class="price-promo">${mxn(p.price)} MXN</span>`
        : `${mxn(p.price)} MXN`;
}

let currentSelectedStrain = '';
let currentActiveProduct = null;

// Abrir modal y cargar datos del producto seleccionado
export function openProductModal(productId) {
    const modal = document.getElementById('productModalOverlay');
    if (!modal) return;

    const product = productsData[productId];
    if (!product) {
        // Antes se mostraba un producto "genérico" de $850; mejor avisar que algo falta.
        console.warn('Producto no encontrado en catalog.js:', productId);
        showToast('Ese producto no está disponible por ahora', 'error');
        return;
    }

    currentActiveProduct = product;
    currentSelectedStrain = product.strains[0] || '';

    const titleEl = document.getElementById('modalTitle');
    const priceEl = document.getElementById('modalPrice');
    const descEl = document.getElementById('modalDescription');
    const imageEl = document.getElementById('modalMainImage');
    const strainsContainer = document.getElementById('modalStrainPills');

    if (titleEl) titleEl.textContent = product.title;
    if (priceEl) priceEl.innerHTML = precioHTML(product);
    const addBtn = document.querySelector('#productModalOverlay [data-action="add-modal-to-cart"]');
    if (addBtn) addBtn.textContent = tienePrecio(product) ? 'Agregar al Carrito' : '💬 Consultar precio por WhatsApp';
    if (descEl) descEl.textContent = product.description;
    if (imageEl) {
        imageEl.src = (product.strainImages && product.strainImages[currentSelectedStrain]) || product.image;
        imageEl.alt = product.title;
    }

    // Botones de cepas/variedades
    if (strainsContainer) {
        strainsContainer.innerHTML = '';
        product.strains.forEach((strain, index) => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `strain-pill ${index === 0 ? 'selected' : ''}`;
            pill.textContent = strain;
            pill.addEventListener('click', () => {
                strainsContainer.querySelectorAll('.strain-pill').forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
                currentSelectedStrain = strain;
                // Si el producto tiene foto por sabor, se cambia la imagen
                const foto = product.strainImages && product.strainImages[strain];
                if (foto && imageEl) imageEl.src = foto;
            });
            strainsContainer.appendChild(pill);
        });
    }

    openModalState();
    modal.classList.add('active');
}

// Cerrar ventana modal
export function closeProductModal() {
    const modal = document.getElementById('productModalOverlay');
    if (modal) modal.classList.remove('active');
    closeModalState();
}

// Cerrar al tocar el fondo oscuro (fuera de la tarjeta)
export function closeModalOnOverlay(e) {
    if (e.target.id === 'productModalOverlay') {
        closeProductModal();
    }
}

// Agregar al carrito desde la modal incluyendo la cepa seleccionada
export function addModalProductToCart() {
    if (!currentActiveProduct) return;
    const itemTitle = currentSelectedStrain
        ? `${currentActiveProduct.title} [${currentSelectedStrain}]`
        : currentActiveProduct.title;

    // Sin precio todavía: se pregunta por WhatsApp en vez de agregar un producto de $0
    if (!tienePrecio(currentActiveProduct)) {
        const texto = `¡Hola Aeroshop! 🚀 Quiero información y precio de: *${itemTitle}*`;
        window.open(waLink(texto), '_blank');
        return;
    }

    const fotoCarrito = (currentActiveProduct.strainImages && currentActiveProduct.strainImages[currentSelectedStrain]) || currentActiveProduct.image;
    addToCart(itemTitle, currentActiveProduct.price, fotoCarrito);
    showToast('🛒 Agregado al carrito');
    closeProductModal();
}

// Pone en las tarjetas del HTML el precio que está en productsData (una sola fuente de verdad)
export function syncPrices() {
    document.querySelectorAll('.product-card, .ace-card').forEach(card => {
        const fuente = card.getAttribute('onclick') || card.innerHTML;
        const id = card.dataset.productId || (fuente.match(/openProductModal\('([^']+)'\)/) || [])[1];
        const p = id && productsData[id];
        if (!p || !tienePrecio(p)) return;
        const precio = card.querySelector('.product-price');
        if (precio) {
            if (enPromo(p)) precio.innerHTML = precioHTML(p);
            else {
                const spans = precio.querySelectorAll('span');
                (spans.length ? spans[spans.length - 1] : precio).textContent = `${mxn(p.price)} MXN`;
            }
        }
        if (enPromo(p)) {
            const tag = card.querySelector('.product-tag-new');
            if (tag) { tag.textContent = 'PROMO 🔥'; tag.classList.add('is-promo'); }
        }
        card.querySelectorAll('[data-action="add-to-cart"]').forEach(b => { b.dataset.price = p.price; });
    });
}


/* ==========================================
   MIELES: ANUNCIOS + FILTROS DEL CATÁLOGO
   ========================================== */
// Lo que sale en el recuadro de anuncios (en este orden). La marca nueva va al final.
const MIELES_ANUNCIOS = [
    ['donutsdonitav3', 'PROMO 🔥'],
    ['cookies1g', 'NUEVO ✨'],
    ['corridostumbados', 'NUEVO ✨'],
];
const idDeTarjeta = (card) => {
    const fuente = card.getAttribute('onclick') || card.innerHTML;
    return card.dataset.productId || (fuente.match(/openProductModal\('([^']+)'\)/) || [])[1];
};
const esc = (t) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function anuncioProductoHTML(id, etiqueta) {
    const p = productsData[id];
    if (!p) return '';
    return `<article class="ma-card" data-action="open-product-modal" data-product-id="${esc(id)}" role="button" tabindex="0">
        <span class="ma-tag ${etiqueta === 'PROMO 🔥' ? 'is-promo' : ''}">${etiqueta}</span>
        <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">
        <h4>${esc(p.title)}</h4>
        <p class="ma-price">${precioHTML(p)}</p>
    </article>`;
}

export function initMielesFiltros() {
    const grid = document.getElementById('featuredGrid');
    const bar = document.getElementById('mielesFiltros');
    const track = document.getElementById('mielesAnunciosTrack');
    if (!grid || !bar) return;

    // 1) Recuadro de anuncios: primero promos, luego novedades, luego la marca nueva
    if (track) {
        track.innerHTML = MIELES_ANUNCIOS.map(([id, tag]) => anuncioProductoHTML(id, tag)).join('')
            + `<article class="ma-card ma-brand" onclick="openFullscreenBrand('aceultra')" role="button" tabindex="0">
                <span class="ma-tag">NUEVA MARCA</span>
                <img src="./logo-aceultra.png" alt="ACE ULTRA" loading="lazy">
                <h4>ACE ULTRA ♠</h4>
                <p class="ma-price">Ver la marca →</p>
               </article>`;
    }

    // 2) "Todos los productos" = todos los de Mieles: si un producto no tiene tarjeta aquí
    //    (y no es de Nubes), se crea solita con los datos del catálogo.
    const enGrid = new Set([...grid.querySelectorAll('.product-card')].map(idDeTarjeta));
    const nubes = document.getElementById('nubesFullscreenView');
    const deNubes = new Set(nubes ? [...nubes.querySelectorAll('.product-card, [data-product-id], [onclick*="openProductModal"]')].map(idDeTarjeta).filter(Boolean) : []);
    Object.keys(productsData).forEach(id => {
        if (enGrid.has(id) || deNubes.has(id)) return;
        const p = productsData[id];
        const sub = [p.gramos ? `${p.gramos}g` : '', p.marca || ''].filter(Boolean).join(' • ');
        const card = document.createElement('div');
        card.className = 'product-card card-glass';
        card.dataset.action = 'open-product-modal';
        card.dataset.productId = id;
        card.innerHTML = `
            <div class="product-img-slider"><img src="${esc(p.image)}" class="active" alt="${esc(p.title)}" loading="lazy"></div>
            <div>
                <div class="product-name">${esc(p.title)}</div>
                ${sub ? `<div class="product-subtitle">${esc(sub)}</div>` : ''}
                <div class="product-price">${precioHTML(p)}</div>
            </div>
            <button type="button" class="btn-add" data-action="open-product-modal" data-product-id="${esc(id)}">Ver Más Información</button>`;
        grid.appendChild(card);
    });

    // 3) Filtros
    const cards = [...grid.querySelectorAll('.product-card')];
    cards.forEach((c, i) => { c.dataset.orden = i; });
    const marcaSel = document.getElementById('mfMarca');
    if (marcaSel) {
        const marcas = [...new Set(cards.map(c => (productsData[idDeTarjeta(c)] || {}).marca).filter(Boolean))].sort();
        marcaSel.innerHTML = '<option value="">🏷️ Por marca</option>' + marcas.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
    }
    const hint = document.getElementById('mfHint');
    const vacio = document.getElementById('mfVacio');
    const estado = { filtro: '', marca: '', barato: false };

    function aplicar() {
        const activo = estado.filtro || estado.marca || estado.barato;
        grid.classList.toggle('mf-oculto', !activo);
        if (hint) hint.hidden = !!activo;
        let visibles = 0;
        cards.forEach(c => {
            const p = productsData[idDeTarjeta(c)] || {};
            let ok = true;
            if (estado.filtro === 'ofertas') ok = enPromo(p);
            else if (estado.filtro && estado.filtro !== 'todos') ok = p.gramos === Number(estado.filtro);
            if (ok && estado.marca) ok = p.marca === estado.marca;
            c.style.display = ok ? '' : 'none';
            if (ok) visibles++;
        });
        const orden = estado.barato
            ? [...cards].sort((a, b) => ((productsData[idDeTarjeta(a)] || {}).price || 1e9) - ((productsData[idDeTarjeta(b)] || {}).price || 1e9))
            : [...cards].sort((a, b) => a.dataset.orden - b.dataset.orden);
        orden.forEach(c => grid.appendChild(c));
        if (vacio) vacio.hidden = !activo || visibles > 0;
        bar.querySelectorAll('[data-filtro]').forEach(b => b.classList.toggle('active', b.dataset.filtro === estado.filtro));
        const bp = bar.querySelector('[data-orden="precio"]');
        if (bp) bp.classList.toggle('active', estado.barato);
        if (marcaSel) marcaSel.classList.toggle('active', !!estado.marca);
    }

    bar.addEventListener('click', (ev) => {
        const b = ev.target.closest('button');
        if (!b) return;
        if (b.dataset.filtro) {
            estado.filtro = estado.filtro === b.dataset.filtro ? '' : b.dataset.filtro;
            if (b.dataset.filtro === 'todos') estado.marca = '';
            if (marcaSel && b.dataset.filtro === 'todos') marcaSel.value = '';
        } else if (b.dataset.orden === 'precio') {
            estado.barato = !estado.barato;
        }
        aplicar();
    });
    if (marcaSel) marcaSel.addEventListener('change', () => { estado.marca = marcaSel.value; if (estado.marca && estado.filtro === 'todos') estado.filtro = ''; aplicar(); });
    aplicar();
}
