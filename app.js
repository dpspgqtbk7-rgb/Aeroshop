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

    // 1. Código QR Dinámico
    const qrImg = document.getElementById('userQrCodeImg');
    if (qrImg && currentUserProfile.uid) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUserProfile.uid)}`;
    }

    // 2. Avatar y Correo
    const avatarElem = document.getElementById('userAvatar');
    const emailElem = document.getElementById('userEmail');
    if (avatarElem && currentUserProfile.photoURL) avatarElem.src = currentUserProfile.photoURL;
    if (emailElem) emailElem.innerText = currentUserProfile.email;

    // 3. Nombres editables
    const inputNombre = document.getElementById('editNombreReal');
    const inputApodo = document.getElementById('editApodo');
    if (inputNombre) inputNombre.value = currentUserProfile.nombre_real || currentUserProfile.displayName || '';
    if (inputApodo) inputApodo.value = currentUserProfile.apodo || '';

    // 4. Vuelos y Badge VIP
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

    // 5. Pasos
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    if (step1) step1.classList.toggle('active', vuelos >= 1);
    if (step2) step2.classList.toggle('active', vuelos >= 2);
    if (step3) step3.classList.toggle('active', vuelos >= 3);

    // 6. Componentes del perfil
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
   2. CARRUSEL Y VENTANA MODAL DE PRODUCTOS
   ========================================== */
function scrollToBrandProducts() {
    const target = document.getElementById('brandProductsSection');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
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
/* ==========================================
   VENTANA MODAL DINÁMICA DE PRODUCTO (FIRESTORE)
   ========================================== */
async function openProductModal(productId) {
    openModalState();
    const mediaContainer = document.getElementById('modalMediaContainer');
    const thumbnailsContainer = document.getElementById('modalThumbnails');
    const strainPillsContainer = document.getElementById('modalStrainPills');

    if (!window.db || !window.fbMethods) return;

    try {
        const { doc, getDoc } = window.fbMethods;
        const snap = await getDoc(doc(window.db, "productos", productId));

        if (snap.exists()) {
            const p = snap.data();
            
            // Recálculo de precio para Hora 4:20
            const precioCalculado = window.esPromo420Activa ? Math.round(p.precio * 0.60) : p.precio;

            currentModalProduct = {
                id: snap.id,
                title: p.titulo,
                price: precioCalculado,
                image: p.imagen
            };

            document.getElementById('modalTitle').innerText = p.titulo;
            
            document.getElementById('modalPrice').innerHTML = window.esPromo420Activa
                ? `<span class="precio-original-tachado">$${p.precio} MXN</span> <span class="precio-420-destacado">$${precioCalculado} MXN</span>`
                : `$${p.precio} MXN`;

            document.getElementById('modalDescription').innerText = p.descripcion || 'Sin descripción disponible.';

            // Renderizar elemento multimedia principal (Imagen o Video)
            const isVideo = p.imagen.toLowerCase().endsWith('.mp4');
            mediaContainer.innerHTML = isVideo
                ? `<video src="${p.imagen}" autoplay loop muted playsinline class="modal-main-image"></video>`
                : `<img src="${p.imagen}" class="modal-main-image" alt="${p.titulo}">`;

            // Miniaturas (Miniatura principal)
            thumbnailsContainer.innerHTML = isVideo
                ? `<video src="${p.imagen}" class="modal-thumb active" onclick="changeModalMedia(this, '${p.imagen}')" muted></video>`
                : `<img src="${p.imagen}" class="modal-thumb active" onclick="changeModalMedia(this, '${p.imagen}')">`;

            // Renderizar Variedades / Cepas dinámicas desde Firestore
            const variedades = p.variedades || ['Sativa', 'Indica', 'Híbrida'];
            strainPillsContainer.innerHTML = variedades.map((strain, index) => `
                <button class="strain-pill ${index === 0 ? 'selected' : ''}" onclick="selectStrain(this, '${strain}')">${strain}</button>
            `).join('');

            selectedStrain = variedades[0] || 'Sativa';
            document.getElementById('productModalOverlay').classList.add('active');
        }
    } catch (e) {
        console.error("Error al abrir modal de producto:", e);
    }
}
function closeProductModal() {
    document.getElementById('productModalOverlay').classList.remove('active');
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

/* ==========================================
   3. CARRITO DE COMPRAS Y PEDIDO A WHATSAPP
   ========================================== */
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

    // Guardado en segundo plano en Firebase
    if (currentUserProfile && window.auth && window.auth.currentUser) {
        registrarPedidoEnHistorialFirebase(cart);
    }

    // Redirección inmediata (Evita el bloqueo de emergentes en iOS / Android)
    window.location.href = targetUrl;
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
   4. CONTROL DE MODALES Y VISTAS FULLSCREEN
   ========================================== */
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
   VISTAS FULLSCREEN POR MARCA (DINÁMICAS Y CON HORA 4:20)
   ========================================== */
async function openFullscreenBrand(brandKey) {
    const view = document.getElementById('brandFullscreenView');
    const content = document.getElementById('brandFullscreenContent');
    if (!view || !content) return;

    content.innerHTML = '<div style="text-align:center; padding:100px; color:#fff;">Cargando catálogo oficial...</div>';
    view.classList.add('active');
    view.scrollTop = 0;
    openModalState();

    let productosMarcaHTML = '';
    
    // Consulta dinámica a Firestore por marca
    if (window.db && window.fbMethods) {
        try {
            const { collection, getDocs, query, where } = window.fbMethods;
            const q = query(collection(window.db, "productos"), where("marca", "==", brandKey));
            const snap = await getDocs(q);

            snap.forEach(docSnap => {
                const p = docSnap.data();
                
                // Recálculo de precio para la Hora 4:20 (40% OFF)
                const precioFinal = window.esPromo420Activa ? Math.round(p.precio * 0.60) : p.precio;
                
                const HTMLPrecio = window.esPromo420Activa 
                    ? `<span class="precio-original-tachado">$${p.precio} MXN</span><span class="precio-420-destacado">$${precioFinal} MXN</span>`
                    : `$${p.precio} MXN`;

                const mediaTag = p.imagen.endsWith('.mp4')
                    ? `<video src="${p.imagen}" autoplay loop muted playsinline class="active"></video>`
                    : `<img src="${p.imagen}" class="active" alt="${p.titulo}">`;

                productosMarcaHTML += `
                    <div class="product-card card-glass" style="${p.agotado ? 'opacity:0.6;' : ''}">
                        <span class="${p.agotado ? 'product-tag-sale' : 'product-tag-new'}">
                            ${p.agotado ? 'AGOTADO' : p.marca.toUpperCase()}
                        </span>
                        <div class="product-img-slider">${mediaTag}</div>
                        <div>
                            <div class="product-name" style="color:#ffffff;">${p.titulo}</div>
                            <div class="product-subtitle" style="color:#94a3b8;">${p.descripcion.slice(0, 50)}...</div>
                            <div class="product-price">${HTMLPrecio}</div>
                        </div>
                        <button class="btn-add" ${p.agotado ? 'disabled style="background:#64748b; cursor:not-allowed;"' : ''} onclick="event.stopPropagation(); addToCart('${p.titulo}', ${precioFinal}, '${p.imagen}')">
                            ${p.agotado ? 'Sin Stock' : 'Agregar al Carrito'}
                        </button>
                    </div>
                `;
            });
        } catch (e) {
            console.error("Error al cargar marca desde Firestore:", e);
        }
    }

    if (!productosMarcaHTML) {
        productosMarcaHTML = `<p style="text-align: center; color: #94a3b8; grid-column: 1/-1;">No hay productos registrados aún para esta marca.</p>`;
    }

    // Plantillas visuales por marca
    if (brandKey === 'muhameds') {
        content.className = 'theme-muhameds-full';
        content.innerHTML = `
            <img src="./fondo-espacial.jpg" class="muha-bg-fixed" alt="Fondo">
            <div class="brand-hero-common">
                <div class="muha-brand-group">
                    <img src="./logo-muhameds.png" alt="Muha Meds" class="muha-hero-logo">
                    <img src="./MUHAMEDSINTERFAZ.png" alt="MUHAMEDS" class="muha-hero-title-img">
                </div>
                <button class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${productosMarcaHTML}</div>
            </div>`;
    } else if (brandKey === 'cookies') {
        content.className = 'theme-cookies-full';
        content.innerHTML = `
            <div class="brand-hero-common">
                <img src="./logo-cookies-texto-removebg-preview.png" class="cookies-hero-logo" alt="Cookies">
                <button class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
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
                <button class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
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
                <button class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${productosMarcaHTML}</div>
            </div>`;
    } else {
        content.className = 'theme-backwoods-full';
        content.innerHTML = `
            <div class="brand-hero-common">
                <img src="./logo-backwoods.png" alt="Backwoods" style="max-width:250px; margin-bottom:15px;">
                <button class="scroll-down-btn" onclick="scrollToBrandProducts()">↓</button>
            </div>
            <div class="muha-products-container" id="brandProductsSection">
                <div class="muha-cards-grid">${productosMarcaHTML}</div>
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
        cineView.classList.add('active');
        cineView.scrollTop = 0;
        openModalState();
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
        view.classList.add('active');
        view.scrollTop = 0;
        openModalState();
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
   5. FILTROS Y BASE DE DATOS LOCAL
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

