let currentUserProfile = null;

// Escuchador de estado de autenticación
window.fbMethods.onAuthStateChanged(window.auth, async (user) => {
    if (user) {
        await syncUserProfile(user);
        checkAdminPermission(user);
    } else {
        currentUserProfile = null;
        checkAdminPermission(null); // Oculta el panel y botón al cerrar sesión
    }
});

async function syncUserProfile(user) {
    const { doc, getDoc, setDoc } = window.fbMethods;
    const userRef = doc(window.db, "usuarios", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        currentUserProfile = snap.data();
    } else {
        // Registro inicial del nuevo Pasajero (Sistema 3/3)
currentUserProfile = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    vuelos_acumulados: 0,
    descuento_bienvenida_activo: true,
    favoritos: [],
    fecha_registro: new Date().toISOString(),
    acepto_aviso_privacidad: true,
    fecha_aceptacion_privacidad: new Date().toISOString(),
    version_aviso: "v1.0-LFPDPPP"
};
        await setDoc(userRef, currentUserProfile);
    }

    renderPasaporteUI();
}

function renderPasaporteUI() {
    if (!currentUserProfile) return;
// Generación dinámica de QR con la API oficial de QRServer
const qrImg = document.getElementById('userQrCodeImg');
if (qrImg && currentUserProfile.uid) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentUserProfile.uid}`;
}
    // Sincronizar datos directamente con la nueva tarjeta de Perfil (Estilo Adidas)
    const nameElem = document.getElementById('userName');
    const emailElem = document.getElementById('userEmail');
    const avatarElem = document.getElementById('userAvatar');

    if (nameElem) nameElem.innerText = currentUserProfile.displayName;
    if (emailElem) emailElem.innerText = currentUserProfile.email;
    if (avatarElem && currentUserProfile.photoURL) avatarElem.src = currentUserProfile.photoURL;

    // Conteo de Vuelos (Sistema 3/3)
    const vuelos = currentUserProfile.vuelos_acumulados || 0;
    const countText = document.getElementById('vuelosCountText');
    if (countText) countText.innerText = `${vuelos} / 3 VUELOS`;

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    if (step1) step1.classList.toggle('active', vuelos >= 1);
    if (step2) step2.classList.toggle('active', vuelos >= 2);
    if (step3) step3.classList.toggle('active', vuelos >= 3);
}

let cart = [];
const phone = "525561446446";
let selectedStrain = 'Sativa';
let currentModalProduct = {
    title: 'MUHACMEDS 2g',
    price: 700,
    image: './Muhacmeds1.JPG'
};
let currentMonchisTab = 'calle';

function scrollToBrandProducts() {
    const target = document.getElementById('brandProductsSection');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}
/* FUNCIONALIDAD CARRUSEL CON COMPATIBILIDAD DE VIDEO, ROTACIÓN LIMPIA Y TÁCTIL */
function startHoverSlider(container) {
    // Protección: Evita que se creen múltiples animaciones si el usuario toca la pantalla varias veces
    if (container._intervalId) return; 

    const mediaElements = container.querySelectorAll('img, video');
    if (mediaElements.length <= 1) return;
    
    // Detectamos cuál es la imagen/video que está activo actualmente
    let currentIndex = 0;
    mediaElements.forEach((el, idx) => {
        if (el.classList.contains('active')) {
            currentIndex = idx;
        }
    });

    container._intervalId = setInterval(() => {
        mediaElements[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % mediaElements.length;
        mediaElements[currentIndex].classList.add('active');
    }, 1200);
}

// ¡ESTA ES LA FUNCIÓN QUE SE HABÍA BORRADO, DEBE IR AQUÍ ABAJO!
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
    openModalState(); // 👈 ESTA LÍNEA OCULTA LOS BOTONES Y CONGELA EL FONDO
    const mediaContainer = document.getElementById('modalMediaContainer');
    const thumbnailsContainer = document.getElementById('modalThumbnails');
    const strainPillsContainer = document.getElementById('modalStrainPills');

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
        strainPillsContainer.innerHTML = `
            <button class="strain-pill selected" onclick="selectStrain(this, 'Sativa')">Sativa</button>
            <button class="strain-pill" onclick="selectStrain(this, 'Indica')">Indica</button>
            <button class="strain-pill" onclick="selectStrain(this, 'Híbrida')">Híbrida</button>
        `;
        selectedStrain = 'Sativa';

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
        strainPillsContainer.innerHTML = `
            <button class="strain-pill selected" onclick="selectStrain(this, 'Sativa')">Sativa</button>
            <button class="strain-pill" onclick="selectStrain(this, 'Indica')">Indica</button>
            <button class="strain-pill" onclick="selectStrain(this, 'Híbrida')">Híbrida</button>
        `;
        selectedStrain = 'Sativa';

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
        strainPillsContainer.innerHTML = `
            <button class="strain-pill selected" onclick="selectStrain(this, 'Sativa')">Sativa</button>
            <button class="strain-pill" onclick="selectStrain(this, 'Indica')">Indica</button>
            <button class="strain-pill" onclick="selectStrain(this, 'Híbrida')">Híbrida</button>
        `;
        selectedStrain = 'Sativa';

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
        strainPillsContainer.innerHTML = `
            <button class="strain-pill selected" onclick="selectStrain(this, 'Sativa')">Sativa</button>
            <button class="strain-pill" onclick="selectStrain(this, 'Indica')">Indica</button>
            <button class="strain-pill" onclick="selectStrain(this, 'Híbrida')">Híbrida</button>
        `;
        selectedStrain = 'Sativa';

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
        strainPillsContainer.innerHTML = `
            <button class="strain-pill selected" onclick="selectStrain(this, 'Híbrida')">Híbrida</button>
            <button class="strain-pill" onclick="selectStrain(this, 'Sativa')">Sativa</button>
        `;
        selectedStrain = 'Híbrida';
    }

    document.getElementById('productModalOverlay').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModalOverlay').classList.remove('active');
    closeModalState(); // 👈 ESTA LÍNEA DEVUELVE LOS BOTONES Y REGRESA EL SCROLL
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
    let subtotal = 0;

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        subtotal += itemSubtotal;
        message += `• *${item.title}* (x${item.quantity}) - $${itemSubtotal} MXN\n`;
    });

    let total = subtotal;
    message += `\n*Subtotal:* $${subtotal.toLocaleString()} MXN\n`;

    // Inyección de Metadatos si el usuario tiene Pasaporte Activo
    if (currentUserProfile) {
        message += `\n--- 🎟️ PASAPORTE AEROSHOP ---`;
        message += `\n*Pasajero:* ${currentUserProfile.displayName}`;
        message += `\n*ID Cliente:* #USR-${currentUserProfile.uid.slice(-5).toUpperCase()}`;
        message += `\n*Nivel de Vuelos:* ${currentUserProfile.vuelos_acumulados}/3`;

        // Aplicación automática de promociones del Pasaporte
        if (currentUserProfile.descuento_bienvenida_activo) {
            const descuento = subtotal * 0.10;
            total = subtotal - descuento;
            message += `\n*PROMO APLICADA:* 10% OFF Bienvenida (-$${descuento.toLocaleString()} MXN)`;
        } else if (currentUserProfile.vuelos_acumulados >= 3) {
            message += `\n*PROMO APLICADA:* ¡REGALO ESPECIAL DE VUELO #3 DISPONIBLE! 🎁`;
        }
    } else {
        message += `\n_💡 Tip: Inicia sesión en la web para activar 10% OFF y acumular vuelos._\n`;
    }

    message += `\n*TOTAL A PAGAR:* $${total.toLocaleString()} MXN\n`;
    message += "\n¿Me pueden confirmar disponibilidad y datos de pago?";

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

