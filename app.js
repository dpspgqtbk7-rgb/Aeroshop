let currentUserProfile = null;
const ADMIN_EMAIL = "aeroshop.37@gmail.com";
const phone = "525561446446";

let cart = [];
let selectedStrain = 'Sativa';
let currentModalProduct = {
    title: 'MUHACMEDS 2g',
    price: 700,
    image: './Muhacmeds1.JPG'
};
let currentMonchisTab = 'calle';
let savedScrollPosition = 0;

/* ==========================================
   0. GESTIÓN DE SCROLL Y ESTADO DE MODALES
   ========================================== */
function saveMainScrollPosition() {
    if (!document.body.classList.contains('modal-open')) {
        savedScrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    }
}

function restoreMainScrollPosition() {
    window.scrollTo({ top: savedScrollPosition, behavior: 'instant' });
}

function openModalState() {
    saveMainScrollPosition();
    document.body.classList.add('modal-open');
}

function closeModalState() {
    const activeOverlays = document.querySelectorAll(
        '.product-modal-overlay.active, .info-modal-overlay.active, .cart-overlay[style*="flex"], .monchis-fullscreen-view.active, .rutas-fullscreen-view.active, .brand-fullscreen-view.active, .emergency-fullscreen-view.active, #promoModal.active, #loginModal.active, #profileModal.active, #buzonModalOverlay.active, #faqModalOverlay.active'
    );
    if (activeOverlays.length === 0) {
        document.body.classList.remove('modal-open');
        restoreMainScrollPosition();
    }
}

function closeModalOnOverlay(event) {
    if (event.target.id === 'productModalOverlay') {
        closeProductModal();
    }
}

function closeInfoModalOnOverlay(event) {
    if (event.target.id === 'infoModalOverlay') {
        closeInfoModal();
    }
}

function closeBuzonOnOverlay(event) {
    if (event.target.id === 'buzonModalOverlay') {
        closeBuzonModal();
    }
}

function closeFaqOnOverlay(event) {
    if (event.target.id === 'faqModalOverlay') {
        closeFaqModal();
    }
}

/* ==========================================
   1. AUTENTICACIÓN Y SINCRONIZACIÓN DE USUARIOS
   ========================================== */
function initAuthListener() {
    if (window.fbMethods && window.auth && window.fbMethods.onAuthStateChanged) {
        window.fbMethods.onAuthStateChanged(window.auth, async (user) => {
            if (user) {
                await syncUserProfile(user);
                checkAdminPermission(user);
            } else {
                currentUserProfile = null;
                checkAdminPermission(null);
            }
        });
    } else {
        setTimeout(initAuthListener, 100);
    }
}
initAuthListener();

async function syncUserProfile(user) {
    if (!user || !window.fbMethods || !window.db) return;
    const { doc, getDoc, setDoc } = window.fbMethods;
    const userRef = doc(window.db, "usuarios", user.uid);

    try {
        const snap = await getDoc(userRef);

        if (snap.exists()) {
            currentUserProfile = { uid: user.uid, ...snap.data() };
        } else {
            currentUserProfile = {
                uid: user.uid,
                displayName: user.displayName || user.email.split('@')[0],
                nombre_real: user.displayName || '',
                apodo: '',
                email: user.email,
                photoURL: user.photoURL || '',
                vuelos_acumulados: 0,
                descuento_bienvenida_activo: true,
                favoritos: [],
                historial_compras: [],
                fecha_registro: new Date().toISOString(),
                acepto_aviso_privacidad: true,
                version_aviso: "v1.0-LFPDPPP"
            };
            await setDoc(userRef, currentUserProfile);
        }

        renderPasaporteUI();
    } catch (e) {
        console.error("Error al sincronizar perfil:", e);
    }
}

