let cart = [];
const phone = "525561446446";
let selectedStrain = 'Sativa';
let currentModalProduct = {
    title: 'MUHACMEDS 2g',
    price: 700,
    image: './Muhacmeds1.JPG'
};

function scrollToBrandProducts() {
    const target = document.getElementById('brandProductsSection');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

/* FUNCIONALIDAD CARRUSEL CON COMPATIBILIDAD DE VIDEO Y ROTACIÓN LIMPIA */
function startHoverSlider(container) {
    const mediaElements = container.querySelectorAll('img, video');
    if (mediaElements.length <= 1) return;
    
    let currentIndex = 0;

    container._intervalId = setInterval(() => {
        mediaElements[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % mediaElements.length;
        mediaElements[currentIndex].classList.add('active');
    }, 1200);
}

function stopHoverSlider(container) {
    if (container._intervalId) {
        clearInterval(container._intervalId);
        container._intervalId = null;
    }
    const mediaElements = container.querySelectorAll('img, video');
    mediaElements.forEach((el, idx) => el.classList.toggle('active', idx === 0));
}

/* MANEJO DE VENTANA MODAL DE PRODUCTOS */
function openProductModal(productId) {
    const mediaContainer = document.getElementById('modalMediaContainer');
    const thumbnailsContainer = document.getElementById('modalThumbnails');

    if (productId === 'donutsdonitav3') {
        currentModalProduct = { title: 'donuts donita v3', price: 850, image: './donusdonitav31.JPG' };
        document.getElementById('modalTitle').innerText = 'donuts donita v3';
        document.getElementById('modalPrice').innerText = '$850 MXN';
        document.getElementById('modalDescription').innerText = 'dónuts v3 llega en este nuevo modelo en forma de dona mágica ✨🪴, disponible en indica, sativa , hibrida';
        mediaContainer.innerHTML = `<img src="./donusdonitav31.JPG" class="modal-main-image" alt="donuts donita v3">`;
        thumbnailsContainer.innerHTML = `
            <img src="./donusdonitav31.JPG" class="modal-thumb active" onclick="changeModalMedia(this, './donusdonitav31.JPG')">
            <img src="./donutsdonasv3.JPG" class="modal-thumb" onclick="changeModalMedia(this, './donutsdonasv3.JPG')">
        `;
    } else if (productId === 'donutsv2') {
        currentModalProduct = { title: 'Donuts v2', price: 700, image: './donutsv22.JPG' };
        document.getElementById('modalTitle').innerText = 'Donuts v2';
        document.getElementById('modalPrice').innerText = '$700 MXN';
        document.getElementById('modalDescription').innerText = 'donuts switch v2 2g';
        mediaContainer.innerHTML = `<video src="./donuts1.mp4" autoplay loop muted playsinline class="modal-main-image"></video>`;
        thumbnailsContainer.innerHTML = `
            <video src="./donuts1.mp4" class="modal-thumb active" onclick="changeModalMedia(this, './donuts1.mp4')" muted></video>
            <img src="./donutsv22.JPG" class="modal-thumb" onclick="changeModalMedia(this, './donutsv22.JPG')">
            <img src="./donutsv23.JPG" class="modal-thumb" onclick="changeModalMedia(this, './donutsv23.JPG')">
        `;
    } else if (productId === 'packman3g') {
        currentModalProduct = { title: 'PACKMAN 3g + Pre-Roll', price: 950, image: './packman1.png' };
        document.getElementById('modalTitle').innerText = 'PACKMAN 3g + Pre-Roll';
        document.getElementById('modalPrice').innerHTML = '<span style="text-decoration: line-through; color: #94a3b8; font-size: 1.2rem; margin-right: 8px;">$1,300 MXN</span> <span style="color: #facc15;">$950 MXN</span>';
        document.getElementById('modalDescription').innerText = 'Packman 3g Disposable Live Resin + Liquid Diamonds en colaboración con PartyBoyz, acompañado de un .5g Infused Pre-Roll de máxima potencia e increíble sabor.';
        mediaContainer.innerHTML = `<img src="./packman1.png" class="modal-main-image" alt="PACKMAN 3g">`;
        thumbnailsContainer.innerHTML = `
            <img src="./packman1.png" class="modal-thumb active" onclick="changeModalMedia(this, './packman1.png')">
            <img src="./packman2.png" class="modal-thumb" onclick="changeModalMedia(this, './packman2.png')">
            <img src="./packman3.png" class="modal-thumb" onclick="changeModalMedia(this, './packman3.png')">
            <img src="./packman5.JPG" class="modal-thumb" onclick="changeModalMedia(this, './packman5.JPG')">
        `;
    } else if (productId === 'muhacmeds') {
        currentModalProduct = { title: 'MUHACMEDS 2g', price: 700, image: './Muhacmeds1.JPG' };
        document.getElementById('modalTitle').innerText = 'MUHACMEDS 2g';
        document.getElementById('modalPrice').innerText = '$700 MXN';
        document.getElementById('modalDescription').innerText = 'MUHACMEDS 2g, es una colaboración que no solo es estéticamente cool si no que junta ambas marcas lideres en el mercado de las mieles, MUHAMEDS y COOKIES.';
        mediaContainer.innerHTML = `<img src="./Muhacmeds1.JPG" class="modal-main-image" alt="MUHACMEDS 2g">`;
        thumbnailsContainer.innerHTML = `
            <img src="./Muhacmeds1.JPG" class="modal-thumb active" onclick="changeModalMedia(this, './Muhacmeds1.JPG')">
            <img src="./MUHACMEDS.png" class="modal-thumb" onclick="changeModalMedia(this, './MUHACMEDS.png')">
            <img src="./muhacmeds.jpg" class="modal-thumb" onclick="changeModalMedia(this, './muhacmeds.jpg')">
            <img src="./muhacmeds2.jpg" class="modal-thumb" onclick="changeModalMedia(this, './muhacmeds2.jpg')">
        `;
    } else if (productId === 'muhamedual') {
        currentModalProduct = { title: 'MUHAMEDual 2g', price: 800, image: './muhamedual 2.JPG' };
        document.getElementById('modalTitle').innerText = 'MUHAMEDual 2g';
        document.getElementById('modalPrice').innerText = '$800 MXN';
        document.getElementById('modalDescription').innerText = 'Muhameds de nuevo sorprendiéndonos nuevamente y ahora con este nuevo modelo muhamedual, con doble variante de wax, y doble resistencia, ya sea que elijas quemar hibrida o sativa o ambas 😵‍💫.';
        mediaContainer.innerHTML = `<video src="./muhadual.mp4" autoplay loop muted playsinline class="modal-main-image"></video>`;
        thumbnailsContainer.innerHTML = `
            <video src="./muhadual.mp4" class="modal-thumb active" onclick="changeModalMedia(this, './muhadual.mp4')" muted></video>
            <img src="./muhamedual 2.JPG" class="modal-thumb" onclick="changeModalMedia(this, './muhamedual 2.JPG')">
            <img src="./muhamedual3.jpg" class="modal-thumb" onclick="changeModalMedia(this, './muhamedual3.jpg')">
        `;
    }

    document.getElementById('productModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('productModalOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeModalOnOverlay(e) {
    if (e.target.id === 'productModalOverlay') {
        closeProductModal();
    }
}

function changeModalMedia(thumbEl, src) {
    const container = document.getElementById('modalMediaContainer');
    const isVideo = src.toLowerCase().endsWith('.mp4');
    if (isVideo) {
        container.innerHTML = `<video src="${src}" autoplay loop muted playsinline class="modal-main-image"></video>`;
    } else {
        container.innerHTML = `<img src="${src}" class="modal-main-image" alt="Producto">`;
    }
    document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
    thumbEl.classList.add('active');
}

function selectStrain(btnEl, strain) {
    selectedStrain = strain;
    document.querySelectorAll('.strain-pill').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
}

function addModalProductToCart() {
    const itemTitle = `${currentModalProduct.title} (${selectedStrain})`;
    addToCart(itemTitle, currentModalProduct.price, currentModalProduct.image);
    closeProductModal();
}

/* SVG COMPONENTES PACKMAN */
function getGhostSvgHTML(color, isScared = false) {
    if (isScared) {
        return `
        <svg class="ghost-svg" viewBox="0 0 32 32">
            <path d="M16 2 C8.268 2 2 8.268 2 16 L2 30 L6.667 25.333 L11.333 30 L16 25.333 L20.667 30 L25.333 25.333 L30 30 L30 16 C30 8.268 23.732 2 16 2 Z" fill="#2121ff"/>
            <rect x="9" y="10" width="3" height="3" fill="#ffb88c"/>
            <rect x="20" y="10" width="3" height="3" fill="#ffb88c"/>
            <path d="M6 20 L10 17 L14 20 L18 17 L22 20 L26 17" stroke="#ffb88c" stroke-width="2" fill="none"/>
        </svg>`;
    }
    return `
    <svg class="ghost-svg" viewBox="0 0 32 32">
        <path d="M16 2 C8.268 2 2 8.268 2 16 L2 30 L6.667 25.333 L11.333 30 L16 25.333 L25.333 25.333 L30 30 L30 16 C30 8.268 23.732 2 16 2 Z" fill="${color}"/>
        <circle cx="10" cy="12" r="4" fill="#ffffff"/>
        <circle cx="22" cy="12" r="4" fill="#ffffff"/>
        <circle cx="12" cy="12" r="2" fill="#0000ff"/>
        <circle cx="24" cy="12" r="2" fill="#0000ff"/>
    </svg>`;
}

function runPackmanAction() {
    const ambient = document.getElementById('packmanAmbientParade');
    const chase = document.getElementById('packmanChaseSquad');

    if (ambient) ambient.style.display = 'none';
    if (chase) {
        chase.classList.remove('active');
        void chase.offsetWidth;
        chase.classList.add('active');
    }

    setTimeout(() => { scrollToBrandProducts(); }, 3000);
}

/* VISTAS FULLSCREEN MARCA */
function openFullscreenBrand(brandKey) {
    const view = document.getElementById('brandFullscreenView');
    const content = document.getElementById('brandFullscreenContent');

    const donutsDonitaV3CardHTML = `
        <div class="donuts-product-card" onclick="openProductModal('donutsdonitav3')">
            <span class="product-tag-new" style="color: #fb7185; border-color: rgba(251, 113, 133, 0.4); background: rgba(17, 24, 39, 0.9);">NUEVO LANZAMIENTO</span>
            <div class="product-img-slider" style="background: rgba(255,255,255,0.05); border-color: rgba(251, 113, 133, 0.3);" onmouseenter="startHoverSlider(this)" onmouseleave="stopHoverSlider(this)">
                <img src="./donusdonitav31.JPG" class="active" alt="donuts donita v3 1">
                <img src="./donutsdonasv3.JPG" alt="donuts donita v3 2">
            </div>
            <div style="margin-bottom: 16px;">
                <div class="product-name" style="color:#ffffff;">donuts donita v3</div>
                <div class="product-subtitle" style="color:#9ca3af;">Dona Mágica ✨🪴 • Sativa / Indica / Híbrida</div>
                <div class="product-price" style="color:#fb7185;">$850 MXN</div>
            </div>
            <button class="donuts-btn-add" onclick="event.stopPropagation(); openProductModal('donutsdonitav3')">Ver Más Información</button>
        </div>
    `;

    const donutsV2CardHTML = `
        <div class="donuts-product-card" onclick="openProductModal('donutsv2')">
            <span class="product-tag-new" style="color: #fb7185; border-color: rgba(251, 113, 133, 0.4); background: rgba(17, 24, 39, 0.9);">NUEVO LANZAMIENTO</span>
            <div class="product-img-slider" style="background: rgba(255,255,255,0.05); border-color: rgba(251, 113, 133, 0.3);" onmouseenter="startHoverSlider(this)" onmouseleave="stopHoverSlider(this)">
                <video src="./donuts1.mp4" autoplay loop muted playsinline class="active"></video>
                <img src="./donutsv22.JPG" alt="Donuts v2 2">
                <img src="./donutsv23.JPG" alt="Donuts v2 3">
            </div>
            <div style="margin-bottom: 16px;">
                <div class="product-name" style="color:#ffffff;">Donuts v2</div>
                <div class="product-subtitle" style="color:#9ca3af;">donuts switch v2 2g</div>
                <div class="product-price" style="color:#fb7185;">$700 MXN</div>
            </div>
            <button class="donuts-btn-add" onclick="event.stopPropagation(); openProductModal('donutsv2')">Ver Más Información</button>
        </div>
    `;

    const packman3gCardHTML = `
        <div class="product-card card-glass" style="background: rgba(15, 23, 42, 0.92); border: 2px solid #38bdf8; box-shadow: 0 0 25px rgba(56, 189, 248, 0.35);" onclick="openProductModal('packman3g')">
            <span class="product-tag-sale" style="background: #facc15; color: #0f172a; border: none; font-weight: 800;">¡REBAJA!</span>
            <div class="product-img-slider" style="background: rgba(255,255,255,0.05); border-color: rgba(56, 189, 248, 0.3);" onmouseenter="startHoverSlider(this)" onmouseleave="stopHoverSlider(this)">
                <img src="./packman1.png" class="active" alt="Packman 3g 1">
                <img src="./packman2.png" alt="Packman 3g 2">
                <img src="./packman3.png" alt="Packman 3g 3">
                <img src="./packman5.JPG" alt="Packman 3g 4">
            </div>
            <div>
                <div class="product-name" style="color:#ffffff;">PACKMAN 3g + Pre-Roll</div>
                <div class="product-subtitle" style="color:#94a3b8;">Packman × PartyBoyz • Live Resin + .5G Infused</div>
                <div class="product-price">
                    <span style="text-decoration: line-through; color: #64748b; font-size: 0.95rem; margin-right: 6px;">$1,300 MXN</span>
                    <span style="color: #facc15; font-weight: 800;">$950 MXN</span>
                </div>
            </div>
            <button class="btn-add" style="background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color:#0f172a; font-weight: 800; border: none;" onclick="event.stopPropagation(); openProductModal('packman3g')">Ver Más Información</button>
        </div>
    `;

    const muhacmedsCardHTML = `
        <div class="product-card card-glass" style="background: rgba(15, 17, 21, 0.88); border: 1px solid rgba(212, 175, 55, 0.4);" onclick="openProductModal('muhacmeds')">
            <span class="product-tag-collab">COLABORACIÓN</span>
            <div class="product-img-slider" style="background: rgba(255,255,255,0.08); border-color: rgba(212, 175, 55, 0.3);" onmouseenter="startHoverSlider(this)" onmouseleave="stopHoverSlider(this)">
                <img src="./Muhacmeds1.JPG" class="active" alt="MUHACMEDS 2g 1">
                <img src="./MUHACMEDS.png" alt="MUHACMEDS 2g 2">
                <img src="./muhacmeds.jpg" alt="MUHACMEDS 2g 3">
                <img src="./muhacmeds2.jpg" alt="MUHACMEDS 2g 4">
            </div>
            <div>
                <div class="product-name" style="color:#ffffff;">MUHACMEDS 2g</div>
                <div class="product-subtitle" style="color:#94a3b8;">Muha Meds × Cookies • Sativa / Indica / Híbrida</div>
                <div class="product-price" style="color:#d4af37;">$700 MXN</div>
            </div>
            <button class="btn-add" style="background: linear-gradient(135deg, #d4af37 0%, #aa8210 100%); color:#000;" onclick="event.stopPropagation(); openProductModal('muhacmeds')">Ver Más Información</button>
        </div>
    `;

    const muhamedualCardHTML = `
        <div class="product-card card-glass" style="background: rgba(15, 17, 21, 0.88); border: 1px solid rgba(56, 189, 248, 0.4);" onclick="openProductModal('muhamedual')">
            <span class="product-tag-new">NUEVO LANZAMIENTO</span>
            <div class="product-img-slider" style="background: rgba(255,255,255,0.08); border-color: rgba(56, 189, 248, 0.3);" onmouseenter="startHoverSlider(this)" onmouseleave="stopHoverSlider(this)">
                <video src="./muhadual.mp4" autoplay loop muted playsinline class="active"></video>
                <img src="./muhamedual 2.JPG" alt="MUHAMEDual 2g 2">
                <img src="./muhamedual3.jpg" alt="MUHAMEDual 2g 3">
            </div>
            <div>
                <div class="product-name" style="color:#ffffff;">MUHAMEDual 2g</div>
                <div class="product-subtitle" style="color:#94a3b8;">Muha Meds • Doble variante & doble resistencia</div>
                <div class="product-price" style="color:#38bdf8;">$800 MXN</div>
            </div>
            <button class="btn-add" style="background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%); color:#000;" onclick="event.stopPropagation(); openProductModal('muhamedual')">Ver Más Información</button>
        </div>
    `;

    if (brandKey === 'muhameds') {
        content.className = 'theme-muhameds-full';
        content.innerHTML = `
            <img src="./fondo-espacial.jpg" class="muha-bg-fixed" alt="Fondo">
            <div class="brand-hero-common">
                <div class="muha-brand-group">
                    <img src="./logo-muhameds.png" alt="Muha Meds Logo" class="muha-hero-logo">
                    <img src="./MUHAMEDSINTERFAZ.png" alt="MUHAMEDS" class="muha-hero-title-img">
                </div>
                <button class="scroll-down-btn" onclick="scrollToBrandProducts()" title="Ver Productos">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${muhamedualCardHTML}${muhacmedsCardHTML}</div>
            </div>
        `;
    } else if (brandKey === 'cookies') {
        content.className = 'theme-cookies-full';
        content.innerHTML = `
            <div class="brand-hero-common">
                <img src="./logo-cookies-texto-removebg-preview.png" class="cookies-hero-logo" alt="Cookies Logo">
                <button class="scroll-down-btn" onclick="scrollToBrandProducts()" title="Ver Productos">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${muhacmedsCardHTML}</div>
            </div>
        `;
    } else if (brandKey === 'backwoods') {
        content.className = 'theme-backwoods-full';
        content.innerHTML = `
            <div class="brand-hero-common">
                <div>
                    <img src="./logo-backwoods.png" alt="Backwoods" style="max-width: 250px; margin-bottom: 15px;">
                    <div class="muha-hero-title" style="color: #e11d48;">BACKWOODS</div>
                </div>
                <button class="scroll-down-btn" onclick="scrollToBrandProducts()" title="Ver Productos">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <p style="text-align: center; color: #94a3b8; font-size: 1.1rem;">Próximamente más novedades de Backwoods.</p>
            </div>
        `;
    } else if (brandKey === 'donuts') {
        content.className = 'theme-donuts-full';
        content.innerHTML = `
            <img src="./fondoslog.jpg" class="muha-bg-fixed" alt="Fondo Donuts">
            <div class="brand-hero-common">
                <img src="./donutslogointerfaz.png" class="donuts-interface-logo" alt="Donuts Logo Interfaz">
                <button class="scroll-down-btn" onclick="scrollToBrandProducts()" title="Ver Productos">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">
                    ${donutsDonitaV3CardHTML}
                    ${donutsV2CardHTML}
                    <div class="donuts-product-card">
                        <span class="product-tag-new" style="color: #fb7185; border-color: rgba(251, 113, 133, 0.4); background: rgba(17, 24, 39, 0.9);">EDICIÓN ESPECIAL</span>
                        <div class="donuts-img-box"><img src="./donutslogointerfaz.png" alt="Donuts 2g"></div>
                        <div style="margin-bottom: 16px;">
                            <div class="product-name" style="color:#ffffff;">DONUTS 2g Disposable</div>
                            <div class="product-subtitle" style="color:#9ca3af;">Fryd Extracts Presents • Sativa / Indica</div>
                            <div class="product-price" style="color:#fb7185;">$750 MXN</div>
                        </div>
                        <button class="donuts-btn-add" onclick="event.stopPropagation(); addToCart('DONUTS 2g Disposable', 750, './donutslogointerfaz.png')">Agregar al Carrito</button>
                    </div>
                </div>
            </div>
        `;
    } else if (brandKey === 'packman') {
        content.className = 'theme-packman-full';
        content.innerHTML = `
            <img src="./packmanfondo.jpg" class="muha-bg-fixed" alt="Fondo Packman">
            <div class="packman-track-overlay">
                <div class="packman-ambient-parade" id="packmanAmbientParade">
                    ${getGhostSvgHTML('#ff0000')}${getGhostSvgHTML('#ffb8ff')}${getGhostSvgHTML('#00ffff')}${getGhostSvgHTML('#ffb852')}
                </div>
                <div class="packman-chase-squad" id="packmanChaseSquad">
                    ${getGhostSvgHTML('#2121ff', true)}${getGhostSvgHTML('#2121ff', true)}${getGhostSvgHTML('#2121ff', true)}${getGhostSvgHTML('#2121ff', true)}
                    <div class="pacman-runner"></div>
                </div>
            </div>
            <div class="brand-hero-common">
                <div class="muha-brand-group">
                    <img src="./packmanmarcas.png" alt="Packman Logo" class="packman-hero-logo">
                    <img src="./PACKMANSEGUNDOLOGO.png" alt="PACKMAN" class="packman-hero-title-img">
                </div>
                <button class="scroll-down-btn" onclick="runPackmanAction()" title="Ver Productos">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${packman3gCardHTML}</div>
            </div>
        `;
    }

    view.classList.add('active');
    view.scrollTop = 0;
    document.body.style.overflow = 'hidden';
}

function closeFullscreenBrand() {
    document.getElementById('brandFullscreenView').classList.remove('active');
    document.body.style.overflow = 'auto';
}

/* CARRITO DE COMPRAS */
function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
}

function addToCart(title, price, image) {
    const existingIndex = cart.findIndex(item => item.title === title);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ title, price, image, quantity: 1 });
    }
    updateCartUI();
    toggleCart();
}