const cardDetailsDB = {
    oreo: {
        title: "Bolitas de Oreo Mágicas 🍩",
        video: "./OREO.MP4",
        badge: "🏠 Supervivencia en Casa • 🍿 Dulce",
        html: `<p style="color: #cbd5e1;">Triturar galletas Oreo, mezclar con queso crema, formar bolitas y bañar en chocolate blanco.</p>`
    },
    cotorras: {
        title: "Taco Austero de Jamón y Mayo 🌮",
        video: "./cotorras.MP4",
        badge: "🏠 Supervivencia en Casa • 🍿 Salado",
        html: `<p style="color: #cbd5e1;">Tortilla caliente de comal con mayonesa y jamón de pavo.</p>`
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
    if (overlay) overlay.classList.add('active');
    openModalState();
}

function closeInfoModal() {
    const overlay = document.getElementById('infoModalOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        closeModalState();
    }
}

/* ==========================================
   6. RESPIRACIÓN Y AUDIO EMERGENCIAL
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
   7. PANEL DE CONTROL Y ADMINISTRACIÓN (CAPITÁN)
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
        alert("🔒 Acceso restringido: Debes iniciar sesión con la cuenta de Capitán.");
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
                        alert(`⚠️ Código QR escaneado: (${decodedText}), cliente registrado en input.`);
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

/* ==========================================
   8. MANEJO DE MODALES DE INICIO Y PERFIL
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
    if (modal) {
        renderPasaporteUI();
        modal.classList.add('active');
    }
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
   9. PROMO HORA 4:20 (AUTOMÁTICA 5 MINUTOS)
   ========================================== */
window.esPromo420Activa = false;

function iniciarReloj420() {
    setInterval(() => {
        const ahora = new Date();
        const hora = ahora.getHours();     
        const minutos = ahora.getMinutes();

        const es420 = (hora === 16 && minutos >= 20 && minutos < 25);

        if (es420 && !window.esPromo420Activa) {
            activarPromo420();
        } else if (!es420 && window.esPromo420Activa) {
            desactivarPromo420();
        }
    }, 1000);
}

function activarPromo420() {
    window.esPromo420Activa = true;
    let banner = document.getElementById('bannerHora420');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'bannerHora420';
        banner.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%;
            background: linear-gradient(90deg, #16a34a, #eab308, #16a34a);
            color: #000; font-weight: 800; text-align: center;
            padding: 10px; z-index: 999999; font-size: 0.9rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        `;
        document.body.prepend(banner);
    }
    banner.style.display = 'block';
    banner.innerHTML = `🔥 ¡HORA 4:20 ACTIVA! 40% OFF EN TODO EL CATÁLOGO 🔥`;
}

function desactivarPromo420() {
    window.esPromo420Activa = false;
    const banner = document.getElementById('bannerHora420');
    if (banner) banner.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', iniciarReloj420);
/* ==========================================
   GESTIÓN DE CATÁLOGO DINÁMICO EN FIRESTORE
   ========================================== */

// 1. Cargar productos en la tienda y en el panel Capitán
async function cargarProductosTienda() {
    if (!window.db || !window.fbMethods) return;
    const { collection, getDocs } = window.fbMethods;

    try {
        const snap = await getDocs(collection(window.db, "productos"));
        const gridDestacados = document.getElementById('featuredGrid');
        const listaAdmin = document.getElementById('catListaProductosAdmin');

        if (listaAdmin) listaAdmin.innerHTML = '';
        if (gridDestacados) gridDestacados.innerHTML = '';

        snap.forEach(docSnap => {
            const p = { id: docSnap.id, ...docSnap.data() };

            // A) RENDERIZAR EN EL PANEL DEL CAPITÁN
            if (listaAdmin) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'stock-item-row';
                itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 12px; border-radius: 12px; margin-bottom: 8px;';
                itemDiv.innerHTML = `
                    <div>
                        <strong style="color:#fff;">${p.titulo}</strong> (${p.marca.toUpperCase()}) 
                        <br><span style="font-size:0.8rem; color:#94a3b8;">Precio: $${p.precio} MXN | Stock: ${p.stock} pzas | Estatus: ${p.agotado ? '🔴 AGOTADO' : '🟢 DISPONIBLE'}</span>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button onclick="toggleEstadoAgotado('${p.id}', ${p.agotado || false})" style="background:${p.agotado ? '#22c55e' : '#e11d48'}; color:#fff; border:none; padding:6px 12px; border-radius:8px; font-weight:700; cursor:pointer;">
                            ${p.agotado ? 'Reactivar' : 'Marcar Agotado'}
                        </button>
                        <button onclick="eliminarProductoCapitan('${p.id}')" style="background:#64748b; color:#fff; border:none; padding:6px 10px; border-radius:8px; cursor:pointer;">
                            🗑️
                        </button>
                    </div>
                `;
                listaAdmin.appendChild(itemDiv);
            }

            // B) RENDERIZAR EN LA TIENDA PRINCIPAL
            if (gridDestacados) {
                const card = document.createElement('div');
                card.className = 'product-card card-glass';
                if (p.agotado) card.style.opacity = '0.6';

                const mediaTag = p.imagen.endsWith('.mp4')
                    ? `<video src="${p.imagen}" autoplay loop muted playsinline class="active"></video>`
                    : `<img src="${p.imagen}" class="active" alt="${p.titulo}">`;

                card.innerHTML = `
                    <span class="${p.agotado ? 'product-tag-sale' : 'product-tag-new'}" style="${p.agotado ? 'background:#ef4444; color:#fff;' : ''}">
                        ${p.agotado ? 'AGOTADO' : p.marca.toUpperCase()}
                    </span>
                    <div class="product-img-slider">${mediaTag}</div>
                    <div>
                        <div class="product-name">${p.titulo}</div>
                        <div class="product-subtitle">${p.descripcion.slice(0, 60)}...</div>
                        <div class="product-price">$${p.precio} MXN</div>
                    </div>
                    <button class="btn-add" ${p.agotado ? 'disabled style="background:#64748b; cursor:not-allowed;"' : ''} onclick="event.stopPropagation(); addToCart('${p.titulo}', ${p.precio}, '${p.imagen}')">
                        ${p.agotado ? 'Sin Stock Disponible' : 'Agregar al Carrito'}
                    </button>
                `;
                gridDestacados.appendChild(card);
            }
        });
    } catch (e) {
        console.error("Error al cargar productos desde Firestore:", e);
    }
}

// 2. Guardar un nuevo producto en Firebase desde el Panel Capitán
async function guardarProductoCapitan(event) {
    event.preventDefault();

    const titulo = document.getElementById('catTitulo').value.trim();
    const precio = parseFloat(document.getElementById('catPrecio').value);
    const costo = parseFloat(document.getElementById('catCosto').value);
    const marca = document.getElementById('catMarca').value;
    const imagen = document.getElementById('catImagen').value.trim();
    const variedadesRaw = document.getElementById('catVariedades').value.trim();
    const stock = parseInt(document.getElementById('catStock').value);
    const descripcion = document.getElementById('catDescripcion').value.trim();

    const variedades = variedadesRaw ? variedadesRaw.split(',').map(v => v.trim()) : ['Sativa', 'Indica', 'Híbrida'];

    try {
        const { collection, addDoc } = window.fbMethods;
        await addDoc(collection(window.db, "productos"), {
            titulo,
            precio,
            costo,
            marca,
            imagen,
            variedades,
            stock,
            descripcion,
            agotado: false,
            fecha_registro: new Date().toISOString()
        });

        alert("✅ ¡Producto publicado con éxito en la tienda!");
        event.target.reset();
        cargarProductosTienda();
    } catch (e) {
        alert("⚠️ Error al publicar producto: " + e.message);
    }
}

// 3. Cambiar el estado entre Disponible y Agotado
async function toggleEstadoAgotado(prodId, estadoActual) {
    try {
        const { doc, updateDoc } = window.fbMethods;
        const prodRef = doc(window.db, "productos", prodId);
        await updateDoc(prodRef, {
            agotado: !estadoActual
        });
        cargarProductosTienda();
    } catch (e) {
        alert("Error al cambiar estatus: " + e.message);
    }
}

// 4. Eliminar producto del catálogo
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

// Cargar catálogo automáticamente al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(cargarProductosTienda, 800);
});
/* ==========================================
   LÓGICA COMPLETA DE HORA 4:20 Y RECALCULO
   ========================================== */
window.esPromo420Activa = false;

function iniciarReloj420() {
    setInterval(() => {
        const ahora = new Date();
        const hora = ahora.getHours();     // 16 = 4 PM
        const minutos = ahora.getMinutes();
        const segundos = ahora.getSeconds();

        // Rango activo: 16:20:00 a 16:24:59
        const es420 = (hora === 16 && minutos >= 20 && minutos < 25);

        if (es420 && !window.esPromo420Activa) {
            const segundosRestantes = 299 - ((minutos - 20) * 60 + segundos);
            activarPromo420(segundosRestantes);
        } else if (!es420 && window.esPromo420Activa) {
            desactivarPromo420();
        } else if (es420 && window.esPromo420Activa) {
            // Actualizar contador del banner
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
    
    // Recargar catálogo para mostrar los precios con el 40% de descuento
    if (typeof cargarProductosTienda === 'function') {
        cargarProductosTienda();
    }
}

function desactivarPromo420() {
    window.esPromo420Activa = false;
    const banner = document.getElementById('bannerHora420');
    if (banner) banner.style.display = 'none';

    // Restaurar precios normales en el catálogo
    if (typeof cargarProductosTienda === 'function') {
        cargarProductosTienda();
    }
}

document.addEventListener('DOMContentLoaded', iniciarReloj420);
/* ==========================================
   PROCESAMIENTO DE VENTAS Y VUELOS EN VIVO (CAPITÁN)
   ========================================== */

// 1. Cargar productos dinámicos de Firestore en el select de ventas
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

// 2. Actualizar precio sugerido al seleccionar un producto
function actualizarPrecioSugeridoAdmin() {
    const prodId = document.getElementById('adminProductSelect').value;
    const prod = (window.adminInventarioCache || []).find(item => item.id === prodId);
    if (prod) {
        document.getElementById('adminMontoCobrado').value = prod.precio;
    }
}

// 3. Procesar venta, descontar stock en Firestore y acreditar vuelo al cliente
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

        // Buscar al cliente por UID completo o ID corto (#USR-XXXXX)
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

        // Acreditar vuelo (ciclo de 1 a 3)
        let nuevosVuelos = (userData.vuelos_acumulados || 0) + 1;
        if (nuevosVuelos > 3) {
            nuevosVuelos = 1;
        }

        await updateDoc(userDocRef, {
            vuelos_acumulados: nuevosVuelos,
            descuento_bienvenida_activo: false
        });

        // Descontar stock e invocar 'agotado' si llega a cero
        const nuevoStock = producto.stock - 1;
        const prodRef = doc(window.db, "productos", producto.id);
        await updateDoc(prodRef, {
            stock: nuevoStock,
            agotado: nuevoStock <= 0
        });

        // Registrar transacción contable
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

        // Actualizar todos los módulos en pantalla
        if (typeof cargarDashboardAdmin === 'function') cargarDashboardAdmin();
        if (typeof cargarProductosTienda === 'function') cargarProductosTienda();
        if (typeof cargarInventarioAdmin === 'function') cargarInventarioAdmin();

    } catch (e) {
        alert("Error al procesar la venta: " + e.message);
    }
}