function renderPasaporteUI() {
    if (!currentUserProfile) return;

    const qrImg = document.getElementById('userQrCodeImg');
    if (qrImg && currentUserProfile.uid) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUserProfile.uid)}`;
    }

    const avatarElem = document.getElementById('userAvatar');
    const emailElem = document.getElementById('userEmail');
    if (avatarElem && currentUserProfile.photoURL) avatarElem.src = currentUserProfile.photoURL;
    if (emailElem) emailElem.innerText = currentUserProfile.email;

    const inputNombre = document.getElementById('editNombreReal');
    const inputApodo = document.getElementById('editApodo');
    if (inputNombre) inputNombre.value = currentUserProfile.nombre_real || currentUserProfile.displayName || '';
    if (inputApodo) inputApodo.value = currentUserProfile.apodo || '';

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

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    if (step1) step1.classList.toggle('active', vuelos >= 1);
    if (step2) step2.classList.toggle('active', vuelos >= 2);
    if (step3) step3.classList.toggle('active', vuelos >= 3);

    renderHistorialProductos();
    renderRastreadorPedidoCliente();
}

async function guardarDatosPerfil() {
    if (!currentUserProfile || !window.auth || !window.auth.currentUser) return;

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
        alert("⚠️ Error al guardar los cambios: " + e.message);
    }
}

function renderHistorialProductos() {
    const grid = document.getElementById('purchasedProductsGrid');
    if (!grid) return;

    const compras = currentUserProfile.historial_compras || [];

    if (compras.length === 0) {
        grid.innerHTML = `<div class="empty-purchases-box"><span>🛒</span><p>Sin productos adquiridos</p></div>`;
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

async function renderRastreadorPedidoCliente() {
    if (!currentUserProfile || !window.db) return;
    const container = document.getElementById('customerOrderStatusBox');
    if (!container) return;

    container.innerHTML = '';

    try {
        const { collection, getDocs } = window.fbMethods;
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

/* ==========================================
   2. PRODUCTOS DESTACADOS Y BASE LOCAL (CON MÚLTIPLES FOTOS)
   ========================================== */
const localProductsDB = {
    frydovni: {
        titulo: "FRYD Ovni 🛸 + Gomitas 2g",
        precio: 870,
        descripcion: "Edición Especial FRYD × Alien 🛸. Dispositivo 2G de Liquid Batter + Live Resin e incluye Gomitas Infundidas. Potencia extrema, excelente sabor frutal y terpenos limpios.",
        imagen: "./frydgomas.mp4",
        imagenes: ["./frydovni.mp4", "./frydgomas2.jpg", "./-56.jpg", "./FRYD.jpg"],
        variedades: ["Sativa", "Indica", "Híbrida"]
    },
    donutsdonitav3: {
        titulo: "donuts donita v3",
        precio: 850,
        descripcion: "Dona Mágica ✨🪴. Excelente potencia, extractos limpios y terpenos frutales. Disponible en Sativa, Indica e Híbrida.",
        imagen: "./donusdonitav31.JPG",
        imagenes: ["./donusdonitav31.JPG", "./donutsdonasv3.JPG"],
        variedades: ["Sativa", "Indica", "Híbrida"]
    },
    packman3g: {
        titulo: "PACKMAN 3g + Pre-Roll",
        precio: 950,
        descripcion: "Edición especial Packman × PartyBoyz. Incluye 3G de Live Resin + .5G Infused Pre-Roll con sabor intenso.",
        imagen: "./packman1.png",
        imagenes: ["./packman1.png", "./packman2.png", "./packman3.png", "./packman5.JPG"],
        variedades: ["Sativa", "Indica", "Híbrida"]
    },
    muhacmeds: {
        titulo: "MUHACMEDS 2g",
        precio: 700,
        descripcion: "Colaboración oficial Muha Meds × Cookies. Alta pureza, aceite claro, terpenos naturales y boquilla de flujo suave.",
        imagen: "./Muhacmeds1.JPG",
        imagenes: ["./Muhacmeds1.JPG", "./MUHACMEDS.png", "./muhacmeds.jpg", "./muhacmeds2.jpg"],
        variedades: ["Sativa", "Indica", "Híbrida"]
    },
    muhamedual: {
        titulo: "MUHAMEDual 2g",
        precio: 800,
        descripcion: "Disposable Muha Meds con doble tanque y variante seleccionable. Dos sabores y perfiles en un solo dispositivo.",
        imagen: "./muhadual.mp4",
        imagenes: ["./muhadual.mp4", "./muhamedual 2.JPG", "./muhamedual3.jpg"],
        variedades: ["Sativa", "Indica", "Híbrida"]
    }
};

async function openProductModal(productId) {
    const mediaContainer = document.getElementById('modalMediaContainer');
    const thumbnailsContainer = document.getElementById('modalThumbnails');
    const strainPillsContainer = document.getElementById('modalStrainPills');

    let productData = null;

    if (window.db && window.fbMethods) {
        try {
            const { doc, getDoc } = window.fbMethods;
            const snap = await getDoc(doc(window.db, "productos", productId));
            if (snap.exists()) {
                productData = { id: snap.id, ...snap.data() };
            }
        } catch (e) {
            console.log("Consulta Firestore diferida, usando catálogo local:", e);
        }
    }

    if (!productData && localProductsDB[productId]) {
        const lp = localProductsDB[productId];
        productData = {
            id: productId,
            titulo: lp.titulo,
            precio: lp.precio,
            descripcion: lp.descripcion,
            imagen: lp.imagen,
            imagenes: lp.imagenes || [lp.imagen],
            variedades: lp.variedades
        };
    }

    if (productData) {
        openModalState();

        const listaFotos = productData.imagenes && productData.imagenes.length > 0 
            ? productData.imagenes 
            : [productData.imagen];

        const precioCalculado = window.esPromo420Activa ? Math.round(productData.precio * 0.60) : productData.precio;

        currentModalProduct = {
            id: productData.id,
            title: productData.titulo,
            price: precioCalculado,
            image: listaFotos[0]
        };

        document.getElementById('modalTitle').innerText = productData.titulo;
        
        document.getElementById('modalPrice').innerHTML = window.esPromo420Activa
            ? `<span class="precio-original-tachado">$${productData.precio} MXN</span> <span class="precio-420-destacado">$${precioCalculado} MXN</span>`
            : `$${productData.precio} MXN`;

        document.getElementById('modalDescription').innerText = productData.descripcion || 'Sin descripción disponible.';

        const mainSrc = listaFotos[0];
        const isVideoMain = mainSrc.toLowerCase().endsWith('.mp4');
        mediaContainer.innerHTML = isVideoMain
            ? `<video src="${mainSrc}" autoplay loop muted playsinline class="modal-main-image"></video>`
            : `<img src="${mainSrc}" class="modal-main-image" alt="${productData.titulo}">`;

        thumbnailsContainer.innerHTML = listaFotos.map((src, idx) => {
            const isVid = src.toLowerCase().endsWith('.mp4');
            return isVid
                ? `<video src="${src}" class="modal-thumb ${idx === 0 ? 'active' : ''}" onclick="changeModalMedia(this, '${src}')" muted></video>`
                : `<img src="${src}" class="modal-thumb ${idx === 0 ? 'active' : ''}" onclick="changeModalMedia(this, '${src}')" alt="Vista ${idx + 1}">`;
        }).join('');

        const variedades = productData.variedades || ['Sativa', 'Indica', 'Híbrida'];
        strainPillsContainer.innerHTML = variedades.map((strain, index) => `
            <button type="button" class="strain-pill ${index === 0 ? 'selected' : ''}" onclick="selectStrain(this, '${strain}')">${strain}</button>
        `).join('');

        selectedStrain = variedades[0] || 'Sativa';
        document.getElementById('productModalOverlay').classList.add('active');
    } else {
        alert("⚠️ Información de producto no disponible.");
    }
}

function closeProductModal() {
    const overlay = document.getElementById('productModalOverlay');
    if (overlay) overlay.classList.remove('active');
    closeModalState();
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

function startHoverSlider(container) {
    if (container._intervalId) return; 

    const mediaElements = container.querySelectorAll('img, video');
    if (mediaElements.length <= 1) return;
    
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

function stopHoverSlider(container) {
    if (container._intervalId) {
        clearInterval(container._intervalId);
        container._intervalId = null;
    }
    const mediaElements = container.querySelectorAll('img, video');
    mediaElements.forEach((el, idx) => el.classList.toggle('active', idx === 0));
}

function scrollToBrandProducts() {
    const target = document.getElementById('brandProductsSection');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

/* ==========================================
   3. CARRITO DE COMPRAS Y PEDIDOS
   ========================================== */
function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    if (overlay.style.display === 'flex') {
        overlay.style.display = 'none';
        closeModalState();
    } else {
        overlay.style.display = 'flex';
        openModalState();
    }
}

function addToCart(title, price, image) {
    const existingIndex = cart.findIndex(item => item.title === title);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ title, price, image, quantity: 1 });
    }
    updateCartUI();
    const overlay = document.getElementById('cartOverlay');
    if (overlay.style.display !== 'flex') {
        toggleCart();
    }
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
                        <button type="button" class="qty-btn" onclick="changeQty('${item.title}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" class="qty-btn" onclick="changeQty('${item.title}', 1)">+</button>
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

    if (window.esPromo420Activa) {
        total = subtotal * 0.60;
        message += `\n🔥 *PROMO HORA 4:20 APLICADA (40% OFF)* 🔥\n`;
    }

    message += `\n*Subtotal:* $${subtotal.toLocaleString()} MXN\n`;

    if (currentUserProfile) {
        message += `\n--- 🎟️ PASAPORTE AEROSHOP ---`;
        message += `\n*Pasajero:* ${currentUserProfile.displayName || currentUserProfile.nombre_real || 'Pasajero'}`;
        message += `\n*ID Cliente:* #USR-${currentUserProfile.uid.slice(-5).toUpperCase()}`;
        message += `\n*Nivel de Vuelos:* ${(currentUserProfile.vuelos_acumulados || 0)}/3`;

        if (currentUserProfile.descuento_bienvenida_activo && !window.esPromo420Activa) {
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

    const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    if (currentUserProfile && window.auth && window.auth.currentUser) {
        registrarPedidoEnHistorialFirebase(cart);
    }

    window.open(targetUrl, '_blank');
}

async function registrarPedidoEnHistorialFirebase(items) {
    try {
        const { doc, updateDoc } = window.fbMethods;
        const userRef = doc(window.db, "usuarios", currentUserProfile.uid);

        const nuevasCompras = items.map(item => ({
            title: item.title,
            image: item.image,
            price: item.price,
            fecha: new Date().toISOString()
        }));

        const historialActualizado = [...(currentUserProfile.historial_compras || []), ...nuevasCompras];
        
        await updateDoc(userRef, {
            historial_compras: historialActualizado
        });
    } catch (e) {
        console.error("Error al registrar historial en Firebase:", e);
    }
}

/* ==========================================
   4. FUNCIONALIDAD BUZÓN Y PREGUNTAS FRECUENTES (FAQ)
   ========================================== */
function openBuzonModal() {
    const overlay = document.getElementById('buzonModalOverlay');
    if (overlay) {
        overlay.classList.add('active');
        openModalState();
    }
}

function closeBuzonModal() {
    const overlay = document.getElementById('buzonModalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        closeModalState();
    }
}