function changeQty(title, delta) {
    const item = cart.find(item => item.title === title);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(i => i.title !== title);
    }
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const countSpan = document.getElementById('cart-count');
    const subtotalSpan = document.getElementById('subtotalPrice');
    const totalSpan = document.getElementById('totalPrice');

    container.innerHTML = '';
    let total = 0, totalItems = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#94a3b8; margin-top:40px;">Tu bolsa está vacía.</p>';
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.image}" class="cart-item-img" alt="${item.title}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price * item.quantity} MXN</div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="changeQty('${item.title}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQty('${item.title}', 1)">+</button>
                    </div>
                </div>
            `;
            container.appendChild(itemEl);
        });
    }

    countSpan.innerText = totalItems;
    subtotalSpan.innerText = `$${total.toLocaleString()} MXN`;
    totalSpan.innerText = `$${total.toLocaleString()} MXN`;
}

function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let message = "¡Hola Aeroshop! 🚀 Quisiera realizar el siguiente pedido:\n\n";
    let total = 0;

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        total += itemSubtotal;
        message += `• *${item.title}* (x${item.quantity}) - $${itemSubtotal} MXN\n`;
    });

    message += `\n*Total estimado:* $${total.toLocaleString()} MXN\n`;
    message += "\n¿Me pueden confirmar disponibilidad y datos de pago?";

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}
/* --- SECCIÓN 01: RUTAS DE VUELO CON OPTIMIZACIÓN DE MEMORIA --- */
let videoObserver = null;

function openRutasVuelo() {
    const view = document.getElementById('rutasFullscreenView');
    if (view) {
        view.classList.add('active');
        view.scrollTop = 0;
        document.body.style.overflow = 'hidden';
        
        // Activar observador inteligente de videos
        initVideoObserver(view);
    }
}
/* --- FUNCIÓN PARA CERRAR Y VOLVER AL MENÚ --- */
function closeRutasVuelo() {
    const view = document.getElementById('rutasFullscreenView');
    if (view) {
        view.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Pausa videos al salir para liberar procesamiento del celular
        const videos = view.querySelectorAll('video');
        videos.forEach(video => video.pause());
    }
}
function initVideoObserver(container) {
    if (!('IntersectionObserver' in window)) return;

    if (!videoObserver) {
        videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.3 });
    }

    const videos = container.querySelectorAll('video');
    videos.forEach(video => {
        video.muted = true;
        videoObserver.observe(video);
    });
}
/* FILTRADO DE RUTAS DE VUELO */
document.addEventListener('DOMContentLoaded', () => {
    const botonesFiltro = document.querySelectorAll('.btn-filtro');

    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', () => {
            botonesFiltro.forEach(btn => btn.classList.remove('activo'));
            boton.classList.add('activo');

            const zonaSeleccionada = boton.getAttribute('data-zona');
            const spots = document.querySelectorAll('#rutasGrid .compact-card');

            spots.forEach(spot => {
                const zonaSpot = spot.getAttribute('data-zona');
                if (zonaSeleccionada === 'todo' || zonaSeleccionada === zonaSpot) {
                   spot.style.display = 'block';
                } else {
                    spot.style.display = 'none';
                }
            });
        });
    });

    /* PREGUNTAS FRECUENTES (HOVER) */
    const faqCards = document.querySelectorAll('.faq-card');
    faqCards.forEach(card => {
        card.addEventListener('mouseenter', () => { card.open = true; });
        card.addEventListener('mouseleave', () => { card.open = false; });
    });
});

/* --- SECCIÓN 02: MONCHIS Y BAJAR AVIÓN --- */
function openMonchisVuelo() {
    const view = document.getElementById('monchisFullscreenView');
    if (view) {
        view.classList.add('active');
        document.body.style.overflow = 'hidden';
        filterMonchisCards();
    }
}

function closeMonchisVuelo() {
    const view = document.getElementById('monchisFullscreenView');
    if (view) {
        view.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function switchMonchisTab(tab) {
    const tabCalleBtn = document.getElementById('tabCalleBtn');
    const tabCasaBtn = document.getElementById('tabCasaBtn');
    const filtersCalle = document.getElementById('filtersCalle');
    const filtersCasa = document.getElementById('filtersCasa');

    if (tab === 'calle') {
        tabCalleBtn.classList.add('active');
        tabCasaBtn.classList.remove('active');
        filtersCalle.style.display = 'flex';
        filtersCasa.style.display = 'none';
    } else {
        tabCasaBtn.classList.add('active');
        tabCalleBtn.classList.remove('active');
        filtersCasa.style.display = 'flex';
        filtersCalle.style.display = 'none';
    }
    filterMonchisCards();
}

function filterMonchisCards() {
    const activeTab = document.getElementById('tabCalleBtn')?.classList.contains('active') ? 'calle' : 'casa';
    const cards = document.querySelectorAll('#monchisGrid .compact-card');
    
    cards.forEach(card => {
        const cardTipo = card.getAttribute('data-tipo');
        if (cardTipo !== activeTab) {
            card.style.display = 'none';
            return;
        }

        if (activeTab === 'calle') {
            const zona = document.getElementById('filterZona')?.value || 'todos';
            const antojo = document.getElementById('filterAntojoCalle')?.value || 'todos';
            const matchZona = (zona === 'todos' || card.getAttribute('data-zona') === zona);
            const matchAntojo = (antojo === 'todos' || card.getAttribute('data-antojo') === antojo);
            card.style.display = (matchZona && matchAntojo) ? 'block' : 'none';
        } else {
            const antojo = document.getElementById('filterAntojoCasa')?.value || 'todos';
            const matchAntojo = (antojo === 'todos' || card.getAttribute('data-antojo') === antojo);
            card.style.display = matchAntojo ? 'block' : 'none';
        }
    });
}

/* --- SECCIÓN 03: TRIP VISUAL & CINE --- */
function openCineVuelo() {
    const cineView = document.getElementById('cineFullscreenView');
    if (cineView) {
        cineView.classList.add('active');
        document.body.style.overflow = 'hidden';
        filterCineCards();
    }
}

function closeCineVuelo() {
    const cineView = document.getElementById('cineFullscreenView');
    if (cineView) {
        cineView.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function filterCineCards() {
    const categoria = document.getElementById('filterCategoriaCine')?.value || 'todos';
    const cards = document.querySelectorAll('#cineGrid .compact-card');

    cards.forEach(card => {
        const cardCat = card.getAttribute('data-categoria');
        if (categoria === 'todos' || cardCat === categoria) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/* ==========================================
   BASE DE DATOS COMPLETA DE TARJETAS (01, 02, 03)
   ========================================== */
const cardDetailsDB = {
    // --- SECCIÓN 01: RUTAS DE VUELO ---
    cenart: {
        title: "CENART (Centro Nacional de las Artes) 📍 Sur",
        video: "./cenart-hero.mp4",
        badge: "Calificación: ✈️✈️✈️✈️ • 🟡 Discreción Media",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Este lugar es una joya visual. Tienes áreas verdes enormes, una arquitectura loquísima para quedarte viendo las formas un buen rato, y una vibra artística donde todo el mundo anda en su propio rollo. Es el spot perfecto para tirarte al pasto a filosofar o simplemente desconectar del ruido de la ciudad.
            </p>
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Te recomiendo explorar por todo el CENART hasta llegar a la Cineteca de las Artes, donde hay un extenso jardín en el que puedes acostarte a filosofar o escuchar tu álbum favorito.
            </p>
            <div style="background: rgba(234, 179, 8, 0.15); border-left: 4px solid #facc15; padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                <strong style="color: #facc15;">Radar de Discreción: 🟡 Medio.</strong>
                <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">Hay guardias dando rondines. Lo mejor es darte los toques discretamente en las bancas de piedra más alejadas.</span>
            </div>
            <h4 style="color: #ffffff; margin-bottom: 8px;">Cómo llegar:</h4>
            <ul style="color: #cbd5e1; font-size: 0.9rem; padding-left: 18px; margin-bottom: 16px;">
                <li><a href="https://maps.app.goo.gl/HGykU9WUyai3MsS27" target="_blank" style="color: #38bdf8;">🚇 Desde Metro Ermita (Línea 12 / Línea 2)</a></li>
                <li><a href="https://maps.app.goo.gl/DE3gEKnzfB2KZVtJ8" target="_blank" style="color: #38bdf8;">🚇 Desde Metro General Anaya (Línea 2)</a></li>
            </ul>
            <img src="./cenart-mapas.jpg" alt="Mapa CENART" style="width: 100%; border-radius: 12px;">
        `
    },
    chapultepec: {
        title: "Cineteca de Chapultepec 📍 Poniente",
        video: "./Chapultepec.mp4",
        badge: "Calificación: ✈️✈️✈️✈️ • 🟡 Discreción Media",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Una joya visual futurista incrustada en medio de la naturaleza. Es un spot alucinante para ir estando bajo los efectos del waxito gracias a sus foros al aire libre, pantallas gigantes y terrazas elevadas con vistas increíbles hacia el Bosque de Chapultepec.
            </p>
            <div style="background: rgba(234, 179, 8, 0.15); border-left: 4px solid #facc15; padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                <strong style="color: #facc15;">Radar de Discreción: 🟡 Medio.</strong>
                <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">Hay vigilancia en los accesos principales. Se recomienda llegar ya volando o buscar áreas verdes exteriores más despejadas.</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.88rem;">📍 Av. Vasco de Quiroga #1401, Colonia Santa Fe, CDMX.</p>
        `
    },
    laguna: {
        title: "Laguna CDMX 📍 Centro",
        video: "./LAGUNA.MP4",
        badge: "Calificación: ✈️✈️✈️✈️ • 🟢 Discreción Alta",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Espacio cultural reutilizado a partir de una antigua fábrica industrial con una vibra alternativa increíble. Cuenta con cafés de especialidad, galerías y patios abiertos rodeados de vegetación ideal para desconectarte del ruido urbano.
            </p>
            <div style="background: rgba(34, 197, 94, 0.15); border-left: 4px solid #22c55e; padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                <strong style="color: #4ade80;">Radar de Discreción: 🟢 Bajo (Libre).</strong>
                <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">Puedes sacar con total libertad tu waxito en los espacios abiertos y patios interiores.</span>
            </div>
            <p style="color: #94a3b8; font-size: 0.88rem;">📍 C. Dr. Lucio 181, Doctores, Cuauhtémoc, CDMX.</p>
        `
    },
    jardin: {
        title: "Jardín Escénico 📍 Poniente",
        video: "./jardin.mp4",
        badge: "Calificación: ✈️✈️✈️ • 🟡 Discreción Media",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Área verde enorme con césped perfecto para tirarte a acostar. Lo que realmente le mete candela al trip es el contraste urbano: estás rodeado de los rascacielos de Reforma que, estando high, se ven increíbles tocando el cielo.
            </p>
            <div style="background: rgba(234, 179, 8, 0.15); border-left: 4px solid #facc15; padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                <strong style="color: #facc15;">Radar de Discreción: 🟡 Medio.</strong>
                <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">Mantén la discreción, busca una zona tranquila en el pasto y da los toques disimuladamente.</span>
            </div>
        `
    },
    eden: {
        title: "Jardín El Edén CU 📍 Sur",
        video: "./eden.mp4",
        badge: "Calificación: ✈️✈️✈️ • 🟢 Discreción Alta",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Espacio 100% abierto al público y a la pandilla 4:20. Aquí puedes sacar tu waxito sin problema mientras disfrutas de una vista espectacular hacia la Torre de Rectoría y el Estadio Olímpico Universitario.
            </p>
            <div style="background: rgba(34, 197, 94, 0.15); border-left: 4px solid #22c55e; padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                <strong style="color: #4ade80;">Radar de Discreción: 🟢 Bajo (Libre).</strong>
                <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">Lugar totalmente libre y relajado para darle a la pluma en el pasto.</span>
            </div>
            <img src="./pumabus-rutas.jpg" alt="Rutas Pumabús" style="width: 100%; border-radius: 12px;">
        `
    },
    soumaya: {
        title: "Museo Soumaya 📍 Poniente",
        video: "./soumaya.mp4",
        badge: "Calificación: ✈️✈️✈️✈️ • 🔴 Discreción Baja",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Fachada curva cubierta de hexágonos de aluminio fascinante. Adentro recorres una rampa helicoidal continua llena de esculturas e iluminada de forma envolvente, ideal para quedarte contemplando detalles durante horas.
            </p>
            <div style="background: rgba(239, 68, 68, 0.15); border-left: 4px solid #ef4444; padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                <strong style="color: #f87171;">Radar de Discreción: 🔴 Alto (Semáforo Rojo).</strong>
                <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">La seguridad interna es muy estricta. Lo mejor es llegar ya en el trip desde afuera.</span>
            </div>
        `
    },
    muac: {
        title: "MUAC CU 📍 Sur",
        video: "./muac.mp4",
        badge: "Calificación: ✈️✈️✈️✈️✈️ • 🟡 Discreción Media",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Destino predilecto en el sur para ver arte contemporáneo, instalaciones inmersivas y piezas conceptuales cuando andas high, rodeado del paisaje volcánico del Pedregal.
            </p>
            <div style="background: rgba(234, 179, 8, 0.15); border-left: 4px solid #facc15; padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                <strong style="color: #facc15;">Radar de Discreción: 🟡 Medio.</strong>
                <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">En la explanada exterior y jardines de piedra volcánica hay bastantes rincones tranquilos.</span>
            </div>
            <img src="./pumabus-rutas.jpg" alt="Rutas Pumabús" style="width: 100%; border-radius: 12px;">
        `
    },

    // --- SECCIÓN 02: MONCHIS ---
    salchichas: {
        title: "Salchichas BBQ de Ricardo Pérez 🌭",
        video: "./salchichasbbq.MP4",
        badge: "🏠 Supervivencia en Casa • 🧂 Salado",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Un verdadero clásico de culto para las noches de bajón intenso. Esta receta es pura magia rápida cuando traes el monchis salado a tope y no quieres complicarte la vida en la cocina.
            </p>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
                <strong style="color: #facc15; display: block; margin-bottom: 8px;">🛒 Ingredientes:</strong>
                <ul style="color: #e2e8f0; font-size: 0.88rem; padding-left: 18px; margin: 0; line-height: 1.6;">
                    <li>🌭 Salchichas (en rodajas).</li>
                    <li>🧅 Cebolla finita.</li>
                    <li>🌶️ 1 Chile serrano.</li>
                    <li>🍅 Cátsup y Salsa BBQ.</li>
                    <li>🍟 (Opcional) Papas fritas y salsa Ranch.</li>
                </ul>
            </div>
            <div style="background: rgba(234, 179, 8, 0.15); border-left: 4px solid #facc15; padding: 12px 14px; border-radius: 10px;">
                <strong style="color: #facc15; font-size: 0.9rem; display: block; margin-bottom: 4px;">💡 Pro-Tip de Bajón Supremo:</strong>
                <span style="color: #f8fafc; font-size: 0.85rem;">Sirve una base de papas fritas crujientes, echa la mezcla encima y baña con Ranch.</span>
            </div>
        `
    },

    // --- SECCIÓN 03: TRIP VISUAL & CINE ---
    void: {
        title: "ENTER THE VOID (2009) 🎬",
        video: "./VOID.MP4",
        badge: "Película Psicodélica & Inmersiva • ⏱️ 2 h 41 min • 🔞 18+",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                <strong>👁️ ¿De qué trata?</strong><br>
                Ubicada en los neones nocturnos de Tokio, la historia sigue a Oscar, un joven estadounidense abatido por la policía en un club nocturno. Tras su muerte, su conciencia se desprende y flota por la ciudad reviviendo memorias y experimentando una travesía espiritual basada en el Libro Tibetano de los Muertos.
            </p>
            <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 12px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <strong style="color: #facc15; display: block; margin-bottom: 8px;">🌀 ¿Por qué es perfecta para tu trip?</strong>
                <ul style="color: #e2e8f0; font-size: 0.9rem; padding-left: 18px; line-height: 1.6;">
                    <li><strong>Cámara en primera persona:</strong> Tomás aéreas y plano secuencia donde la cámara "flota" sobre Tokio.</li>
                    <li><strong>Estética neón y fractales:</strong> Geometrías sagradas y transiciones hipnóticas de viajes espirituales.</li>
                    <li><strong>Experiencia inmersiva:</strong> Diseñada por Gaspar Noé como una montaña rusa sensorial fuera del cuerpo.</li>
                </ul>
            </div>
            <div style="background: rgba(56, 189, 248, 0.15); border-left: 4px solid #38bdf8; padding: 12px; border-radius: 8px;">
                <strong style="color: #38bdf8;">📺 Dónde ver:</strong>
                <p style="color: #f8fafc; font-size: 0.9rem; margin-top: 4px;">Disponible en MUBI, Prime Video y Apple TV (Renta digital / Catálogo).</p>
            </div>
        `
    },
    belladonna: {
        title: "BELLADONNA OF SADNESS (1973) 🎬",
        video: "./BELLADONNA.MP4",
        badge: "Anime Psicodélico de Culto • ⏱️ 1 h 27 min • 🔞 18+",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                <strong>👁️ ¿De qué trata?</strong><br>
                Ubicada en una Europa medieval estilizada, sigue a Jeanne, una campesina que tras sufrir una injusticia hace un pacto místico con el Diablo. Con sus nuevos poderes mágicos y de seducción, inicia una revolución sensorial transformándose en una figura de poder.
            </p>
            <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 12px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <strong style="color: #facc15; display: block; margin-bottom: 8px;">🌀 ¿Por qué es perfecta para tu trip?</strong>
                <ul style="color: #e2e8f0; font-size: 0.9rem; padding-left: 18px; line-height: 1.6;">
                    <li><strong>Arte psicodélico fluido:</strong> Hecha con acuarelas gigantescas que cobran vida con animaciones líquidas.</li>
                    <li><strong>Viaje surrealista:</strong> Obra avant-garde de los años 70 que combina Art Nouveau con Pop-Art.</li>
                    <li><strong>Banda sonora hipnótica:</strong> Jazz-rock psicodélico y sintetizadores vintage.</li>
                </ul>
            </div>
            <div style="background: rgba(56, 189, 248, 0.15); border-left: 4px solid #38bdf8; padding: 12px; border-radius: 8px;">
                <strong style="color: #38bdf8;">📺 Dónde ver:</strong>
                <p style="color: #f8fafc; font-size: 0.9rem; margin-top: 4px;">Disponible en Prime Video, Apple TV, MUBI, YouTube o Vimeo.</p>
            </div>
        `
    },
    puparia: {
        title: "PUPARIA (2020) 🎬",
        video: "./PUPARIA.MP4",
        badge: "Cortometraje Anime Contemplativo • ⏱️ 3 min • 🌀 Todo público",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                <strong>👁️ ¿De qué trata?</strong><br>
                Creado de forma independiente por Shingo Tamagawa tras más de 3 años de trabajo artesanal a mano. Sin diálogos, explora el concepto de la crisálida y el despertar interior a través de miradas de personajes misteriosos y seres mitológicos.
            </p>
            <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 12px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <strong style="color: #facc15; display: block; margin-bottom: 8px;">🌀 ¿Por qué es perfecta para tu trip?</strong>
                <ul style="color: #e2e8f0; font-size: 0.9rem; padding-left: 18px; line-height: 1.6;">
                    <li><strong>Textura pictórica hiperdetallada:</strong> Dibujado fotograma por fotograma con lápices de colores.</li>
                    <li><strong>Micro-viaje expres:</strong> 3 minutos de trance hipnótico ideales para ponerse audífonos y relajarse.</li>
                    <li><strong>Conexión psicológica:</strong> Miradas intensas que traspasan la pantalla.</li>
                </ul>
            </div>
            <div style="background: rgba(56, 189, 248, 0.15); border-left: 4px solid #38bdf8; padding: 12px; border-radius: 8px;">
                <strong style="color: #38bdf8;">📺 Dónde ver:</strong>
                <p style="color: #f8fafc; font-size: 0.9rem; margin-top: 4px;">Disponible gratis y en 4K en el canal oficial de Shingo Tamagawa en YouTube.</p>
            </div>
        `
    },
    goodtrip: {
        title: "HAVE A GOOD TRIP (2020) 🎬",
        video: "./GOOD-TRIP.MP4",
        badge: "Documental & Comedia • ⏱️ 1 h 25 min • 🔞 16+",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                <strong>👁️ ¿De qué trata?</strong><br>
                Documental cómico donde celebridades (Sting, A$AP Rocky, Ben Stiller) comparten de forma honesta sus historias reales más locas consumiendo psicodélicos, recreadas con animaciones surrealistas y marionetas.
            </p>
            <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 12px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <strong style="color: #facc15; display: block; margin-bottom: 8px;">🌀 ¿Por qué es perfecta para tu trip?</strong>
                <ul style="color: #e2e8f0; font-size: 0.9rem; padding-left: 18px; line-height: 1.6;">
                    <li><strong>Risas garantizadas:</strong> Enfoque puro en la comedia y la buena vibra para evitar mal viajes.</li>
                    <li><strong>Animaciones alucinantes:</strong> Recreaciones visuales súper coloridas y dinámicas.</li>
                    <li><strong>Conducido por Nick Offerman:</strong> Combina anécdotas absurdas con reflexiones sobre la mente.</li>
                </ul>
            </div>
            <div style="background: rgba(56, 189, 248, 0.15); border-left: 4px solid #38bdf8; padding: 12px; border-radius: 8px;">
                <strong style="color: #38bdf8;">📺 Dónde ver:</strong>
                <p style="color: #f8fafc; font-size: 0.9rem; margin-top: 4px;">Disponible de forma exclusiva en Netflix.</p>
            </div>
        `
    },
    entergalactic: {
        title: "ENTERGALACTIC (2022) 🎬",
        video: "./ENTERGALACTIC.MP4",
        badge: "Animación Urbana & Álbum Visual • ⏱️ 1 h 32 min • 🔞 16+",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                <strong>👁️ ¿De qué trata?</strong><br>
                Creado por Kid Cudi, es un especial de animación para adultos que acompaña a su álbum homónimo. Sigue a Jabari, un artista de graffiti en Nueva York que navega entre el éxito, el amor y la vida nocturna.
            </p>
            <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 12px; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <strong style="color: #facc15; display: block; margin-bottom: 8px;">🌀 ¿Por qué es perfecta para tu trip?</strong>
                <ul style="color: #e2e8f0; font-size: 0.9rem; padding-left: 18px; line-height: 1.6;">
                    <li><strong>Estética neón estilo cómic:</strong> Animación 3D/2D donde cada cuadro parece una pintura digital.</li>
                    <li><strong>Soundtrack de Kid Cudi:</strong> Hip-hop alternativo, synthwave y R&B marcando el ritmo visual.</li>
                    <li><strong>Viajes cósmicos:</strong> La animación se transforma en viajes flotando entre estrellas y la galaxia urbana.</li>
                </ul>
            </div>
            <div style="background: rgba(56, 189, 248, 0.15); border-left: 4px solid #38bdf8; padding: 12px; border-radius: 8px;">
                <strong style="color: #38bdf8;">📺 Dónde ver:</strong>
                <p style="color: #f8fafc; font-size: 0.9rem; margin-top: 4px;">Disponible de forma exclusiva en Netflix.</p>
            </div>
        `
    }
};