/* --- FUNCIONES REUTILIZABLES PARA REPRODUCCIÓN FLUIDA DE VIDEOS --- */
function playSectionVideos(container) {
    if (!container) return;
    // Solo reproduce el video hero principal, no las tarjetas compactas
    const heroVideo = container.querySelector('.monchis-hero-video, #cineHeroVideo');
    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.playsInline = true;
        heroVideo.play().catch(err => console.log("Autoplay diferido:", err));
    }
}

function pauseSectionVideos(container) {
    if (!container) return;
    const videos = container.querySelectorAll('video');
    videos.forEach(video => video.pause());
}

/* --- SECCIÓN 01: RUTAS DE VUELO --- */
function openRutasVuelo() {
    const view = document.getElementById('rutasFullscreenView');
    if (view) {
        view.classList.add('active');
        view.scrollTop = 0;
        document.body.style.overflow = 'hidden';
        playSectionVideos(view);
    }
}

function closeRutasVuelo() {
    const view = document.getElementById('rutasFullscreenView');
    if (view) {
        view.classList.remove('active');
        document.body.style.overflow = 'auto';
        pauseSectionVideos(view);
    }
}

/* FILTRADO DE RUTAS DE VUELO POR ZONAS */
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
                if (zonaSeleccionada === 'todo' || zonaSeleccionada === 'todos' || zonaSeleccionada === zonaSpot) {
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
        playSectionVideos(view);
    }
}

function closeMonchisVuelo() {
    const view = document.getElementById('monchisFullscreenView');
    if (view) {
        view.classList.remove('active');
        document.body.style.overflow = 'auto';
        pauseSectionVideos(view);
    }
}

function switchMonchisTab(tab) {
    currentMonchisTab = tab;

    const btnCalle = document.getElementById('tabCalleBtn');
    const btnCasa = document.getElementById('tabCasaBtn');
    const filtersCalle = document.getElementById('filtersCalle');
    const filtersCasa = document.getElementById('filtersCasa');

    if (tab === 'calle') {
        btnCalle?.classList.add('active');
        btnCasa?.classList.remove('active');
        if (filtersCalle) filtersCalle.style.display = 'flex';
        if (filtersCasa) filtersCasa.style.display = 'none';
    } else {
        btnCasa?.classList.add('active');
        btnCalle?.classList.remove('active');
        if (filtersCasa) filtersCasa.style.display = 'flex';
        if (filtersCalle) filtersCalle.style.display = 'none';
    }

    filterMonchisCards();
}