function sendBuzonWhatsApp(event) {
    event.preventDefault();

    const tipo = document.getElementById('buzonTipo')?.value || 'Consulta';
    const nombre = document.getElementById('buzonNombre')?.value.trim() || 'Pasajero Anónimo';
    const mensaje = document.getElementById('buzonMensaje')?.value.trim();

    if (!mensaje) {
        alert("Por favor escribe tu mensaje o recomendación.");
        return;
    }

    let text = `¡Hola Aeroshop! 📬 Mensaje desde el Buzón:\n\n`;
    text += `• *Tipo:* ${tipo}\n`;
    text += `• *De:* ${nombre}\n`;
    text += `• *Detalles:* ${mensaje}\n`;

    const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    closeBuzonModal();
    window.open(targetUrl, '_blank');
}

function openFaqModal() {
    const overlay = document.getElementById('faqModalOverlay');
    if (overlay) {
        overlay.classList.add('active');
        openModalState();
    }
}

function closeFaqModal() {
    const overlay = document.getElementById('faqModalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        closeModalState();
    }
}

/* ==========================================
   5. CATALOGO POR MARCAS Y FULLSCREEN
   ========================================== */
const defaultBrandProducts = {
    fryd: [
        { id: 'frydovni', titulo: "FRYD Ovni 🛸 + Gomitas 2g", marca: "fryd", precio: 850, descripcion: "Liquid Batter + Live Resin + Gomitas Infundidas 🛸.", imagen: "./frydovni.mp4" }
    ],
    muhameds: [
        { id: 'muhacmeds', titulo: "MUHACMEDS 2g", marca: "muhameds", precio: 700, descripcion: "Muha Meds × Cookies • Edición Especial Live Resin.", imagen: "./Muhacmeds1.JPG" },
        { id: 'muhamedual', titulo: "MUHAMEDual 2g", marca: "muhameds", precio: 800, descripcion: "Doble tanque con variante seleccionable y alta potencia.", imagen: "./muhadual.mp4" }
    ],
    cookies: [
        { id: 'cookies_dual', titulo: "Cookies Dual Chamber 2g", marca: "cookies", precio: 850, descripcion: "Dos cepas exclusivas en un solo dispositivo ergonómico.", imagen: "./logo-cookies.png" }
    ],
    donuts: [
        { id: 'donutsdonitav3', titulo: "donuts donita v3", marca: "donuts", precio: 850, descripcion: "Dona Mágica ✨🪴. Batería recargable y extracción limpia.", imagen: "./donusdonitav31.JPG" }
    ],
    packman: [
        { id: 'packman3g', titulo: "PACKMAN 3g + Pre-Roll", marca: "packman", precio: 950, descripcion: "Packman × PartyBoyz • 3G Live Resin + .5G Infused Pre-Roll.", imagen: "./packman1.png" }
    ],
    backwoods: [
        { id: 'backwoods_cigar', titulo: "Backwoods Select Wraps (Pack 5)", marca: "backwoods", precio: 250, descripcion: "Hojas de tabaco natural seleccionadas a mano.", imagen: "./logo-backwoods.png" }
    ]
};

async function openFullscreenBrand(brandKey) {
    const view = document.getElementById('brandFullscreenView');
    const content = document.getElementById('brandFullscreenContent');
    if (!view || !content) return;

    openModalState();
    view.classList.add('active');
    view.scrollTop = 0;

    let productosMarcaList = [...(defaultBrandProducts[brandKey] || [])];

    if (window.db && window.fbMethods) {
        try {
            const { collection, getDocs, query, where } = window.fbMethods;
            const q = query(collection(window.db, "productos"), where("marca", "==", brandKey));
            const snap = await getDocs(q);

            snap.forEach(docSnap => {
                const p = { id: docSnap.id, ...docSnap.data() };
                const idx = productosMarcaList.findIndex(item => item.id === p.id);
                if (idx > -1) {
                    productosMarcaList[idx] = p;
                } else {
                    productosMarcaList.push(p);
                }
            });
        } catch (e) {
            console.log("Error al consultar marca en Firestore:", e);
        }
    }

    let productosMarcaHTML = productosMarcaList.map(p => {
        const precioFinal = window.esPromo420Activa ? Math.round(p.precio * 0.60) : p.precio;
        const HTMLPrecio = window.esPromo420Activa 
            ? `<span class="precio-original-tachado">$${p.precio} MXN</span><span class="precio-420-destacado">$${precioFinal} MXN</span>`
            : `$${p.precio} MXN`;

        const isVideo = p.imagen.toLowerCase().endsWith('.mp4');
        const mediaTag = isVideo
            ? `<video src="${p.imagen}" autoplay loop muted playsinline class="active"></video>`
            : `<img src="${p.imagen}" class="active" alt="${p.titulo}">`;

        return `
            <div class="product-card card-glass" style="${p.agotado ? 'opacity:0.6;' : ''}" onclick="openProductModal('${p.id}')">
                <span class="${p.agotado ? 'product-tag-sale' : 'product-tag-new'}">
                    ${p.agotado ? 'AGOTADO' : (p.marca || 'AEROSHOP').toUpperCase()}
                </span>
                <div class="product-img-slider">${mediaTag}</div>
                <div>
                    <div class="product-name" style="color:#ffffff;">${p.titulo}</div>
                    <div class="product-subtitle" style="color:#94a3b8;">${(p.descripcion || '').slice(0, 50)}...</div>
                    <div class="product-price">${HTMLPrecio}</div>
                </div>
                <button type="button" class="btn-add" ${p.agotado ? 'disabled style="background:#64748b; cursor:not-allowed;"' : ''} onclick="event.stopPropagation(); addToCart('${p.titulo}', ${precioFinal}, '${p.imagen}')">
                    ${p.agotado ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
            </div>
        `;
    }).join('');

    if (brandKey === 'muhameds') {
        content.className = 'theme-muhameds-full';
        content.innerHTML = `
            <img src="./fondo-espacial.jpg" class="muha-bg-fixed" alt="Fondo">
            <div class="brand-hero-common">
                <div class="muha-brand-group">
                    <img src="./logo-muhameds.png" alt="Muha Meds" class="muha-hero-logo">
                    <img src="./MUHAMEDSINTERFAZ.png" alt="MUHAMEDS" class="muha-hero-title-img">
                </div>
                <button type="button" class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${productosMarcaHTML}</div>
            </div>`;
    } else if (brandKey === 'cookies') {
        content.className = 'theme-cookies-full';
        content.innerHTML = `
            <div class="brand-hero-common">
                <img src="./logo-cookies-texto-removebg-preview.png" class="cookies-hero-logo" alt="Cookies">
                <button type="button" class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${productosMarcaHTML}</div>
            </div>`;
    } else if (brandKey === 'donuts') {
        content.className = 'theme-donuts-full';
        content.innerHTML = `
            <img src="./fondoslog.jpg" class="muha-bg-fixed" alt="Fondo Donuts">
            <div class="brand-hero-common">
                <img src="./donutslogointerfaz.png" class="donuts-interface-logo" alt="Donuts">
                <button type="button" class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${productosMarcaHTML}</div>
            </div>`;
            
    } else if (brandKey === 'packman') {
        content.className = 'theme-packman-full';
        content.innerHTML = `
            <img src="./packmanfondo.jpg" class="muha-bg-fixed" alt="Fondo Packman">
            <div class="brand-hero-common">
                <div class="muha-brand-group">
                    <img src="./packmanmarcas.png" alt="Packman" class="packman-hero-logo">
                    <img src="./PACKMANSEGUNDOLOGO.png" alt="PACKMAN" class="packman-hero-title-img">
                </div>
                <button type="button" class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${productosMarcaHTML}</div>
            </div>`;
           } else if (brandKey === 'fryd') {
        content.className = 'theme-fryd-full';
        content.innerHTML = `
            <img src="./frydfondo.jpg" class="muha-bg-fixed" alt="Fondo FRYD">
            <div class="brand-hero-common">
                <div class="muha-brand-group">
                    <img src="./FRYD.jpg" alt="FRYD Logo" class="fryd-hero-logo" style="max-width: 170px; border-radius: 50%; box-shadow: 0 0 30px rgba(236, 72, 153, 0.7); margin-bottom: 15px;">
                    <h1 style="color: #ffffff; font-size: 2.2rem; font-weight: 900; letter-spacing: 2px; text-shadow: 0 0 15px rgba(236,72,153,0.8);">FRYD EXTRACTS</h1>
                </div>
                <button type="button" class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${productosMarcaHTML}</div>
            </div>`;
            
    } else {
        content.className = 'theme-backwoods-full';
        content.innerHTML = `
            <div class="brand-hero-common">
                <img src="./logo-backwoods.png" alt="Backwoods" style="max-width:250px; margin-bottom:15px;">
                <button type="button" class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${productosMarcaHTML}</div>
            </div>`;
          
        // Buscar si es una marca dinámica registrada por el Capitán
        const marcaPersonalizada = (window.marcasCache || []).find(m => m.id === brandKey);
        const fondoUsar = marcaPersonalizada ? (marcaPersonalizada.fondo || './fondo-espacial.jpg') : './fondo-espacial.jpg';
        const logoUsar = marcaPersonalizada ? marcaPersonalizada.logo : './logo-backwoods.png';
        const tituloUsar = marcaPersonalizada ? marcaPersonalizada.nombre.toUpperCase() : 'BACKWOODS';

        content.className = 'theme-fryd-full';
        content.innerHTML = `
            <img src="${fondoUsar}" class="muha-bg-fixed" alt="Fondo ${tituloUsar}">
            <div class="brand-hero-common">
                <div class="muha-brand-group">
                    <img src="${logoUsar}" alt="${tituloUsar}" class="fryd-hero-logo" style="max-width: 200px; max-height:180px; object-fit:contain; margin-bottom: 15px;">
                    <h1 style="color: #ffffff; font-size: 2.2rem; font-weight: 900; letter-spacing: 2px;">${tituloUsar}</h1>
                </div>
                <button type="button" class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${productosMarcaHTML.length > 0 ? productosMarcaHTML : '<p style="color:#94a3b8; text-align:center; grid-column:1/-1;">Próximamente productos de esta marca.</p>'}</div>
            </div>`;
    
    }
}