/* MODAL INFORMATIVA GLOBAL PARA TARJETAS COMPACTAS */
function openCardModal(section, key) {
    const data = cardDetailsDB[key];
    if (!data) return;

    const modalBody = document.getElementById('infoModalBody');
    modalBody.innerHTML = `
        <video src="${data.video}" autoplay loop muted playsinline></video>
        <span class="badge-tag" style="margin-bottom: 10px; display: inline-block;">${data.badge}</span>
        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 15px; color: #ffffff;">${data.title}</h2>
        ${data.html}
    `;

    document.getElementById('infoModalOverlay').classList.add('active');
}

function closeInfoModal() {
    document.getElementById('infoModalOverlay').classList.remove('active');
}

function closeInfoModalOnOverlay(e) {
    if (e.target.id === 'infoModalOverlay') {
        closeInfoModal();
    }
}
/* --- FUNCIONALIDAD BUZÓN DE SUGERENCIAS Y DUDAS --- */
function openBuzonModal() {
    const overlay = document.getElementById('buzonModalOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeBuzonModal() {
    const overlay = document.getElementById('buzonModalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function closeBuzonOnOverlay(e) {
    if (e.target.id === 'buzonModalOverlay') {
        closeBuzonModal();
    }
}
function sendBuzonWhatsApp(event) {
    event.preventDefault();

    const tipo = document.getElementById('buzonTipo').value;
    const nombre = document.getElementById('buzonNombre').value.trim() || 'Anónimo';
    const mensaje = document.getElementById('buzonMensaje').value.trim();

    let text = `*📪 NUEVA ENTRADA AL BUZÓN AEROSHOP*\n\n`;
    text += `*Categoría:* ${tipo}\n`;
    text += `*De:* ${nombre}\n\n`;
    text += `*Mensaje / Detalle:*\n${mensaje}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    
    document.getElementById('buzonMensaje').value = '';
    closeBuzonModal();
}
