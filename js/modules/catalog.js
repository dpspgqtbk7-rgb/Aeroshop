// js/modules/catalog.js
import { addToCart } from './cart.js';
import { openModalState, closeModalState, showToast } from '../ui.js';
import { waLink } from '../config.js';
import { store } from '../core/store.js';
import { precio420 } from './promos.js';

import { productsData } from './productos.js';
export { productsData };

export const tienePrecio = (p) => Number.isFinite(p && p.price) && p.price > 0;
export const estaAgotado = (p) => !!(p && p.agotado);
export const estaRetirado = (p) => !p || !!p.oculto;
export const enPromo = (p) => tienePrecio(p) && Number.isFinite(p.antes) && p.antes > p.price;
const mxn = (n) => `$${Number(n).toLocaleString('es-MX')}`;
// Precio listo para pintar: si está en promo, muestra el precio normal tachado
export function precioHTML(p) {
    if (!tienePrecio(p)) return 'Precio por confirmar';
    // Hora 4:20: el precio normal tachado y el de 40% OFF
    if (store.getState().isPromo420Active) {
        return `<s class="price-old">${mxn(p.price)}</s> <span class="price-promo price-420">${mxn(precio420(p.price))} MXN 🔥</span>`;
    }
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
    if (!product || estaRetirado(product)) {
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

    // Agotado: el botón no deja agregar al carrito
    const btn = modal.querySelector('[data-action="add-modal-to-cart"]');
    if (btn) {
        const agotado = estaAgotado(product);
        btn.disabled = agotado;
        btn.classList.toggle('btn-agotado', agotado);
        if (agotado) btn.textContent = 'Agotado 😢';
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
    if (estaAgotado(currentActiveProduct)) { showToast('😢 Este producto está agotado por ahora'); return; }
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

const idDeTarjeta = (card) => {
    const fuente = card.getAttribute('onclick') || card.innerHTML;
    return card.dataset.productId || (fuente.match(/openProductModal\('([^']+)'\)/) || [])[1];
};
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Pone en las tarjetas el precio, la etiqueta y si está agotado, según productsData.
// Se puede llamar las veces que sea (al cambiar la Hora 4:20 o al llegar cambios del Panel).
export function syncPrices() {
    document.querySelectorAll('.product-card, .ace-card').forEach(card => {
        const id = idDeTarjeta(card);
        const p = id && productsData[id];
        if (!p) return;
        const precio = card.querySelector('.product-price');
        if (precio && tienePrecio(p)) {
            if (precio.dataset.orig === undefined) precio.dataset.orig = precio.innerHTML;
            if (enPromo(p) || store.getState().isPromo420Active) precio.innerHTML = precioHTML(p);
            else {
                precio.innerHTML = precio.dataset.orig;
                const spans = precio.querySelectorAll('span');
                (spans.length ? spans[spans.length - 1] : precio).textContent = `${mxn(p.price)} MXN`;
            }
        }
        const tag = card.querySelector('.product-tag-new');
        if (tag && tag.dataset.orig === undefined) tag.dataset.orig = tag.textContent;
        const btn = card.querySelector('.btn-add');
        if (btn && btn.dataset.orig === undefined) btn.dataset.orig = btn.textContent;
        const agotado = estaAgotado(p);
        card.classList.toggle('is-agotado', agotado);
        if (tag) {
            tag.textContent = agotado ? 'AGOTADO' : enPromo(p) ? 'PROMO 🔥' : tag.dataset.orig;
            tag.classList.toggle('is-promo', !agotado && enPromo(p));
            tag.classList.toggle('is-agotado-tag', agotado);
        }
        if (btn) btn.textContent = agotado ? 'Agotado 😢' : btn.dataset.orig;
        card.querySelectorAll('[data-action="add-to-cart"]').forEach(b => { b.dataset.price = p.price; });
    });
    // Precios que se pintan solos (anuncios, páginas de marca)
    document.querySelectorAll('[data-precio-de]').forEach(el => {
        const p = productsData[el.dataset.precioDe];
        if (p) el.innerHTML = precioHTML(p);
    });
    // Si la ventana del producto está abierta, también se actualiza
    const modal = document.getElementById('productModalOverlay');
    if (modal && modal.classList.contains('active') && currentActiveProduct) {
        const priceEl = document.getElementById('modalPrice');
        if (priceEl) priceEl.innerHTML = precioHTML(currentActiveProduct);
    }
}

// Aplica en las tarjetas que ya están en la página lo que cambiaste en el Panel:
// retirar/mostrar, nombre y foto. (Precio y agotado los pone syncPrices.)
function aplicarCambiosEnTarjetas(cambios) {
    document.querySelectorAll('.product-card, .ace-card').forEach(card => {
        if (card.classList.contains('auto-card')) return;
        const id = idDeTarjeta(card);
        if (!id || !(id in productsData)) return;
        const p = productsData[id];
        const c = cambios[id] || {};
        card.classList.toggle('is-retirado', estaRetirado(p));

        const nombre = card.querySelector('.product-name');
        if (nombre) {
            if (nombre.dataset.orig === undefined) nombre.dataset.orig = nombre.textContent;
            nombre.textContent = c.title ? p.title : nombre.dataset.orig;
        }
        const slider = card.querySelector('.product-img-slider');
        if (slider) {
            if (slider.dataset.orig === undefined) slider.dataset.orig = slider.innerHTML;
            slider.innerHTML = c.image
                ? `<img src="${esc(p.image)}" class="active" alt="${esc(p.title)}" loading="lazy">`
                : slider.dataset.orig;
        }
    });
}

/* ==========================================
   MIELES: ANUNCIOS + FILTROS DEL CATÁLOGO
   ========================================== */
// Anuncios = productos con "anuncio" (PROMO primero). Se eligen en el Panel. La marca nueva va al final.
function anuncioProductoHTML(id) {
    const p = productsData[id];
    if (!p || estaRetirado(p)) return '';
    const etiqueta = estaAgotado(p) ? 'AGOTADO' : (enPromo(p) ? 'PROMO 🔥' : p.anuncio);
    return `<article class="ma-card ${estaAgotado(p) ? 'is-agotado' : ''}" data-action="open-product-modal" data-product-id="${esc(id)}" role="button" tabindex="0">
        <span class="ma-tag ${etiqueta === 'PROMO 🔥' ? 'is-promo' : ''}">${esc(etiqueta)}</span>
        <img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">
        <h4>${esc(p.title)}</h4>
        <p class="ma-price" data-precio-de="${esc(id)}">${precioHTML(p)}</p>
    </article>`;
}

function tarjetaAutoHTML(id, p) {
    const sub = [p.gramos ? `${p.gramos}g` : '', p.marca || ''].filter(Boolean).join(' • ');
    return `
        ${p.anuncio ? `<span class="product-tag-new">${esc(p.anuncio)}</span>` : ''}
        <div class="product-img-slider"><img src="${esc(p.image)}" class="active" alt="${esc(p.title)}" loading="lazy"></div>
        <div>
            <div class="product-name">${esc(p.title)}</div>
            ${sub ? `<div class="product-subtitle">${esc(sub)}</div>` : ''}
            <div class="product-price">${precioHTML(p)}</div>
        </div>
        <button type="button" class="btn-add" data-action="open-product-modal" data-product-id="${esc(id)}">Ver Más Información</button>`;
}

// Dibuja anuncios, tarjetas que faltan (productos nuevos del Panel) y la lista de marcas
function pintarMieles() {
    const grid = document.getElementById('featuredGrid');
    const nubesGrid = document.getElementById('nubesGrid');
    const track = document.getElementById('mielesAnunciosTrack');
    if (!grid) return;

    // 1) Recuadro de anuncios
    if (track) {
        const ids = Object.keys(productsData).filter(id => productsData[id].anuncio && !estaRetirado(productsData[id]));
        ids.sort((a, b) => (productsData[b].anuncio === 'PROMO 🔥' || enPromo(productsData[b])) - (productsData[a].anuncio === 'PROMO 🔥' || enPromo(productsData[a])));
        track.innerHTML = ids.map(anuncioProductoHTML).join('')
            + `<article class="ma-card ma-brand" onclick="openFullscreenBrand('aceultra')" role="button" tabindex="0">
                <span class="ma-tag">NUEVA MARCA</span>
                <img src="./logo-aceultra.png" alt="ACE ULTRA" loading="lazy">
                <h4>ACE ULTRA ♠</h4>
                <p class="ma-price">Ver la marca →</p>
               </article>`;
    }

    // 2) Tarjetas automáticas: todo producto sin tarjeta propia en la página se crea solito
    document.querySelectorAll('.auto-card').forEach(c => c.remove());
    const conTarjeta = new Set([...document.querySelectorAll('#featuredGrid .product-card, #nubesFullscreenView .product-card, #nubesFullscreenView [onclick*="openProductModal"]')].map(idDeTarjeta).filter(Boolean));
    Object.keys(productsData).forEach(id => {
        const p = productsData[id];
        if (conTarjeta.has(id) || estaRetirado(p)) return;
        const destino = p.seccion === 'nubes' && nubesGrid ? nubesGrid : grid;
        const card = document.createElement('div');
        card.className = 'product-card card-glass auto-card';
        card.dataset.action = 'open-product-modal';
        card.dataset.productId = id;
        card.innerHTML = tarjetaAutoHTML(id, p);
        destino.appendChild(card);
    });

    // 3) Lista de marcas del filtro
    const marcaSel = document.getElementById('mfMarca');
    if (marcaSel) {
        const actual = marcaSel.value;
        const marcas = [...new Set([...grid.querySelectorAll('.product-card:not(.is-retirado)')].map(c => (productsData[idDeTarjeta(c)] || {}).marca).filter(Boolean))].sort();
        marcaSel.innerHTML = '<option value="">🏷️ Por marca</option>' + marcas.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
        marcaSel.value = marcas.includes(actual) ? actual : '';
    }
}

let aplicarFiltros = null;
let siguienteOrden = 0;

export function initMielesFiltros() {
    const grid = document.getElementById('featuredGrid');
    const bar = document.getElementById('mielesFiltros');
    if (!grid || !bar) return;
    pintarMieles();

    const marcaSel = document.getElementById('mfMarca');
    const hint = document.getElementById('mfHint');
    const vacio = document.getElementById('mfVacio');
    const estado = { filtro: '', marca: '', barato: false };

    function aplicar() {
        const cards = [...grid.querySelectorAll('.product-card')];
        cards.forEach(c => { if (c.dataset.orden === undefined) c.dataset.orden = siguienteOrden++; });
        if (estado.marca && marcaSel && marcaSel.value !== estado.marca) estado.marca = marcaSel.value;
        const activo = estado.filtro || estado.marca || estado.barato;
        grid.classList.toggle('mf-oculto', !activo);
        if (hint) hint.hidden = !!activo;
        let visibles = 0;
        cards.forEach(c => {
            const p = productsData[idDeTarjeta(c)] || {};
            let ok = !c.classList.contains('is-retirado');
            if (ok && estado.filtro === 'ofertas') ok = enPromo(p);
            else if (ok && estado.filtro && estado.filtro !== 'todos') ok = p.gramos === Number(estado.filtro);
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
    aplicarFiltros = aplicar;

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

// Vuelve a dibujar todo lo de productos (cuando llegan cambios del Panel)
export function refrescarCatalogo(cambios = {}) {
    aplicarCambiosEnTarjetas(cambios);
    pintarMieles();
    syncPrices();
    if (aplicarFiltros) aplicarFiltros();
}