function closeFullscreenBrand() {
    const view = document.getElementById('brandFullscreenView');
    if (view) {
        view.classList.remove('active');
        pauseSectionVideos(view);
        closeModalState();
    }
}

function playSectionVideos(container) {
    if (!container) return;
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

function openRutasVuelo() {
    const view = document.getElementById('rutasFullscreenView');
    if (view) {
        openModalState();
        view.classList.add('active');
        view.scrollTop = 0;
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
        openModalState();
        view.classList.add('active');
        view.scrollTop = 0;
        filterMonchisCards();
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
        openModalState();
        cineView.classList.add('active');
        cineView.scrollTop = 0;
        filterCineCards();
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
        openModalState();
        view.classList.add('active');
        view.scrollTop = 0;
        filterMusicCards();
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
        openModalState();
        document.body.classList.add('emergency-active');
        view.classList.add('active');
        view.scrollTop = 0;
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
   6. BASE DE DATOS LOCAL Y DETALLES DE TARJETAS
   ========================================== */
const cardDetailsDB = {
    // RUTAS DE VUELO
    lagoalgo: {
        title: "LagoAlgo — Bosque de Chapultepec 🚣🏻‍♂️",
        video: "./lago-algo.MP4",
        badge: "📍 Poniente • ✈️✈️✈️✈️✈️",
        html: `<p style="color: #cbd5e1;">Espacio cultural y gastronómico inmerso en la 2da Sección del Bosque de Chapultepec. Rodeado de naturaleza, arquitectura brutalista e instalaciones de arte contemporáneo con vistas despejadas al lago.</p>`
    },
    cenart: {
        title: "CENART (Centro Nacional de las Artes) 🎭",
        video: "./cenart-hero.mp4",
        badge: "📍 Sur • ✈️✈️✈️✈️",
        html: `<p style="color: #cbd5e1;">Amplios jardines con áreas verdes tranquilas, zonas de sombra debajo de árboles frondosos y arquitectura icónica. Ideal para relajarse con música en audífonos o disfrutar ensayos de danza y teatro al aire libre.</p>`
    },
    chapultepec: {
        title: "Cineteca de Chapultepec 🎬🌿",
        video: "./chapultepec.mp4",
        badge: "📍 Poniente • ✈️✈️✈️✈️",
        html: `<p style="color: #cbd5e1;">Foros al aire libre en la 4ta Sección de Chapultepec. Cuenta con proyecciones nocturnas gratuitas, senderos elevados y miradores con atardeceres increíbles.</p>`
    },
    laguna: {
        title: "Laguna CDMX 🏭🎨",
        video: "./LAGUNA.MP4",
        badge: "📍 Centro • ✈️✈️✈️✈️",
        html: `<p style="color: #cbd5e1;">Antigua fábrica reconvertida en laboratorio creativo en la colonia Doctores. Alberga estudios de arquitectura, galerías independientes y cafés de especialidad.</p>`
    },
    jardin: {
        title: "Jardín Escénico Chapultepec 🌺",
        video: "./jardin.mp4",
        badge: "📍 Poniente • ✈️✈️✈️",
        html: `<p style="color: #cbd5e1;">Rodeado por el Auditorio Nacional, un pabellón botánico y escénico con humedales urbanos, senderos de madera y luz tenue durante el atardecer.</p>`
    },
    eden: {
        title: "Jardín El Edén CU 🍃📜",
        video: "./eden.mp4",
        badge: "📍 Sur • ✈️✈️✈️",
        html: `<p style="color: #cbd5e1;">Secreto guardado detrás de la Facultad de Filosofía y Letras en Ciudad Universitaria. Espacio sombreado, ambiente estudiantil pacífico y naturaleza silvestre.</p>`
    },
    soumaya: {
        title: "Museo Soumaya & Plaza Carso 🏛️✨",
        video: "./soumaya.mp4",
        badge: "📍 Poniente • ✈️✈️✈️✈️",
        html: `<p style="color: #cbd5e1;">Estructura hexagonal brillante con espejos orgánicos. Gran spot para caminar de noche, observar reflejos metálicos e iluminación urbana.</p>`
    },
    muac: {
        title: "MUAC CU (Museo de Arte Contemporáneo) 🏛️🍃",
        video: "./muac.mp4",
        badge: "📍 Sur • ✈️✈️✈️✈️✈️",
        html: `<p style="color: #cbd5e1;">Ubicado en el Centro Cultural Universitario. Paisaje volcánico de piedra negra, exposiciones inmersivas e instalaciones sonoras de gran escala.</p>`
    },

    // MONCHIS EN CALLE Y CASA
    oreo: {
        title: "Oreo Fritas Crujientes 🍩🍪",
        video: "./OREO.MP4",
        badge: "🏠 Casa • 🍩 Dulce",
        html: `<p style="color: #cbd5e1;">Galletas Oreo pasadas por masa de hotcakes espesa y fritas hasta dorar. Servidas con azúcar glass y jarabe de chocolate caliente.</p>`
    },
    cotorras: {
        title: "Las Cotorras 🌮🍻",
        video: "./cotorras.MP4",
        badge: "📍 Centro • 🍿 Salado",
        html: `<p style="color: #cbd5e1;">Tacos de guisado generosos en tortilla hecha a mano. Salsa de chicharrón prensado, suadero y papas al hilo irresistibles para bajón rápido.</p>`
    },
    salchicha_hawaiana: {
        title: "Salchichas Hawaianas Glaseadas 🌭🍍",
        video: "./salchicha.MP4",
        badge: "🏠 Casa • 🍿 Salado",
        html: `<p style="color: #cbd5e1;">Salchichas de pavo cortadas en pulpo, salteadas con piña en almíbar, salsa BBQ dulce y queso manchego fundido sobre pan tostado con mantequilla.</p>`
    },
    pan_muerto: {
        title: "Pan de Muerto Relleno 🍞🍫",
        video: "./pan-de-muerto.MP4",
        badge: "🏠 Casa • 🍩 Dulce",
        html: `<p style="color: #cbd5e1;">Pan tradicional con azahar, abierto por la mitad y cortado con helado de vainilla, crema de avellanas y trozos de conejito de chocolate.</p>`
    },
    losperros: {
        title: "Los Perros de San Antonio 🌭🌶️",
        video: "./losperros.MP4",
        badge: "📍 Sur • 🍿 Salado",
        html: `<p style="color: #cbd5e1;">Hot dogs gigantes de doble salchicha enrollada en tocino, bañados en chili beans casero, jalapeños en almíbar y cebolla caramelizada.</p>`
    },
    burgergate: {
        title: "Burger Gate 🍔🔥",
        video: "./burgerg.mp4",
        badge: "📍 Centro • 🍿 Salado",
        html: `<p style="color: #cbd5e1;">Smash burgers con bordes ultra crujientes, queso americano derretido, tocino ahumado y salsa secreta sobre pan brioche de papa.</p>`
    },
    pizzadog: {
        title: "PizzaDog Express 🌭🍕",
        video: "./pizza-dog.MP4",
        badge: "🏠 Supervivencia en Casa • 🍿 Salado",
        html: `<p style="color: #cbd5e1;">Pan de hot dog relleno con salchicha, salsa pomodoro italiana, orégano, capas gruesas de queso mozzarella y pepperoni al horno.</p>`
    },
    sandwich: {
        title: "Sándwich Monchoso de 3 Pisos 🥪",
        video: "./sandwich.MP4",
        badge: "🏠 Supervivencia en Casa • 🍿 Salado",
        html: `<p style="color: #cbd5e1;">Pan blanco dorado en sartén con mantequilla, triple queso cheddar, jamón de pavo dorado, pepinillos dulces y aderezo chipotle.</p>`
    },
    salchichas: {
        title: "Salchichas BBQ de Ricardo Pérez 🌭✨",
        video: "./salchichasbbq.MP4",
        badge: "🏠 Supervivencia en Casa • 🧂 Salado",
        html: `<p style="color: #cbd5e1;">La receta del comediante: Salchichas fritas en mantequilla con salsa inglesa, jugo maggi, catsup y abundante salsa BBQ picante.</p>`
    },

    // CINE & TRIP VISUAL
    robots: {
        title: "LOVE, DEATH & ROBOTS 🤖🌌",
        video: "./robots.MP4",
        badge: "🎬 Antología Animada",
        html: `<p style="color: #cbd5e1;">Episodios autoconclusivos con animación fotorrealista y cyberpunk. Historias futuristas sobre IA, monstruos marinos y viajes espaciales.</p>`
    },
    congreso: {
        title: "THE CONGRESS (EL CONGRESO) 💊🎨",
        video: "./congreso.MP4",
        badge: "🎬 Animación Surrealista",
        html: `<p style="color: #cbd5e1;">Una actriz vende sus derechos digitales a un estudio cinematográfico. Al entrar al mundo animado, se desata una fantasía psicodélica y colorida.</p>`
    },
    grasa_fria: {
        title: "GRASA FRÍA 🧊🌭",
        video: "./grasa-fria.MP4",
        badge: "🎬 Cortometraje Bizarro",
        html: `<p style="color: #cbd5e1;">Experimento visual atrapante lleno de texturas, sonidos ASMR gastronómicos y animación fluida que desconecta la mente.</p>`
    },
    pastoral: {
        title: "PASTORAL: TO DIE IN THE COUNTRY 👁️",
        video: "./pastoral.MP4",
        badge: "🎬 Drama Experimental",
        html: `<p style="color: #cbd5e1;">Obra maestra del cine vanguardista japonés de Shūji Terayama. Un viaje cinematográfico lleno de simbolismos visuales y estéticas surrealistas.</p>`
    },
    neotokyo: {
        title: "NEO TOKYO (1987) 🚀",
        video: "./neotokyo.mp4",
        badge: "🎬 Animación Experimental",
        html: `<p style="color: #cbd5e1;">Tres cortos de anime ochentero dirigidos por los creadores de Akira. Un laberinto steampunk, carreras de alta velocidad y mundos futuristas.</p>`
    },
    dandadan: {
        title: "DANDADAN 👻🛸",
        video: "./dandadan.MP4",
        badge: "🎬 Comedia Absurda",
        html: `<p style="color: #cbd5e1;">Alienígenas, fantasmas japoneses y comedia desenfrenada con secuencias de animación dinámicas cargadas de neón y acción impredecible.</p>`
    },
    void: {
        title: "ENTER THE VOID (2009) 👁️‍🗨️🌀",
        video: "./VOID.MP4",
        badge: "🎬 Psicodélica & Inmersiva",
        html: `<p style="color: #cbd5e1;">Dirigida por Gaspar Noé. Perspectiva flotante en primera persona sobre la vida nocturna en Tokio, llena de luces estroboscópicas y experiencias extracorporales.</p>`
    },
    belladonna: {
        title: "BELLADONNA OF SADNESS (1973) 👁️‍🗨️",
        video: "./BELLADONNA.MP4",
        badge: "🎬 Anime Psicodélico",
        html: `<p style="color: #cbd5e1;">Ilustraciones de acuarela animadas con estéticas de los años 70. Una experiencia auditiva y visual llena de arte abstracto.</p>`
    },
    puparia: {
        title: "PUPARIA (2020) 👁️‍🗨️🌀",
        video: "./PUPARIA.MP4",
        badge: "🍿 Cortometraje Anime",
        html: `<p style="color: #cbd5e1;">Cortometraje de 3 minutos creado a mano por Shingo Tamagawa. Expresiones faciales hipnóticas y paisajes con detalles artísticos alucinantes.</p>`
    },
    goodtrip: {
        title: "HAVE A GOOD TRIP (2020) 🍿🌀",
        video: "./GOOD-TRIP.MP4",
        badge: "🍿 Documental & Comedia",
        html: `<p style="color: #cbd5e1;">Celebridades y comediantes relatan sus anécdotas más graciosas con psicodélicos, acompañadas de recreaciones animadas disparatadas.</p>`
    },
    entergalactic: {
        title: "ENTERGALACTIC (2022) 🎨🎶",
        video: "./ENTERGALACTIC.MP4",
        badge: "🎨 Animación & Álbum Visual",
        html: `<p style="color: #cbd5e1;">Creado por Kid Cudi. Historia de amor urbana ambientada en Nueva York con estética de pintura cómic y soundtrack synthwave.</p>`
    },

    // FRECUENCIAS
    dubside: {
        title: "DUB SIDE OF THE MOON 🎧",
        video: "./dub.png",
        badge: "✨ Trip Conceptual • Reggae Dub",
        html: `<p style="color: #cbd5e1;">Reinterpretación Dub / Reggae completa del legendario álbum 'The Dark Side of the Moon' de Pink Floyd por Easy Star All-Stars.</p>`
    }
};

function openCardModal(section, key) {
    const data = cardDetailsDB[key];
    if (!data) return;

    const isVideo = data.video.toLowerCase().endsWith('.mp4');
    const mediaTag = isVideo 
        ? `<video src="${data.video}" autoplay loop muted playsinline style="width: 100%; max-height: 320px; object-fit: cover; border-radius: 16px; margin-bottom: 20px;"></video>`
        : `<img src="${data.video}" alt="${data.title}" style="width: 100%; max-height: 320px; object-fit: contain; background: #000; border-radius: 16px; margin-bottom: 20px;">`;

    const modalBody = document.getElementById('infoModalBody');
    if (modalBody) {
        modalBody.innerHTML = `
            ${mediaTag}
            <span class="badge-tag" style="margin-bottom: 10px; display: inline-block;">${data.badge}</span>
            <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 15px; color: #ffffff;">${data.title}</h2>
            ${data.html}
        `;
    }

    const overlay = document.getElementById('infoModalOverlay');
    if (overlay) {
        overlay.classList.add('active');
        openModalState();
    }
}

function closeInfoModal() {
    const overlay = document.getElementById('infoModalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        closeModalState();
    }
}

/* ==========================================
   7. FILTROS DE SECCIONES
   ========================================== */
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

            card.style.display = (matchTipo && matchZona && matchAntojo) ? 'block' : 'none';
        });
    } else {
        const antojo = document.getElementById('filterAntojoCasa')?.value || 'todos';

        cards.forEach(card => {
            const tipoCard = card.getAttribute('data-tipo');
            const antojoCard = card.getAttribute('data-antojo');

            const matchTipo = (tipoCard === 'casa');
            const matchAntojo = (antojo === 'todos' || antojoCard === antojo);

            card.style.display = (matchTipo && matchAntojo) ? 'block' : 'none';
        });
    }
}

