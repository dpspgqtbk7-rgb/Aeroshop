// js/modules/catalog.js
import { addToCart } from './cart.js';
import { openModalState, closeModalState, showToast } from '../ui.js';

// Base de datos oficial de productos para la vista detallada
export const productsData = {
    'frydovni': {
        title: 'FRYD Ovni 🛸 + Gomitas 2g',
        price: 850,
        image: './frydgomas2.jpg',
        description: 'Edición especial FRYD Ovni con gomitas infundidas. Extracto Premium de Live Resin + Liquid Batter para una experiencia física y cerebral de alta potencia.',
        strains: ['Híbrida ☯️', 'Sativa 🚀', 'Indica 🌙']
    },
    'donutsdonitav3': {
        title: 'donuts donita v3',
        price: 850,
        image: './donusdonitav31.JPG',
        description: 'Dona Mágica ✨🪴. Extracto ultra limpio con sabores naturales y perfil terpénico refinado.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️']
    },
    'besos2g': {
        title: 'Besos Liquid Diamonds 2g 💋',
        price: 850,
        image: './besos.jpg',
        description: '2G Liquid Diamonds con perfil Cherry Berry Kiss. Potencia pura y sabor dulce e intenso.',
        strains: ['Híbrida ☯️', 'Indica 🌙']
    },
    'packman3g': {
        title: 'PACKMAN 3g + Pre-Roll',
        price: 950,
        image: './packman1.png',
        description: 'Packman × PartyBoyz. 3G Live Resin + .5G Infused Pre-Roll de regalo. Combo de potencia máxima.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️']
    },
    'muhacmeds': {
        title: 'MUHACMEDS 2g',
        price: 700,
        image: './Muhacmeds1.JPG',
        description: 'Muha Meds × Cookies. Colaboración exclusiva con perfil terpénico idéntico a flor recién cosechada.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️']
    },
    'muhamedual': {
        title: 'MUHAMEDual 2g',
        price: 800,
        image: './muhamedual 2.JPG',
        description: 'Dispositivo dual Muha Meds. Doble tanque con variante seleccionable y doble resistencia.',
        strains: ['Sativa/Indica ☯️', 'Sativa/Sativa 🚀']
    }
};

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
    if (priceEl) priceEl.textContent = `$${product.price} MXN`;
    if (descEl) descEl.textContent = product.description;
    if (imageEl) { imageEl.src = product.image; imageEl.alt = product.title; }

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

    addToCart(itemTitle, currentActiveProduct.price, currentActiveProduct.image);
    showToast('🛒 Agregado al carrito');
    closeProductModal();
}
