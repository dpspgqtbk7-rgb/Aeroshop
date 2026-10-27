// js/modules/catalog.js
import { addToCart } from './cart.js';
import { openModalState, closeModalState, showToast } from '../ui.js';

// Base de datos oficial de productos para la vista detallada
export const productsData = {
    'lebowski': {
        title: 'Cookies × Lebowski 2g 🥃',
        price: 780,
        image: './lebo.JPG',
        description: 'Cookies × Lebowski 🥃 Dispositivo DUO de 2g (1g + 1g) con Liquid Diamonds + Live Resin. Dos vuelos en un solo equipo, edición de colección en azul Cookies. Relax total, estilo "The Dude". Pregunta por las variedades disponibles.',
        strains: ['Variedad surtida ☯️', 'Pregunta por disponibilidad 💬']
    },
    'snoopdog': {
        title: 'Snoop Dogg × Death Row 🎤',
        price: 1200,
        image: './snoop-dog.jpg',
        description: 'Death Row Records 🔥 La edición de Snoop Dogg aterriza en la cabina: vape de 3.5 ml con dos vuelos distintos. Sour Diesel para despegar con energía y Grape Ape para bajar suave. Vibra West Coast directo a tu equipaje.',
        strains: ['Sour Diesel — Sativa 🚀', 'Grape Ape — Indica 🌙']
    },
    'muhameds2026': {
        title: 'MUHA MEDS 2026 ✨ All-in-One',
        price: 700,
        image: './muhameds%202026.jpg',
        description: 'Muha Meds 2026 ✨ All-in-One de 2g (2000 mg) en negro y oro. Galactic Diesel, perfil Indica: relajado, aromático y con vibra espacial. Todo en un solo dispositivo, listo para despegar.',
        strains: ['Galactic Diesel — Indica 🌙']
    },
    'crybaby': {
        title: 'CryBaby 2g 🍼 + Gomitas',
        price: 800,
        image: './crybaby.jpg',
        description: 'CryBaby 🍼 2G Liquid Diamonds con Live Resin, sabor Mango Ice Cream (Híbrida). Dulce, helado y con certificado de autenticidad. Incluye gomitas Gumballs para completar la experiencia.',
        strains: ['Mango Ice Cream — Híbrida ☯️']
    },
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
    'waka36k': {
        title: 'Waka 36k 💨',
        price: 500,
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
    'lostmary5k': {
        title: 'Lost Mary 5k 🔥',
        price: 150,
        image: './lostmary-alphonso.jpg',
        description: 'Lost Mary MO5000 Black Gold 🔥 Edición limitada con 5,000 inhalaciones. Sabor Alphonso Mango Ice: mango dulce y jugoso con un final helado.',
        strains: ['Alphonso Mango Ice 🥭'],
        strainImages: { 'Alphonso Mango Ice 🥭': './lostmary-alphonso.jpg' }
    },
    'muhamedual': {
        title: 'MUHAMEDual 2g',
        price: 800,
        image: './muhamedual 2.JPG',
        description: 'Dispositivo dual Muha Meds. Doble tanque con variante seleccionable y doble resistencia.',
        strains: ['Sativa/Indica ☯️', 'Sativa/Sativa 🚀']
    }
};

export const tienePrecio = (p) => Number.isFinite(p && p.price) && p.price > 0;

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
    if (priceEl) priceEl.textContent = tienePrecio(product) ? `$${product.price} MXN` : 'Precio por confirmar';
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
        window.open(`https://wa.me/525561446446?text=${encodeURIComponent(texto)}`, '_blank');
        return;
    }

    const fotoCarrito = (currentActiveProduct.strainImages && currentActiveProduct.strainImages[currentSelectedStrain]) || currentActiveProduct.image;
    addToCart(itemTitle, currentActiveProduct.price, fotoCarrito);
    showToast('🛒 Agregado al carrito');
    closeProductModal();
}