function filterCineCards() {
    const categoria = document.getElementById('filterCategoriaCine')?.value || 'todos';
    const cards = document.querySelectorAll('#cineGrid .compact-card');

    cards.forEach(card => {
        const cardCat = card.getAttribute('data-categoria');
        card.style.display = (categoria === 'todos' || cardCat === categoria) ? 'block' : 'none';
    });
}

function filterMusicCards() {
    const categoria = document.getElementById('filterCategoriaMusic')?.value || 'todos';
    const cards = document.querySelectorAll('#musicGrid .music-card');

    cards.forEach(card => {
        const cardCat = card.getAttribute('data-categoria');
        card.style.display = (categoria === 'todos' || cardCat === categoria) ? 'block' : 'none';
    });
}

function filterRutasCards(zonaSeleccionada) {
    const cards = document.querySelectorAll('#rutasGrid .compact-card');
    cards.forEach(card => {
        const zonaCard = card.getAttribute('data-zona');
        if (zonaSeleccionada === 'todo' || zonaSeleccionada === 'todos' || zonaCard === zonaSeleccionada) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const botonesFiltroRutas = document.querySelectorAll('.filtros-zonas .btn-filtro');
    botonesFiltroRutas.forEach(btn => {
        btn.addEventListener('click', (e) => {
            botonesFiltroRutas.forEach(b => b.classList.remove('activo'));
            e.target.classList.add('activo');
            const zona = e.target.getAttribute('data-zona');
            filterRutasCards(zona);
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    iniciarReloj420();
    setTimeout(() => {
        cargarProductosTienda();
        cargarMarcasTienda();
    }, 800);
});

/* ==========================================
   8. RESPIRACIÓN Y AUDIO EMERGENCIAL
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
                if (isBreathingActive) runBreathingCycle();
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
   9. PANEL DE ADMINISTRACIÓN (CAPITÁN)
   ========================================== */
function checkAdminPermission(user) {
    const adminSection = document.getElementById('adminPanelSection');
    const adminBtn = document.getElementById('adminNavBtn');
    const userEmail = user && user.email ? user.email.toLowerCase().trim() : '';

    if (userEmail === ADMIN_EMAIL.toLowerCase().trim()) {
        if (adminBtn) adminBtn.style.setProperty('display', 'flex', 'important');
    } else {
        if (adminSection) {
            adminSection.style.display = 'none';
            adminSection.classList.remove('active');
        }
        if (adminBtn) adminBtn.style.setProperty('display', 'none', 'important');
    }
}

function abrirPanelAdminDirecto() {
    const user = window.auth ? window.auth.currentUser : null;
    const userEmail = user && user.email ? user.email.toLowerCase().trim() : '';

    if (!user || userEmail !== ADMIN_EMAIL.toLowerCase().trim()) {
        alert("🔒 Acceso restringido: Debes iniciar sesión con la cuenta oficial del Capitán.");
        abrirLogin();
        return;
    }

    const adminSection = document.getElementById('adminPanelSection');
    if (adminSection) {
        cerrarTodasLasVistas();
        adminSection.style.display = 'block';
        adminSection.classList.add('active');
        adminSection.scrollIntoView({ behavior: 'smooth' });

        cargarDashboardAdmin();
        cargarInventarioAdmin();
        cargarProductosTienda();
    }
}

async function cargarDashboardAdmin() {
    if (!window.db) return;
    const { collection, getDocs } = window.fbMethods;

    try {
        let totalIngresos = 0;
        let totalCogs = 0;
        const ventasSnap = await getDocs(collection(window.db, "transacciones_ventas"));
        ventasSnap.forEach(docSnap => {
            const data = docSnap.data();
            totalIngresos += data.monto_cobrado || 0;
            totalCogs += data.costo_unitario || 0;
        });

        let totalGastos = 0;
        const gastosSnap = await getDocs(collection(window.db, "gastos_e_inversiones"));
        gastosSnap.forEach(docSnap => {
            totalGastos += docSnap.data().monto || 0;
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
        { facingMode: "environment" },
        config,
        async (decodedText) => {
            html5QrScanner.stop().then(async () => {
                container.style.display = 'none';
                document.getElementById('adminUserUid').value = decodedText;

                if (window.db && window.fbMethods) {
                    const { doc, getDoc } = window.fbMethods;
                    const userSnap = await getDoc(doc(window.db, "usuarios", decodedText));
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        alert(`✅ Pasajero Detectado: ${data.nombre_real || data.displayName || 'Sin nombre'}\nVuelos acumulados: ${data.vuelos_acumulados || 0}/3`);
                    } else {
                        alert(`⚠️ Código QR escaneado: (${decodedText}), cliente registrado en el campo.`);
                    }
                }
            });
        },
        (errorMessage) => {}
    ).catch(err => {
        alert("⚠️ Error de cámara: Permiso denegado o dispositivo sin cámara.");
        container.style.display = 'none';
    });
}

async function cargarProductosTienda() {
    if (!window.db || !window.fbMethods) return;
    const { collection, getDocs } = window.fbMethods;

    try {
        const snap = await getDocs(collection(window.db, "productos"));
        const gridDestacados = document.getElementById('featuredGrid');
        const listaAdmin = document.getElementById('catListaProductosAdmin');

        if (listaAdmin) listaAdmin.innerHTML = '';

        snap.forEach(docSnap => {
            const p = { id: docSnap.id, ...docSnap.data() };

            if (listaAdmin) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'stock-item-row';
                itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 12px; border-radius: 12px; margin-bottom: 8px;';
                itemDiv.innerHTML = `
                    <div>
                        <strong style="color:#fff;">${p.titulo}</strong> (${p.marca ? p.marca.toUpperCase() : 'GENERAL'}) 
                        <br><span style="font-size:0.8rem; color:#94a3b8;">Precio: $${p.precio} MXN | Stock: ${p.stock} pzas | Estatus: ${p.agotado ? '🔴 AGOTADO' : '🟢 DISPONIBLE'}</span>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button type="button" onclick="toggleEstadoAgotado('${p.id}', ${p.agotado || false})" style="background:${p.agotado ? '#22c55e' : '#e11d48'}; color:#fff; border:none; padding:6px 12px; border-radius:8px; font-weight:700; cursor:pointer;">
                            ${p.agotado ? 'Reactivar' : 'Marcar Agotado'}
                        </button>
                        <button type="button" onclick="eliminarProductoCapitan('${p.id}')" style="background:#64748b; color:#fff; border:none; padding:6px 10px; border-radius:8px; cursor:pointer;">
                            🗑️
                        </button>
                    </div>
                `;
                listaAdmin.appendChild(itemDiv);
            }
        });
    } catch (e) {
        console.error("Error al cargar productos desde Firestore:", e);
    }
}

async function guardarProductoCapitan(event) {
    event.preventDefault();

    const titulo = document.getElementById('catTitulo')?.value.trim();
    const precio = parseFloat(document.getElementById('catPrecio')?.value);
    const costo = parseFloat(document.getElementById('catCosto')?.value || 0);
    const marca = document.getElementById('catMarca')?.value;
    const urlManual = document.getElementById('catImagen')?.value.trim();
    const archivoInput = document.getElementById('catArchivoMedia');
    const variedadesRaw = document.getElementById('catVariedades')?.value.trim();
    const stock = parseInt(document.getElementById('catStock')?.value || 10);
    const descripcion = document.getElementById('catDescripcion')?.value.trim();

    let imagenFinal = urlManual;

    if (archivoInput && archivoInput.files.length > 0) {
        const file = archivoInput.files[0];
        const storageRef = window.fbMethods.ref(window.storage, `productos/${Date.now()}_${file.name}`);
        
        try {
            alert("⏳ Subiendo multimedia a la nube, por favor espera un momento...");
            const snapshot = await window.fbMethods.uploadBytes(storageRef, file);
            imagenFinal = await window.fbMethods.getDownloadURL(snapshot.ref);
        } catch (err) {
            alert("⚠️ Error al subir foto/video: " + err.message);
            return;
        }
    }

    if (!imagenFinal) {
        alert("Por favor selecciona un archivo o ingresa una URL de imagen/video.");
        return;
    }

    const variedades = variedadesRaw ? variedadesRaw.split(',').map(v => v.trim()) : ['Sativa', 'Indica', 'Híbrida'];

    try {
        const { collection, addDoc } = window.fbMethods;
        await addDoc(collection(window.db, "productos"), {
            titulo,
            precio,
            costo,
            marca,
            imagen: imagenFinal,
            imagenes: [imagenFinal],
            variedades,
            stock,
            descripcion,
            agotado: false,
            fecha_registro: new Date().toISOString()
        });

        alert("✅ ¡Producto publicado con éxito!");
        event.target.reset();
        cargarProductosTienda();
    } catch (e) {
        alert("⚠️ Error al publicar producto: " + e.message);
    }
}

async function toggleEstadoAgotado(prodId, estadoActual) {
    try {
        const { doc, updateDoc } = window.fbMethods;
        const prodRef = doc(window.db, "productos", prodId);
        await updateDoc(prodRef, { agotado: !estadoActual });
        cargarProductosTienda();
    } catch (e) {
        alert("Error al cambiar estatus: " + e.message);
    }
}

async function eliminarProductoCapitan(prodId) {
    if (!confirm("¿Seguro que deseas eliminar este producto del catálogo?")) return;
    try {
        const { doc, deleteDoc } = window.fbMethods;
        await deleteDoc(doc(window.db, "productos", prodId));
        alert("🗑️ Producto eliminado.");
        cargarProductosTienda();
    } catch (e) {
        alert("Error al eliminar: " + e.message);
    }
}

async function cargarInventarioAdmin() {
    if (!window.db || !window.fbMethods) return;
    const { collection, getDocs } = window.fbMethods;
    const select = document.getElementById('adminProductSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Selecciona Producto del Catálogo...</option>';
    window.adminInventarioCache = [];

    try {
        const snap = await getDocs(collection(window.db, "productos"));
        snap.forEach(docSnap => {
            const p = { id: docSnap.id, ...docSnap.data() };
            window.adminInventarioCache.push(p);

            if (p.stock > 0 && !p.agotado) {
                select.innerHTML += `<option value="${p.id}">${p.titulo} (Stock: ${p.stock} pzas - $${p.precio} MXN)</option>`;
            }
        });
    } catch (e) {
        console.error("Error al cargar inventario para ventas:", e);
    }
}

function actualizarPrecioSugeridoAdmin() {
    const prodId = document.getElementById('adminProductSelect').value;
    const prod = (window.adminInventarioCache || []).find(item => item.id === prodId);
    if (prod) {
        document.getElementById('adminMontoCobrado').value = prod.precio;
    }
}

async function procesarVentaAdmin(event) {
    event.preventDefault();
    let userQuery = document.getElementById('adminUserUid').value.trim();
    const prodId = document.getElementById('adminProductSelect').value;
    const montoCobrado = parseFloat(document.getElementById('adminMontoCobrado').value);

    const producto = (window.adminInventarioCache || []).find(p => p.id === prodId);
    if (!producto) {
        alert("Selecciona un producto válido del catálogo.");
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
            alert("⚠️ No se encontró ningún pasajero registrado con ese ID o UID.");
            return;
        }

        let nuevosVuelos = (userData.vuelos_acumulados || 0) + 1;
        if (nuevosVuelos > 3) nuevosVuelos = 1;

        await updateDoc(userDocRef, {
            vuelos_acumulados: nuevosVuelos,
            descuento_bienvenida_activo: false
        });

        const nuevoStock = producto.stock - 1;
        const prodRef = doc(window.db, "productos", producto.id);
        await updateDoc(prodRef, {
            stock: nuevoStock,
            agotado: nuevoStock <= 0
        });

        const costoUnitario = producto.costo || 0;
        const gananciaBruta = montoCobrado - costoUnitario;
        
        await addDoc(collection(window.db, "transacciones_ventas"), {
            usuario_uid: userDocRef.id,
            producto_nombre: producto.titulo,
            monto_cobrado: montoCobrado,
            costo_unitario: costoUnitario,
            ganancia_bruta: gananciaBruta,
            fecha: new Date().toISOString()
        });

        alert(`🚀 ¡VENTA REGISTRADA CON ÉXITO!\n\n• Pasajero: ${userData.nombre_real || userData.displayName}\n• Vuelo Acreditado: ${nuevosVuelos}/3\n• Quedan: ${nuevoStock} pzas de ${producto.titulo}`);
        
        event.target.reset();

        cargarDashboardAdmin();
        cargarProductosTienda();
        cargarInventarioAdmin();

    } catch (e) {
        alert("Error al procesar la venta: " + e.message);
    }
}

/* ==========================================
   10. CONTROL DE MODALES DE SESIÓN Y PROMO
   ========================================== */
function abrirPromo() {
    const modal = document.getElementById('promoModal');
    if (modal) {
        modal.classList.add('active');
        openModalState();
    }
}
function cerrarPromo() {
    const modal = document.getElementById('promoModal');
    if (modal) {
        modal.classList.remove('active');
        closeModalState();
    }
}
function abrirLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        openModalState();
    }
}
function cerrarLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        closeModalState();
    }
}
function abrirPerfil() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        renderPasaporteUI();
        modal.classList.add('active');
        openModalState();
    }
}
function cerrarPerfil() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.remove('active');
        closeModalState();
    }
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
    closeFaqModal();
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