function filterMonchisCards() {
    const cards = document.querySelectorAll('#monchisGrid .compact-card');

    if (currentMonchisTab === 'calle') {
        const zona = document.getElementById('filterZona')?.value || 'todos';
        const antojo = document.getElementById('filterAntojoCalle')?.value || 'todos';

        cards.forEach(card => {
            const tipoCard = card.getAttribute('data-tipo');
            const zonaCard = card.getAttribute('data-zona');
            const antojoCard = card.getAttribute('data-antojo');

            const matchTipo = (tipoCard === 'calle');
            const matchZona = (zona === 'todos' || zonaCard === zona);
            const matchAntojo = (antojo === 'todos' || antojoCard === antojo);

            if (matchTipo && matchZona && matchAntojo) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    } else if (currentMonchisTab === 'casa') {
        const antojo = document.getElementById('filterAntojoCasa')?.value || 'todos';

        cards.forEach(card => {
            const tipoCard = card.getAttribute('data-tipo');
            const antojoCard = card.getAttribute('data-antojo');

            const matchTipo = (tipoCard === 'casa');
            const matchAntojo = (antojo === 'todos' || antojoCard === antojo);

            if (matchTipo && matchAntojo) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

/* --- SECCIÓN 03: TRIP VISUAL & CINE --- */
function openCineVuelo() {
    const cineView = document.getElementById('cineFullscreenView');
    if (cineView) {
        cineView.classList.add('active');
        document.body.style.overflow = 'hidden';
        filterCineCards();
        playSectionVideos(cineView);
    }
}

function closeCineVuelo() {
    const cineView = document.getElementById('cineFullscreenView');
    if (cineView) {
        cineView.classList.remove('active');
        document.body.style.overflow = 'auto';
        pauseSectionVideos(cineView);
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
// --- DENTRO DE const cardDetailsDB = { ... } EN app.js ---

// --- SECCIÓN MONCHIS ---
oreo: {
    title: "Bolitas de Oreo Mágicas 🍩",
    video: "./OREO.MP4",
    badge: "🏠 Supervivencia en Casa • 🍿 Dulce",
    html: `
        <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #facc15; display: block; margin-bottom: 8px;">🛒 Ingredientes:</strong>
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">2 paquetes de galletas Oreo, 2 cucharadas de queso crema y 200 g de chocolate blanco para cobertura.</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #facc15; display: block; margin-bottom: 8px;">👨‍🍳 Preparación:</strong>
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">Triturar las galletas en procesador o bolsa (reservar 1 cucharada del polvo para decorar). Mezclar el polvo con el queso crema hasta integrar una masa moldeable. Aceitar ligeramente las manos, formar bolitas, sumergirlas en el chocolate blanco derretido y espolvorear la galleta reservada encima antes de enfriar.</p>
        </div>
        <div style="background: rgba(34, 197, 94, 0.15); border-left: 4px solid #22c55e; padding: 12px; border-radius: 8px;">
            <strong style="color: #4ade80;">✈️ Nivel de Bajón:</strong>
            <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">4/5 — Rápido, fácil y súper chocolatoso</span>
        </div>
    `
},
cotorras: {
    title: "Taco Austero de Jamón y Mayo (Estilo Slobo / La Cotorrisa) 🌮",
    video: "./cotorras.MP4",
    badge: "🏠 Supervivencia en Casa • 🍿 Salado / Bajón Express",
    html: `
        <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #facc15; display: block; margin-bottom: 8px;">🛒 Ingredientes:</strong>
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">Tortilla de maíz, mayonesa al gusto y rebanadas de jamón de pavo o pierna.</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #facc15; display: block; margin-bottom: 8px;">👨‍🍳 Preparación:</strong>
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">Calentar la tortilla de maíz directamente en el comal. Untar una capa generosa de mayonesa sobre la tortilla caliente, agregar 2 o 3 rebanadas de jamón dobladas, enrollar en forma de taco y disfrutar.</p>
        </div>
        <div style="background: rgba(34, 197, 94, 0.15); border-left: 4px solid #22c55e; padding: 12px; border-radius: 8px;">
            <strong style="color: #4ade80;">✈️ Nivel de Bajón:</strong>
            <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">3/5 — El salvavidas definitivo de las 3:00 AM</span>
        </div>
    `
},
salchicha_hawaiana: {
    title: "La Salchicha Slushelta de Gumball 🌭🧀",
    video: "./salchicha.MP4",
    badge: "🏠 Supervivencia en Casa • 🍿 Salado / Monchis Extremo",
    html: `
        <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #facc15; display: block; margin-bottom: 8px;">🛒 Ingredientes:</strong>
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">Salchichas rojas para asar, tocino, tocineta, nuggets de pollo, papas a la francesa y queso cheddar para nachos.</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #facc15; display: block; margin-bottom: 8px;">👨‍🍳 Preparación:</strong>
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">Derretir mantequilla en una olla y mezclar con abundante queso cheddar caliente. En sartén, freír tocino, tocineta y las salchichas rojas cortadas a la mitad. En la misma grasa, dorar nuggets, papas a la francesa y salchichas picadas. Montar la base con las salchichas abiertas, bañar con queso cheddar, colocar encima el tocino, las papas, las salchichas en trozos y coronar con los nuggets.</p>
        </div>
        <div style="background: rgba(34, 197, 94, 0.15); border-left: 4px solid #22c55e; padding: 12px; border-radius: 8px;">
            <strong style="color: #4ade80;">✈️ Nivel de Bajón:</strong>
            <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">5/5 — Bomba calórica de sabor ilimitado</span>
        </div>
    `
},
pan_muerto: {
    title: "Pan de Muerto con Magnum Planchado 🍞🍦",
    video: "./pan-de-muerto.MP4",
    badge: "🏠 Supervivencia en Casa • 🍿 Dulce / Experiencia Térmica",
    html: `
        <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #facc15; display: block; margin-bottom: 8px;">🛒 Ingredientes:</strong>
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">Pan de muerto azucarado tradicional, 1 paleta Magnum (vainilla con cubierta de chocolate y almendras) y jarabe de chocolate.</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
            <strong style="color: #facc15; display: block; margin-bottom: 8px;">👨‍🍳 Preparación:</strong>
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">Hacer un corte lateral en forma de bolsillo al pan de muerto. Introducir la paleta Magnum entera dentro del corte. Colocar en una sandwichera o plancha caliente de 3 a 5 minutos hasta que la superficie del pan quede crujiente y dorada. Servir caliente y dipear en el jarabe de chocolate.</p>
        </div>
        <div style="background: rgba(34, 197, 94, 0.15); border-left: 4px solid #22c55e; padding: 12px; border-radius: 8px;">
            <strong style="color: #4ade80;">✈️ Nivel de Bajón:</strong>
            <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">5/5 — Choque térmico crujiente/helado</span>
        </div>
    `
},

// --- SECCIÓN CINE ---
robots: {
    title: "LOVE, DEATH & ROBOTS 🤖🌀",
    video: "./robots.MP4",
    badge: "🎬 Psicodelia & Sci-Fi • ✈️✈️✈️✈️✈️ (5/5)",
    html: `
        <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 12px;"><strong>📺 Dónde ver:</strong> Netflix</p>
        <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;"><strong>🌀 ¿Por qué es perfecto para el viaje?:</strong> Es un buffet de episodios independientes con estilos que van desde el fotorrealismo 3D hasta el cel-shading cyberpunk y la rotoscopía surrealista. Capítulos como <em>Jibaro</em>, <em>The Very Pulse of the Machine</em>, <em>Zima Blue</em> y <em>The Witness</em> brindan estimulación sensorial pura, paisajes alienígenas y texturas metálicas luminosas que elevan la percepción al máximo.</p>
        <div style="background: rgba(56, 189, 248, 0.15); border-left: 4px solid #38bdf8; padding: 12px; border-radius: 8px;">
            <strong style="color: #38bdf8;">✈️ Nivel de Vuelo:</strong>
            <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">5/5 — Hipnótico & Ultra Inmersivo</span>
        </div>
    `
},
congreso: {
    title: "THE CONGRESS (2013) 👁️🎭",
    video: "./congreso.MP4",
    badge: "🎬 Animación Surrealista • ✈️✈️✈️✈️✈️ (5/5)",
    html: `
        <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 12px;"><strong>📺 Dónde ver:</strong> Apple TV / Prime Video / Cineteca / Archivos de Internet</p>
        <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;"><strong>🌀 ¿Por qué es perfecto para el viaje?:</strong> Inicia en <em>Live-Action</em> con actores reales y muta a mitad de la trama hacia una alucinante animación surrealista dibujada a mano al estilo de los años 30. Sus más de 60,000 fotogramas abordan avatares digitales, simulaciones químicas y la pérdida de la realidad.</p>
        <div style="background: rgba(56, 189, 248, 0.15); border-left: 4px solid #38bdf8; padding: 12px; border-radius: 8px;">
            <strong style="color: #38bdf8;">✈️ Nivel de Vuelo:</strong>
            <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">5/5 — Rotoscopía & Mindfuck</span>
        </div>
    `
},
grasa_fria: {
    title: "CHILLED GREESE 🍟🚗",
    video: "./grasa-fria.MP4",
    badge: "🎬 Comedia Absurda • ✈️✈️✈️ (3/5)",
    html: `
        <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 12px;"><strong>📺 Dónde ver:</strong> TikTok / YouTube Originals</p>
        <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;"><strong>🌀 ¿Por qué es perfecto para el viaje?:</strong> Diálogos reales, humor cannabis y situaciones absurdas de amigos en el auto a las 3:00 AM. Su animación de trazos simples y ritmo relajado es ideal para soltar la risa, despejar la mente y abrir el apetito antes del bajón.</p>
        <div style="background: rgba(250, 204, 21, 0.15); border-left: 4px solid #facc15; padding: 12px; border-radius: 8px;">
            <strong style="color: #facc15;">✈️ Nivel de Vuelo:</strong>
            <span style="color: #f8fafc; font-size: 0.9rem; display: block; margin-top: 4px;">3/5 — Relax, Risas & Monchis</span>
        </div>
    `
},
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
    },
    lagoalgo: {
        title: "LagoAlgo — Bosque de Chapultepec",
        video: "./lago-algo.MP4",
        badge: "📍 Poniente • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Un espacio inmersivo único que combina una galería de arte contemporáneo con un restaurante y vista panorámica al lago. Su arquitectura brutalista de techos altos y los ventanales hacia la naturaleza crean un ambiente hipnótico y super relajante.
            </p>
            <div style="background: rgba(34, 197, 94, 0.15); border-left: 4px solid #22c55e; padding: 14px; border-radius: 10px; margin-bottom: 16px;">
                <strong style="color: #4ade80;">Radar de Discreción: 🟡 Medio en interior / 🟢 Libre en jardines.</strong>
            </div>
        `
    },
    pizzadog: {
        title: "PizzaDog Express en Airfryer 🌭🍕",
        video: "./pizza-dog.MP4",
        badge: "🏠 Casa • 🧂 Salado • ⚡ 5 min",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                La fusión perfecta entre un Hot Dog y una Pizza de Pepperoni. Salchicha envuelta en tocino crujiente, dentro de un pan untado con salsa italiana, cubierto de queso gratinado y pepperoni.
            </p>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
                <strong style="color: #facc15; display: block; margin-bottom: 8px;">🛒 Ingredientes:</strong>
                <ul style="color: #e2e8f0; font-size: 0.88rem; padding-left: 18px; margin: 0;">
                    <li>Pan de hot dog, salchichas y tocino.</li>
                    <li>Salsa italiana de tomate (Pizza).</li>
                    <li>Queso para gratinar y Pepperoni.</li>
                </ul>
            </div>
        `
    },
    sandwich: {
        title: "Sándwich Monchoso de 3 Pisos 🥪🥤",
        video: "./sandwich.MP4",
        badge: "🏠 Casa • 🧂 Salado • 🍳 10 min",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Un club sándwich supremo de tres pisos dorado a la mantequilla. Lleva queso crema, manchego, jamón de pavo y tocino súper crujiente. Acompañado de una malteada helada de fresa natural con plátano.
            </p>
        `
    },
    losperros: {
        title: "Los Perros de San Antonio 🌭",
        video: "./losperros.MP4",
        badge: "📍 Sur • 🍿 Salado",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Hot dogs gigantes de hasta medio kilo con salchichas ahumadas artesanalmente, cebolla caramelizada, baño de queso y barra de salsas desde $75 MXN.
            </p>
            <p style="color: #94a3b8; font-size: 0.88rem;">📍 Av. San Antonio & Av. Revolución (Junto al Metro).</p>
        `
    },
    burgergate: {
        title: "Burger Gate 🍔",
        video: "./burgerg.mp4",
        badge: "📍 Centro • 🍿 Salado",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                Smash burgers de alta calidad. Destaca "La Chilanga" con choriqueso de Oaxaca, aguacate y mayonesa chipotle, acompañada de un tazón de papas cargadas.
            </p>
            <p style="color: #94a3b8; font-size: 0.88rem;">📍 Culiacán 122, Hipódromo Condesa.</p>
        `
    },
    pastoral: {
        title: "PASTORAL: TO DIE IN THE COUNTRY 🎬",
        video: "./pastoral.MP4",
        badge: "🎬 Drama Experimental • ⏱️ 1h 42m",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                <strong>👁️ Por qué verla:</strong><br>Un viaje introspectivo y delirante sobre la infancia. Dirección de arte impresionante donde los escenarios se desarman y usa filtros cromáticos extremos.
            </p>
        `
    },
    neotokyo: {
        title: "NEO TOKYO (1987) 🚀",
        video: "./neotokyo.mp4",
        badge: "🎬 Animación Experimental • ⏱️ 50m",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                <strong>👁️ Por qué verla:</strong><br>Antología de tres cortometrajes animados a mano. Combina un laberinto surrealista, una carrera futurista y una rebelión de máquinas.
            </p>
        `
    },
    dandadan: {
        title: "DANDADAN 👻🛸",
        video: "./dandadan.MP4",
        badge: "🎬 Comedia Absurda / Acción",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                <strong>🤪 Humor:</strong> Un caos hilarante que mezcla comedia escolar con situaciones bizarras (fantasmas vs extraterrestres).<br>
                <strong>🎨 Visuales:</strong> Animación cinética impresionante con paleta neón psicodélica y fluidez impecable.
            </p>
        `
    },
    dubside: {
        title: "DUB SIDE OF THE MOON",
        video: "./dub.png",
        badge: "🔊 Dub / Reggae / Psicodélico",
        html: `
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                <strong>💡 ¿Qué es?:</strong><br>Es una reinterpretación completa paso a paso del aclamado disco <em>The Dark Side of the Moon</em> de Pink Floyd, llevada a los terrenos del dub jamaiquino y el reggae.
            </p>
            <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin-bottom: 16px;">
                <strong>🌀 ¿Por qué escucharlo?:</strong><br>Si buscas una vibra envolvente, perfecta para entrar en trance relajado. Sustituye sintetizadores espaciales por líneas de bajo profundas, metales cálidos y reverb.
            </p>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(255,255,255,0.1);">
                <strong style="color: #facc15; display: block; margin-bottom: 8px;">⭐ Canciones Clave:</strong>
                <ol style="color: #e2e8f0; font-size: 0.9rem; padding-left: 22px; margin: 0; line-height: 1.6;">
                    <li>Speak to Me / Breathe (In the Air)</li>
                    <li>Time</li>
                    <li>Money</li>
                    <li>Brain Damage</li>
                </ol>
            </div>
            <div style="background: rgba(56, 189, 248, 0.15); border-left: 4px solid #38bdf8; padding: 12px; border-radius: 8px;">
                <strong style="color: #38bdf8;">📲 Dónde escuchar:</strong>
                <p style="color: #f8fafc; font-size: 0.9rem; margin-top: 4px;">Apple Music, Spotify, YouTube Music y Bandcamp.</p>
            </div>
        `
    }

};

/* MODAL INFORMATIVA GLOBAL PARA TARJETAS COMPACTAS */
function openCardModal(section, key) {
    const data = cardDetailsDB[key];
    if (!data) return;

    const isVideo = data.video.toLowerCase().endsWith('.mp4');
    const mediaTag = isVideo 
        ? `<video src="${data.video}" autoplay loop muted playsinline webkit-playsinline style="width: 100%; max-height: 320px; object-fit: cover; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"></video>`
        : `<img src="${data.video}" alt="${data.title}" style="width: 100%; max-height: 320px; object-fit: contain; background: #000; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">`;

    const modalBody = document.getElementById('infoModalBody');
    modalBody.innerHTML = `
        ${mediaTag}
        <span class="badge-tag" style="margin-bottom: 10px; display: inline-block;">${data.badge}</span>
        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 15px; color: #ffffff;">${data.title}</h2>
        ${data.html}
    `;

    document.getElementById('infoModalOverlay').classList.add('active');
    openModalState(); // 👈 ESTA LÍNEA OCULTA LOS BOTONES FLOTANTES
}

function closeInfoModal() {
    const overlay = document.getElementById('infoModalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        closeModalState(); // 👈 ESTA LÍNEA DEVUELVE LOS BOTONES Y REGRESA EL SCROLL
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

    let text = `*MB NUEVA ENTRADA AL BUZÓN AEROSHOP*\n\n`;
    text += `*Categoría:* ${tipo}\n`;
    text += `*De:* ${nombre}\n\n`;
    text += `*Mensaje / Detalle:*\n${mensaje}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    
    document.getElementById('buzonMensaje').value = '';
    closeBuzonModal();
}
/* DETECTOR Y REDIRECCIÓN DE NAVEGADORES INTERNOS (WHATSAPP / INSTAGRAM / TIKTOK) */
document.addEventListener('DOMContentLoaded', () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isWebView = /FBAN|FBAV|Instagram|WhatsApp|TikTok|MicroMessenger/i.test(ua);

    if (isWebView) {
        const isAndroid = /Android/i.test(ua);
        if (isAndroid) {
            // En Android intenta abrir Chrome directamente
            const cleanUrl = window.location.href.replace(/^https?:\/\//, '');
            window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
        } else {
            // En iOS (iPhone) despliega una barra fija de ayuda superior
            const banner = document.createElement('div');
            banner.style.cssText = 'position:fixed; top:0; left:0; width:100%; background:#facc15; color:#000; text-align:center; padding:12px 16px; font-weight:800; font-size:0.82rem; z-index:99999; box-shadow:0 4px 12px rgba(0,0,0,0.5);';
            banner.innerHTML = '⚠️ Para ver fotos y videos sin fallas, toca <strong>⋯</strong> o <strong>↑</strong> arriba a la derecha y elige <strong>"Abrir en Safari"</strong>.';
            document.body.prepend(banner);
        }
    }
});
/* --- SECCIÓN 04: FRECUENCIAS & SOUNDTRACKS --- */
function openMusicVuelo() {
    const view = document.getElementById('musicFullscreenView');
    if (view) {
        view.classList.add('active');
        view.scrollTop = 0;
        document.body.style.overflow = 'hidden';
        filterMusicCards();
    }
}

function closeMusicVuelo() {
    const view = document.getElementById('musicFullscreenView');
    if (view) {
        view.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function filterMusicCards() {
    const categoria = document.getElementById('filterCategoriaMusic')?.value || 'todos';
    const cards = document.querySelectorAll('#musicGrid .music-card');

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
   OPTIMIZACIÓN DE CARGA DE VIDEOS Y NAVEGACIÓN (FIX SAFARI / IOS)
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.muted = true;
                video.playsInline = true;
                video.setAttribute('webkit-playsinline', 'true');
                
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Oculta el fallo de reproducción automática sin mostrar ícono de error
                    });
                }
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('video').forEach(video => {
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('webkit-playsinline', 'true');
        videoObserver.observe(video);
    });
});
/* ==========================================
   CONTROL DE MODALES Y BLOQUEO DE SCROLL DE FONDO
   ========================================== */
function openModalState() {
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

function closeModalState() {
    const activeOverlays = document.querySelectorAll(
        '.product-modal-overlay.active, .info-modal-overlay.active, .cart-overlay[style*="flex"], .monchis-fullscreen-view.active, .rutas-fullscreen-view.active, .brand-fullscreen-view.active, .emergency-fullscreen-view.active'
    );
    if (activeOverlays.length === 0) {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
    }
}

/* ==========================================
   NAVEGACIÓN DE VISTAS FULLSCREEN (CON SCROLL LOCK)
   ========================================== */
function closeFullscreenBrand() {
    const view = document.getElementById('brandFullscreenView');
    if (view) {
        view.classList.remove('active');
        pauseSectionVideos(view);
        closeModalState();
    }
}

function openRutasVuelo() {
    const view = document.getElementById('rutasFullscreenView');
    if (view) {
        view.classList.add('active');
        view.scrollTop = 0;
        openModalState();
        playSectionVideos(view);
    }
}

function closeRutasVuelo() {
    const view = document.getElementById('rutasFullscreenView');
    if (view) {
        view.classList.remove('active');
        pauseSectionVideos(view);
        closeModalState();
    }
}

function openMonchisVuelo() {
    const view = document.getElementById('monchisFullscreenView');
    if (view) {
        view.classList.add('active');
        view.scrollTop = 0;
        openModalState();
        if (typeof filterMonchisCards === 'function') filterMonchisCards();
        playSectionVideos(view);
    }
}

function closeMonchisVuelo() {
    const view = document.getElementById('monchisFullscreenView');
    if (view) {
        view.classList.remove('active');
        pauseSectionVideos(view);
        closeModalState();
    }
}

function openCineVuelo() {
    const cineView = document.getElementById('cineFullscreenView');
    if (cineView) {
        cineView.classList.add('active');
        cineView.scrollTop = 0;
        openModalState();
        if (typeof filterCineCards === 'function') filterCineCards();
        playSectionVideos(cineView);
    }
}

function closeCineVuelo() {
    const cineView = document.getElementById('cineFullscreenView');
    if (cineView) {
        cineView.classList.remove('active');
        pauseSectionVideos(cineView);
        closeModalState();
    }
}

function openMusicVuelo() {
    const view = document.getElementById('musicFullscreenView');
    if (view) {
        view.classList.add('active');
        view.scrollTop = 0;
        openModalState();
        if (typeof filterMusicCards === 'function') filterMusicCards();
    }
}

function closeMusicVuelo() {
    const view = document.getElementById('musicFullscreenView');
    if (view) {
        view.classList.remove('active');
        closeModalState();
    }
}

function openEmergencyVuelo() {
    const view = document.getElementById('emergencyFullscreenView');
    if (view) {
        document.body.classList.add('emergency-active');
        view.classList.add('active');
        view.scrollTop = 0;
        openModalState();
    }
}

function closeEmergencyVuelo() {
    const view = document.getElementById('emergencyFullscreenView');
    if (view) {
        view.classList.remove('active');
        document.body.classList.remove('emergency-active');
        closeModalState();
        stopBreathingGuide();
        stopBrownNoise();
    }
}

/* ==========================================
   SECCIÓN 05: RESPIRACIÓN Y AUDIO
   ========================================== */
let breathingInterval = null;
let isBreathingActive = false;
let brownNoiseContext = null;
let brownNoiseNode = null;
let isPlayingBrownNoise = false;

function toggleBreathingGuide() {
    if (isBreathingActive) {
        stopBreathingGuide();
    } else {
        startBreathingGuide();
    }
}

function startBreathingGuide() {
    isBreathingActive = true;
    const btn = document.getElementById('btnBreathingToggle');
    if (btn) btn.innerText = "⏸️ Pausar Respiración";
    runBreathingCycle();
}

function stopBreathingGuide() {
    isBreathingActive = false;
    clearTimeout(breathingInterval);
    const circle = document.getElementById('breathingCircle');
    const label = document.getElementById('breathingStatusLabel');
    const actionText = document.getElementById('breathingActionText');
    const btn = document.getElementById('btnBreathingToggle');

    if (circle) circle.className = 'breathing-circle';
    if (label) label.innerText = "Toca el círculo o presiona el botón para comenzar";
    if (actionText) actionText.innerText = "Iniciar";
    if (btn) btn.innerText = "▶️ Iniciar Respiración Guiada";
}

function runBreathingCycle() {
    if (!isBreathingActive) return;

    const circle = document.getElementById('breathingCircle');
    const label = document.getElementById('breathingStatusLabel');
    const actionText = document.getElementById('breathingActionText');

    if (circle) circle.className = 'breathing-circle inhale';
    if (actionText) actionText.innerText = "Inhala";
    if (label) label.innerText = "Inhala suavemente por la nariz (4s)...";

    breathingInterval = setTimeout(() => {
        if (!isBreathingActive) return;

        if (circle) circle.className = 'breathing-circle hold';
        if (actionText) actionText.innerText = "Sostén";
        if (label) label.innerText = "Mantén el aire con calma (4s)...";

        breathingInterval = setTimeout(() => {
            if (!isBreathingActive) return;

            if (circle) circle.className = 'breathing-circle exhale';
            if (actionText) actionText.innerText = "Exhala";
            if (label) label.innerText = "Suelta el aire despacio por la boca (6s)...";

            breathingInterval = setTimeout(() => {
                if (isBreathingActive) {
                    runBreathingCycle();
                }
            }, 6000);

        }, 4000);

    }, 4000);
}

function toggleBrownNoise() {
    if (isPlayingBrownNoise) {
        stopBrownNoise();
    } else {
        startBrownNoise();
    }
}

function startBrownNoise() {
    try {
        if (!brownNoiseContext) {
            brownNoiseContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (brownNoiseContext.state === 'suspended') {
            brownNoiseContext.resume();
        }

        const bufferSize = brownNoiseContext.sampleRate * 2;
        const buffer = brownNoiseContext.createBuffer(1, bufferSize, brownNoiseContext.sampleRate);
        const output = buffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.0;
        }

        brownNoiseNode = brownNoiseContext.createBufferSource();
        brownNoiseNode.buffer = buffer;
        brownNoiseNode.loop = true;

        const gainNode = brownNoiseContext.createGain();
        gainNode.gain.value = 0.15;

        brownNoiseNode.connect(gainNode);
        gainNode.connect(brownNoiseContext.destination);

        brownNoiseNode.start();
        isPlayingBrownNoise = true;

        const btnText = document.getElementById('btnAudioText');
        if (btnText) btnText.innerText = "🔊 Pausar Sonido Relajante";
    } catch (e) {
        console.log("AudioContext error:", e);
    }
}

function stopBrownNoise() {
    if (brownNoiseNode) {
        try {
            brownNoiseNode.stop();
            brownNoiseNode.disconnect();
        } catch (e) {}
    }
    isPlayingBrownNoise = false;
    const btnText = document.getElementById('btnAudioText');
    if (btnText) btnText.innerText = "🎧 Escuchar Ruido Marrón Calmante";
}

/* ==========================================
   PANEL ADMINISTRADOR
   ========================================== */
let adminInventarioCache = [];
const ADMIN_EMAIL = "aeroshop.37@gmail.com";

function checkAdminPermission(user) {
    const adminSection = document.getElementById('adminPanelSection');
    if (user && user.email === ADMIN_EMAIL) {
        if (adminSection) adminSection.style.display = 'block';
        cargarDashboardAdmin();
        cargarInventarioAdmin();
    } else {
        if (adminSection) adminSection.style.display = 'none';
    }
}

const originalSyncUserProfile = window.syncUserProfile;
window.syncUserProfile = async function(user) {
    if (typeof originalSyncUserProfile === 'function') {
        await originalSyncUserProfile(user);
    }
    checkAdminPermission(user);
};

async function cargarDashboardAdmin() {
    if (!window.db) return;
    const { collection, getDocs } = window.fbMethods;

    try {
        let totalIngresos = 0;
        let totalCogs = 0;
        const ventasSnap = await getDocs(collection(window.db, "transacciones_ventas"));
        ventasSnap.forEach(doc => {
            const data = doc.data();
            totalIngresos += data.monto_cobrado || 0;
            totalCogs += data.costo_unitario || 0;
        });

        let totalGastos = 0;
        const gastosSnap = await getDocs(collection(window.db, "gastos_e_inversiones"));
        gastosSnap.forEach(doc => {
            totalGastos += doc.data().monto || 0;
        });

        const utilidadNeta = totalIngresos - (totalCogs + totalGastos);

        document.getElementById('dashIngresos').innerText = `$${totalIngresos.toLocaleString()} MXN`;
        document.getElementById('dashCogs').innerText = `$${totalCogs.toLocaleString()} MXN`;
        document.getElementById('dashGastos').innerText = `$${totalGastos.toLocaleString()} MXN`;
        document.getElementById('dashUtilidad').innerText = `$${utilidadNeta.toLocaleString()} MXN`;
    } catch (e) {
        console.error("Error al cargar dashboard financiero:", e);
    }
}

async function registrarInventarioAdmin(event) {
    event.preventDefault();
    const nombre = document.getElementById('invNombre').value.trim();
    const inversionTotal = parseFloat(document.getElementById('invInversionTotal').value);
    const piezas = parseInt(document.getElementById('invPiezas').value);
    const precioVenta = parseFloat(document.getElementById('invPrecioVenta').value);
    const costoUnitarioBase = inversionTotal / piezas;

    try {
        const { collection, addDoc } = window.fbMethods;
        await addDoc(collection(window.db, "inventario"), {
            nombre: nombre,
            stock: piezas,
            costo_unitario: costoUnitarioBase,
            precio_venta: precioVenta,
            fecha_registro: new Date().toISOString()
        });

        alert(`✅ Producto registrado. Costo unitario base calculado: $${costoUnitarioBase.toFixed(2)} MXN`);
        event.target.reset();
        cargarInventarioAdmin();
    } catch (e) {
        alert("Error al registrar inventario: " + e.message);
    }
}

async function cargarInventarioAdmin() {
    if (!window.db) return;
    const { collection, getDocs } = window.fbMethods;
    const select = document.getElementById('adminProductSelect');
    const stockList = document.getElementById('adminStockList');

    select.innerHTML = '<option value="">Selecciona Producto de Inventario...</option>';
    stockList.innerHTML = '';
    adminInventarioCache = [];

    const snap = await getDocs(collection(window.db, "inventario"));
    snap.forEach(docSnap => {
        const p = { id: docSnap.id, ...docSnap.data() };
        adminInventarioCache.push(p);

        if (p.stock > 0) {
            select.innerHTML += `<option value="${p.id}">${p.nombre} (Stock: ${p.stock})</option>`;
        }

        stockList.innerHTML += `
            <div class="stock-item-row">
                <span><strong>${p.nombre}</strong> — ${p.stock} pzas disponibles</span>
                <span>Costo: $${p.costo_unitario.toFixed(0)} | Venta: $${p.precio_venta}</span>
            </div>
        `;
    });
}

function actualizarPrecioSugeridoAdmin() {
    const prodId = document.getElementById('adminProductSelect').value;
    const prod = adminInventarioCache.find(item => item.id === prodId);
    if (prod) {
        document.getElementById('adminMontoCobrado').value = prod.precio_venta;
    }
}

async function procesarVentaAdmin(event) {
    event.preventDefault();
    let userQuery = document.getElementById('adminUserUid').value.trim();
    const prodId = document.getElementById('adminProductSelect').value;
    const montoCobrado = parseFloat(document.getElementById('adminMontoCobrado').value);

    const producto = adminInventarioCache.find(p => p.id === prodId);
    if (!producto) {
        alert("Selecciona un producto válido.");
        return;
    }

    try {
        const { collection, getDocs, doc, updateDoc, addDoc } = window.fbMethods;
        let userDocRef = null;
        let userData = null;

        const usersSnap = await getDocs(collection(window.db, "usuarios"));
        usersSnap.forEach(uDoc => {
            const data = uDoc.data();
            const shortUid = `USR-${uDoc.id.slice(-5).toUpperCase()}`;
            if (uDoc.id === userQuery || shortUid === userQuery.toUpperCase()) {
                userDocRef = doc(window.db, "usuarios", uDoc.id);
                userData = data;
            }
        });

        if (!userDocRef) {
            alert("No se encontró ningún pasajero con ese ID.");
            return;
        }

        let nuevosVuelos = (userData.vuelos_acumulados || 0) + 1;
        if (nuevosVuelos > 3) {
            nuevosVuelos = 1;
        }

        await updateDoc(userDocRef, {
            vuelos_acumulados: nuevosVuelos,
            descuento_bienvenida_activo: false
        });

        const prodRef = doc(window.db, "inventario", producto.id);
        await updateDoc(prodRef, {
            stock: producto.stock - 1
        });

        const gananciaBruta = montoCobrado - producto.costo_unitario;
        await addDoc(collection(window.db, "transacciones_ventas"), {
            usuario_uid: userDocRef.id,
            producto_nombre: producto.nombre,
            monto_cobrado: montoCobrado,
            costo_unitario: producto.costo_unitario,
            ganancia_bruta: gananciaBruta,
            fecha: new Date().toISOString()
        });

        alert(`🚀 Venta registrada con éxito. Vuelo acreditado: ${nuevosVuelos}/3 al cliente.`);
        event.target.reset();
        cargarDashboardAdmin();
        cargarInventarioAdmin();
    } catch (e) {
        alert("Error al procesar la venta: " + e.message);
    }
}

async function registrarGastoAdmin(event) {
    event.preventDefault();
    const tipo = document.getElementById('gastoTipo').value;
    const monto = parseFloat(document.getElementById('gastoMonto').value);
    const concepto = document.getElementById('gastoConcepto').value.trim();

    try {
        const { collection, addDoc } = window.fbMethods;
        await addDoc(collection(window.db, "gastos_e_inversiones"), {
            tipo: tipo,
            monto: monto,
            concepto: concepto,
            fecha: new Date().toISOString()
        });

        alert("🔻 Registro contable guardado correctamente.");
        event.target.reset();
        cargarDashboardAdmin();
    } catch (e) {
        alert("Error al registrar gasto: " + e.message);
    }
}

/* ==========================================
   CONTROL DE MODALES Y AUTENTICACIÓN GOOGLE
   ========================================== */
function abrirPromo() {
  const modal = document.getElementById('promoModal');
  if (modal) modal.classList.add('active');
  openModalState();
}
function cerrarPromo() {
  const modal = document.getElementById('promoModal');
  if (modal) modal.classList.remove('active');
  closeModalState();
}

function abrirLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('active');
  openModalState();
}
function cerrarLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('active');
  closeModalState();
}

function abrirPerfil() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.add('active');
  openModalState();
}
function cerrarPerfil() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.remove('active');
  closeModalState();
}

function irALoginDesdePromo() {
  cerrarPromo();
  abrirLogin();
}

function abrirPerfilOClick() {
  if (window.auth && window.auth.currentUser) {
    abrirPerfil();
  } else {
    abrirLogin();
  }
}

async function iniciarSesionGoogle() {
  try {
    if (!window.auth || !window.googleProvider) {
      alert("⚠️ La conexión con Firebase aún está cargando. Intenta de nuevo en unos segundos.");
      return;
    }
    await window.fbMethods.signInWithPopup(window.auth, window.googleProvider);
    cerrarLogin();
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Error de autenticación: " + error.message);
  }
}

async function cerrarSesionFirebase() {
  if (window.auth && window.fbMethods) {
    await window.fbMethods.signOut(window.auth);
    cerrarPerfil();
  }
}
function cerrarTodasLasVistas() {
    closeProductModal();
    closeInfoModal();
    closeBuzonModal();
    cerrarPromo();
    cerrarLogin();
    cerrarPerfil();
    closeRutasVuelo();
    closeMonchisVuelo();
    closeCineVuelo();
    closeMusicVuelo();
    closeEmergencyVuelo();
    closeFullscreenBrand();
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) cartOverlay.style.display = 'none';
    closeModalState();
}
// 1. Sincronización y Renderizado del Perfil Ampliado
async function syncUserProfile(user) {
    const { doc, getDoc, setDoc } = window.fbMethods;
    const userRef = doc(window.db, "usuarios", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        currentUserProfile = snap.data();
    } else {
        // Registro inicial
        currentUserProfile = {
            uid: user.uid,
            displayName: user.displayName || '',
            nombre_real: user.displayName || '',
            apodo: '',
            email: user.email,
            photoURL: user.photoURL,
            vuelos_acumulados: 0,
            descuento_bienvenida_activo: true,
            historial_compras: [],
            fecha_registro: new Date().toISOString(),
            acepto_aviso_privacidad: true
        };
        await setDoc(userRef, currentUserProfile);
    }

    renderPasaporteUI();
}

function renderPasaporteUI() {
    if (!currentUserProfile) return;

    // Foto y Correo
    const avatarElem = document.getElementById('userAvatar');
    const emailElem = document.getElementById('userEmail');
    if (avatarElem && currentUserProfile.photoURL) avatarElem.src = currentUserProfile.photoURL;
    if (emailElem) emailElem.innerText = currentUserProfile.email;

    // Campos Editables (Nombre Real y Apodo)
    const inputNombre = document.getElementById('editNombreReal');
    const inputApodo = document.getElementById('editApodo');
    if (inputNombre) inputNombre.value = currentUserProfile.nombre_real || currentUserProfile.displayName || '';
    if (inputApodo) inputApodo.value = currentUserProfile.apodo || '';

    // Conteo y Tipo de Pasajero (VIP o Normal)
    const vuelos = currentUserProfile.vuelos_acumulados || 0;
    const countText = document.getElementById('vuelosCountText');
    const vipBadge = document.getElementById('userVipBadge');

    if (countText) countText.innerText = `${vuelos} / 3 VUELOS`;

    if (vipBadge) {
        if (vuelos >= 3) {
            vipBadge.innerText = "PASAJERO VIP ✈️🔥";
            vipBadge.className = "status-pill-badge vip";
        } else {
            vipBadge.innerText = "PASAJERO FRECUENTE 🛫";
            vipBadge.className = "status-pill-badge normal";
        }
    }

    // Pasos de Vuelo
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    if (step1) step1.classList.toggle('active', vuelos >= 1);
    if (step2) step2.classList.toggle('active', vuelos >= 2);
    if (step3) step3.classList.toggle('active', vuelos >= 3);

    // Renderizar Historial de Productos Adquiridos
    renderHistorialProductos();
}

// 2. Guardar Nombre Real y Apodo en Firebase
async function guardarDatosPerfil() {
    if (!currentUserProfile || !window.auth.currentUser) return;

    const nuevoNombre = document.getElementById('editNombreReal').value.trim();
    const nuevoApodo = document.getElementById('editApodo').value.trim();

    try {
        const { doc, updateDoc } = window.fbMethods;
        const userRef = doc(window.db, "usuarios", currentUserProfile.uid);

        await updateDoc(userRef, {
            nombre_real: nuevoNombre,
            displayName: nuevoNombre,
            apodo: nuevoApodo
        });

        currentUserProfile.nombre_real = nuevoNombre;
        currentUserProfile.displayName = nuevoNombre;
        currentUserProfile.apodo = nuevoApodo;

        alert("✅ Perfil actualizado correctamente.");
    } catch (e) {
        console.error("Error al actualizar perfil:", e);
        alert("⚠️ Hubo un error al guardar los cambios: " + e.message);
    }
}

// 3. Renderizar el Historial de Productos Comprados
function renderHistorialProductos() {
    const grid = document.getElementById('purchasedProductsGrid');
    if (!grid) return;

    const compras = currentUserProfile.historial_compras || [];

    if (compras.length === 0) {
        grid.innerHTML = `<div class="empty-purchases-box"><span>🛒</span><p>sin productos adquiridos</p></div>`;
    } else {
        grid.innerHTML = compras.map(item => `
            <div class="purchased-item-card">
                <img src="${item.image || './portada.jpg'}" alt="${item.title}">
                <div class="purchased-item-info">
                    <h4>${item.title}</h4>
                    <span class="purchased-date">Adquirido: ${new Date(item.fecha).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }
}

// 4. Actualización Automática al Pedir por WhatsApp
const originalSendWhatsAppOrder = sendWhatsAppOrder;
sendWhatsAppOrder = async function() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    // Registrar compras en el perfil de Firebase si hay sesión iniciada
    if (currentUserProfile && window.auth.currentUser) {
        try {
            const { doc, updateDoc } = window.fbMethods;
            const userRef = doc(window.db, "usuarios", currentUserProfile.uid);

            const nuevasCompras = cart.map(item => ({
                title: item.title,
                image: item.image,
                price: item.price,
                fecha: new Date().toISOString()
            }));

            const historialActualizado = [...(currentUserProfile.historial_compras || []), ...nuevasCompras];
            let nuevosVuelos = (currentUserProfile.vuelos_acumulados || 0) + 1;
            if (nuevosVuelos > 3) nuevosVuelos = 1; // Reinicia ciclo de 3

            await updateDoc(userRef, {
                historial_compras: historialActualizado,
                vuelos_acumulados: nuevosVuelos
            });

            currentUserProfile.historial_compras = historialActualizado;
            currentUserProfile.vuelos_acumulados = nuevosVuelos;
            renderPasaporteUI();
        } catch (e) {
            console.error("Error al guardar pedido en historial:", e);
        }
    }

    // Ejecutar el envío de WhatsApp original
    originalSendWhatsAppOrder();
};
/* Cierre intuitivo tocando el fondo oscuro del perfil */
document.addEventListener('DOMContentLoaded', () => {
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            // Si el usuario da clic o toca el fondo oscuro fuera de la tarjeta
            if (e.target === profileModal) {
                cerrarPerfil();
            }
        });
    }
});
/* Función para abrir el panel Admin desde la barra flotante */
function renderPasaporteUI() {
    if (!currentUserProfile) return;

    // 1. Cargar Código QR
    const qrImg = document.getElementById('userQrCodeImg');
    if (qrImg && currentUserProfile.uid) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUserProfile.uid)}`;
    }

    // 2. Datos del perfil
    const avatarElem = document.getElementById('userAvatar');
    const emailElem = document.getElementById('userEmail');
    if (avatarElem && currentUserProfile.photoURL) avatarElem.src = currentUserProfile.photoURL;
    if (emailElem) emailElem.innerText = currentUserProfile.email;

    const inputNombre = document.getElementById('editNombreReal');
    const inputApodo = document.getElementById('editApodo');
    if (inputNombre) inputNombre.value = currentUserProfile.nombre_real || currentUserProfile.displayName || '';
    if (inputApodo) inputApodo.value = currentUserProfile.apodo || '';

    // 3. Conteo de Vuelos y Estatus VIP
    const vuelos = currentUserProfile.vuelos_acumulados || 0;
    const countText = document.getElementById('vuelosCountText');
    const vipBadge = document.getElementById('userVipBadge');

    if (countText) countText.innerText = `${vuelos} / 3 VUELOS`;

    if (vipBadge) {
        if (vuelos >= 3) {
            vipBadge.innerText = "PASAJERO VIP ✈️🔥";
            vipBadge.className = "status-pill-badge vip";
        } else {
            vipBadge.innerText = "PASAJERO FRECUENTE 🛫";
            vipBadge.className = "status-pill-badge normal";
        }
    }

    // 4. Progreso de los 3 pasos (Vuelos)
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    if (step1) step1.classList.toggle('active', vuelos >= 1);
    if (step2) step2.classList.toggle('active', vuelos >= 2);
    if (step3) step3.classList.toggle('active', vuelos >= 3);

    // 5. Historial y Rastreador
    if (typeof renderHistorialProductos === 'function') renderHistorialProductos();
    if (typeof renderRastreadorPedidoCliente === 'function') renderRastreadorPedidoCliente();
}

/* Modificar checkAdminPermission para mostrar el botón 👑 en la barra inferior */
const originalCheckAdminPermission = checkAdminPermission;
checkAdminPermission = function(user) {
    if (typeof originalCheckAdminPermission === 'function') {
        originalCheckAdminPermission(user);
    }
    const adminBtn = document.getElementById('adminNavBtn');
    if (user && user.email === ADMIN_EMAIL) {
        if (adminBtn) adminBtn.style.display = 'flex';
    } else {
        if (adminBtn) adminBtn.style.display = 'none';
    }
};

/* Cargar el estatus del pedido activo en el Pasaporte del Cliente */
async function renderRastreadorPedidoCliente() {
    if (!currentUserProfile || !window.db) return;
    const container = document.getElementById('customerOrderStatusBox');
    if (!container) return;

    container.innerHTML = '';

    try {
        const { collection, getDocs, query, where } = window.fbMethods;
        const snap = await getDocs(collection(window.db, "pedidos_pendientes"));
        
        let pedidoActivo = null;
        snap.forEach(docSnap => {
            const data = docSnap.data();
            if (data.usuario_uid === currentUserProfile.uid && data.estatus === "PENDIENTE") {
                pedidoActivo = data;
            }
        });

        if (pedidoActivo) {
            const items = pedidoActivo.productos.map(p => `${p.title} (x${p.quantity})`).join(', ');
            container.innerHTML = `
                <div class="order-status-card">
                    <div class="order-status-header">
                        <strong style="color: #ffffff; font-size: 0.9rem;">🛵 ESTADO DE TU PEDIDO</strong>
                        <span class="order-status-badge pendiente">🟡 EN CAMINO</span>
                    </div>
                    <div class="order-items-summary">
                        <strong>Artículos:</strong> ${items}
                    </div>
                    <div style="font-size: 0.78rem; color: #38bdf8;">
                        ✨ <em>En cuanto recibas tu paquete, el Capitán acreditará tu vuelo a este pasaporte.</em>
                    </div>
                </div>
            `;
        }
    } catch (e) {
        console.error("Error al cargar rastreador de pedido:", e);
    }
}

/* Integrar la renderización del rastreador en el pasaporte */
const originalRenderPasaporteUI = renderPasaporteUI;
renderPasaporteUI = function() {
    if (typeof originalRenderPasaporteUI === 'function') {
        originalRenderPasaporteUI();
    }
    renderRastreadorPedidoCliente();
};
/* ==========================================
   SISTEMA DE ESCÁNER DE CÓDIGO QR PARA EL ADMIN
   ========================================== */
let html5QrScanner = null;

function iniciarEscanerQR() {
    const container = document.getElementById('qrReaderContainer');
    if (!container) return;

    container.style.display = 'block';

    if (!html5QrScanner) {
        html5QrScanner = new Html5Qrcode("qrReaderContainer");
    }

    const config = { fps: 10, qrbox: { width: 220, height: 220 } };

    html5QrScanner.start(
        { facingMode: "environment" }, // Usa la cámara trasera del celular
        config,
        (decodedText) => {
            // Cuando detecta un QR válido
            document.getElementById('adminUserUid').value = decodedText;
            alert(`✅ ¡QR Escaneado con éxito! Cliente detectado: ${decodedText}`);
            
            // Detener la cámara
            html5QrScanner.stop().then(() => {
                container.style.display = 'none';
            });
        },
        (errorMessage) => {
            // Ignorar errores menores de búsqueda de marco
        }
    ).catch(err => {
        alert("⚠️ Error al acceder a la cámara: Permiso denegado o dispositivo sin cámara.");
        container.style.display = 'none';
    });
}