/* ==========================================
   11. PROMO HORA 4:20
   ========================================== */
window.esPromo420Activa = false;

function iniciarReloj420() {
    setInterval(() => {
        const ahora = new Date();
        const hora = ahora.getHours();     
        const minutos = ahora.getMinutes();
        const segundos = ahora.getSeconds();

        const es420 = (hora === 16 && minutos >= 20 && minutos < 25);

        if (es420 && !window.esPromo420Activa) {
            const segundosRestantes = 299 - ((minutos - 20) * 60 + segundos);
            activarPromo420(segundosRestantes);
        } else if (!es420 && window.esPromo420Activa) {
            desactivarPromo420();
        } else if (es420 && window.esPromo420Activa) {
            const segs = 299 - ((minutos - 20) * 60 + segundos);
            const min = Math.floor(segs / 60);
            const sec = segs % 60;
            const banner = document.getElementById('bannerHora420');
            if (banner) {
                banner.innerHTML = `🔥 ¡HORA 4:20 ACTIVA! 40% OFF EN TODO EL CATÁLOGO 🔥 (${min}:${sec < 10 ? '0' : ''}${sec})`;
            }
        }
    }, 1000);
}

function activarPromo420(segundosRestantes) {
    window.esPromo420Activa = true;
    let banner = document.getElementById('bannerHora420');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'bannerHora420';
        document.body.prepend(banner);
    }
    banner.style.display = 'block';
    cargarProductosTienda();
}

function desactivarPromo420() {
    window.esPromo420Activa = false;
    const banner = document.getElementById('bannerHora420');
    if (banner) banner.style.display = 'none';
    cargarProductosTienda();
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarReloj420();
    setTimeout(cargarProductosTienda, 800);
});// ==========================================
// GESTIÓN DINÁMICA DE MARCAS Y CATALOGO
// ==========================================

// Cargar Marcas en la web y en los selectores del Admin
async function cargarMarcasTienda() {
    if (!window.db || !window.fbMethods) return;
    const { collection, getDocs } = window.fbMethods;

    const selectMarca = document.getElementById('catMarca');
    const brandsGrid = document.getElementById('brandsSelectorGrid');
    const listaMarcasAdmin = document.getElementById('adminMarcasLista');
cargarDashboardAdmin();
    cargarInventarioAdmin();
    cargarProductosTienda();
    cargarMarcasTienda(); // 👈 Añadir esta línea
    // Marcas por defecto
    const marcasBase = [
        { id: 'muhameds', nombre: 'Muha Meds', logo: './logo-muhameds.png' },
        { id: 'cookies', nombre: 'Cookies', logo: './logo-cookies.png' },
        { id: 'backwoods', nombre: 'Backwoods', logo: './logo-backwoods.png' },
        { id: 'donuts', nombre: 'Donuts', logo: './donutslogomarcas.png' },
        { id: 'packman', nombre: 'Packman', logo: './packmanmarcas.png' },
        { id: 'fryd', nombre: 'FRYD', logo: './FRYD.jpg' }
    ];

    window.marcasCache = [...marcasBase];

    try {
        const snap = await getDocs(collection(window.db, "marcas"));
        snap.forEach(docSnap => {
            const m = { id: docSnap.id, ...docSnap.data() };
            if (!window.marcasCache.some(existing => existing.id === m.id)) {
                window.marcasCache.push(m);
            }
        });
    } catch (e) {
        console.log("Carga de marcas Firestore diferida:", e);
    }

    // 1. Actualizar el <select> del formulario de productos
    if (selectMarca) {
        selectMarca.innerHTML = '<option value="">Selecciona la Marca...</option>';
        window.marcasCache.forEach(m => {
            selectMarca.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
        });
    }

    // 2. Renderizar cuadrícula de marcas en la página principal
    if (brandsGrid) {
        brandsGrid.innerHTML = window.marcasCache.map(m => `
            <div class="brand-logo-card" onclick="openFullscreenBrand('${m.id}')">
                <img src="${m.logo}" alt="${m.nombre}" style="${m.id === 'fryd' ? 'border-radius: 50%; object-fit: cover;' : ''}">
            </div>
        `).join('');
    }

    // 3. Renderizar lista de administración de marcas
    if (listaMarcasAdmin) {
        listaMarcasAdmin.innerHTML = window.marcasCache.map(m => `
            <div class="stock-item-row" style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 10px 14px; border-radius: 12px; margin-bottom: 8px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${m.logo}" style="width:35px; height:35px; object-fit:contain; border-radius:6px;">
                    <strong style="color:#fff;">${m.nombre}</strong> <span style="font-size:0.75rem; color:#94a3b8;">(ID: ${m.id})</span>
                </div>
                ${['muhameds','cookies','backwoods','donuts','packman','fryd'].includes(m.id) 
                    ? '<span style="color:#facc15; font-size:0.8rem;">Sistema Base</span>' 
                    : `<button type="button" onclick="eliminarMarcaCapitan('${m.id}')" style="background:#e11d48; color:#fff; border:none; padding:5px 10px; border-radius:8px; cursor:pointer;">🗑️ Eliminar</button>`}
            </div>
        `).join('');
    }
}

// Guardar nueva marca desde el formulario del Capitán
async function guardarMarcaCapitan(event) {
    event.preventDefault();

    const nombre = document.getElementById('marcaNombre')?.value.trim();
    const idSlug = document.getElementById('marcaId')?.value.trim().toLowerCase().replace(/\s+/g, '');
    const urlLogoManual = document.getElementById('marcaLogoUrl')?.value.trim();
    const urlFondoManual = document.getElementById('marcaFondoUrl')?.value.trim();

    const archivoLogoInput = document.getElementById('marcaLogoArchivo');
    const archivoFondoInput = document.getElementById('marcaFondoArchivo');

    if (!nombre || !idSlug) {
        alert("Por favor completa el nombre y el identificador único de la marca.");
        return;
    }

    let logoFinal = urlLogoManual;
    let fondoFinal = urlFondoManual || './fondo-espacial.jpg';

    try {
        alert("⏳ Subiendo multimedia de la marca, por favor espera...");

        // Subir Logo si se seleccionó archivo
        if (archivoLogoInput && archivoLogoInput.files.length > 0) {
            const fileLogo = archivoLogoInput.files[0];
            const logoRef = window.fbMethods.ref(window.storage, `marcas/logos/${Date.now()}_${fileLogo.name}`);
            const snap = await window.fbMethods.uploadBytes(logoRef, fileLogo);
            logoFinal = await window.fbMethods.getDownloadURL(snap.ref);
        }

        // Subir Fondo si se seleccionó archivo
        if (archivoFondoInput && archivoFondoInput.files.length > 0) {
            const fileFondo = archivoFondoInput.files[0];
            const fondoRef = window.fbMethods.ref(window.storage, `marcas/fondos/${Date.now()}_${fileFondo.name}`);
            const snap = await window.fbMethods.uploadBytes(fondoRef, fileFondo);
            fondoFinal = await window.fbMethods.getDownloadURL(snap.ref);
        }

        if (!logoFinal) {
            alert("Sube una foto de logo o ingresa su URL.");
            return;
        }

        const { doc, setDoc } = window.fbMethods;
        await setDoc(doc(window.db, "marcas", idSlug), {
            nombre,
            id: idSlug,
            logo: logoFinal,
            fondo: fondoFinal,
            fecha_creacion: new Date().toISOString()
        });

        alert(`🚀 ¡Marca "${nombre}" registrada con éxito!`);
        event.target.reset();
        cargarMarcasTienda();

    } catch (e) {
        alert("⚠️ Error al guardar marca: " + e.message);
    }
}

// Eliminar marca registrada
async function eliminarMarcaCapitan(marcaId) {
    if (!confirm(`¿Seguro que deseas eliminar la marca "${marcaId}"?`)) return;
    try {
        const { doc, deleteDoc } = window.fbMethods;
        await deleteDoc(doc(window.db, "marcas", marcaId));
        alert("🗑️ Marca eliminada.");
        cargarMarcasTienda();
    } catch (e) {
        alert("Error al eliminar la marca: " + e.message);
    }
}