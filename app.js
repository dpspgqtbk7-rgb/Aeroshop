// Helper de Feedback Háptico (Vibración táctil)
function vibrar(duracion = 25) {
  // Comprobar si el navegador/dispositivo soporta vibración
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(duracion);
    } catch (e) {
      // Ignorar silenciosamente
    }
  }
}
let currentUserProfile = null;
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
            } else {
                currentUserProfile = null;
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
    besos2g: {
        titulo: "Besos Liquid Diamonds 2g 💋✨",
        precio: 850, 
        descripcion: "BESOS Liquid Diamonds 2G: una fórmula de máxima potencia cargada con 2,000 mg de diamantes líquidos puros que desatan una explosión de cereza negra jugosa y moras silvestres en cada inhalación...",
        imagen: "./besos.jpg",
        imagenes: ["./besos.jpg"],
        variedades: ["Sativa", "Indica", "Híbrida"]
    },
    frydovni: {
        titulo: "FRYD Ovni 🛸 + Gomitas 2g",
        precio: 870,
        descripcion: "Edición Especial FRYD × Alien 🛸. Dispositivo 2G de Liquid Batter + Live Resin e incluye Gomitas Infundidas.",
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
    vibrar(15);
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
    vibrar(35);
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

                <!-- Carril Animado Retro -->
                <div class="packman-track-overlay">
                    <div class="packman-ambient-parade" id="packmanParade">
                        <div class="pacman-runner"></div>
                        <svg class="ghost-svg" viewBox="0 0 50 50"><path d="M25 5 C15 5 10 12 10 22 L10 45 L15 40 L20 45 L25 40 L30 45 L35 40 L40 45 L40 22 C40 12 35 5 25 5 Z" fill="#ef4444"/><circle cx="18" cy="18" r="4" fill="#fff"/><circle cx="19" cy="18" r="2" fill="#000"/><circle cx="32" cy="18" r="4" fill="#fff"/><circle cx="33" cy="18" r="2" fill="#000"/></svg>
                        <svg class="ghost-svg" viewBox="0 0 50 50"><path d="M25 5 C15 5 10 12 10 22 L10 45 L15 40 L20 45 L25 40 L30 45 L35 40 L40 45 L40 22 C40 12 35 5 25 5 Z" fill="#ec4899"/><circle cx="18" cy="18" r="4" fill="#fff"/><circle cx="19" cy="18" r="2" fill="#000"/><circle cx="32" cy="18" r="4" fill="#fff"/><circle cx="33" cy="18" r="2" fill="#000"/></svg>
                        <svg class="ghost-svg" viewBox="0 0 50 50"><path d="M25 5 C15 5 10 12 10 22 L10 45 L15 40 L20 45 L25 40 L30 45 L35 40 L40 45 L40 22 C40 12 35 5 25 5 Z" fill="#06b6d4"/><circle cx="18" cy="18" r="4" fill="#fff"/><circle cx="19" cy="18" r="2" fill="#000"/><circle cx="32" cy="18" r="4" fill="#fff"/><circle cx="33" cy="18" r="2" fill="#000"/></svg>
                    </div>

                    <!-- Squad de Persecución (Fantasmas Azules Asustados) -->
                    <div class="packman-chase-squad" id="packmanChaseSquad">
                        <div class="pacman-runner"></div>
                        <svg class="ghost-svg" viewBox="0 0 50 50"><path d="M25 5 C15 5 10 12 10 22 L10 45 L15 40 L20 45 L25 40 L30 45 L35 40 L40 45 L40 22 C40 12 35 5 25 5 Z" fill="#2563eb"/><circle cx="18" cy="20" r="2" fill="#fff"/><circle cx="32" cy="20" r="2" fill="#fff"/><path d="M15 32 Q25 25 35 32" stroke="#fff" stroke-width="2" fill="none"/></svg>
                        <svg class="ghost-svg" viewBox="0 0 50 50"><path d="M25 5 C15 5 10 12 10 22 L10 45 L15 40 L20 45 L25 40 L30 45 L35 40 L40 45 L40 22 C40 12 35 5 25 5 Z" fill="#2563eb"/><circle cx="18" cy="20" r="2" fill="#fff"/><circle cx="32" cy="20" r="2" fill="#fff"/><path d="M15 32 Q25 25 35 32" stroke="#fff" stroke-width="2" fill="none"/></svg>
                    </div>
                </div>

                <button type="button" class="scroll-down-btn" onclick="triggerPacmanChase(this)">↓</button>
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
    lagoalgo: {
        title: "LagoAlgo — Bosque de Chapultepec 🌊🛩️",
        video: "./lago-algo.MP4",
        badge: "📍 Poniente • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Zona de Despegue:</strong> Poniente (2da Sección del Bosque de Chapultepec)</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Coordenadas / Conexión:</strong> Metro Constituyentes (Línea 7) / Cablebús Los Pinos.</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Bitácora de Vuelo:</strong> Hángar de arquitectura brutalista flotando directo sobre el lago. Aquí la tripulación viene a nivelar presión entre exposiciones de arte inmersivo, arquitectura brutal y un vibe frente al agua que congela el tiempo. La escala VIP obligatoria si andas en la zona poniente.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️✈️ (5/5 — Altitud Máxima & Discreción)</p>
        `
    },
    cenart: {
        title: "CENART (Centro Nacional de las Artes) 🎭🍊",
        video: "./cenart-hero.mp4",
        badge: "📍 Sur • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Zona de Despegue:</strong> Sur (Churubusco)</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Coordenadas / Conexión:</strong> Metro General Anaya (Línea 2) / Metro Tasqueña.</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Bitácora de Vuelo:</strong> Pista de aterrizaje mítica bañada en colores terracota y torres posmodernas. Aterrizar en sus jardines con tu vape a escuchar ensayos de jazz al aire libre o performances mientras baja el sol es elevar la percepción al 100%.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️ (4/5 — Turbinas de Arte & Sonido)</p>
        `
    },
    chapultepec: {
        title: "Cineteca de Chapultepec 🎬🚀",
        video: "./chapultepec.mp4",
        badge: "📍 Poniente • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Zona de Despegue:</strong> Poniente (4ta Sección del Bosque de Chapultepec)</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Coordenadas / Conexión:</strong> Cablebús Línea 3 (Estación Cineteca / Bodegas).</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Bitácora de Vuelo:</strong> La nueva terminal espacial en el corazón del bosque. Súbete al Cablebús, sobrevuela las copas de los árboles y aterriza en salas de proyección de última generación, terrazas elevadas y foros al aire libre. La escala perfecta para conectar cine, aire puro y visuales.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️ (4/5 — Cine en las Alturas)</p>
        `
    },
    laguna: {
        title: "Laguna CDMX 🏭☕",
        video: "./LAGUNA.MP4",
        badge: "📍 Centro • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Zona de Despegue:</strong> Centro (Colonia Doctores)</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Coordenadas / Conexión:</strong> Metro Niños Héroes (Línea 3) / Metro Hospital General.</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Bitácora de Vuelo:</strong> Una antigua fábrica textil reconvertida en hángar creativo secreto en la Doctores. Pasillos industriales llenos de plantas, galerías de diseño y un café de especialidad que calma cualquier turbulencia. Estética pura para bajarle tres rayas al estrés de la ciudad.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️ (4/5 — Hángar Industrial & Vibe)</p>
        `
    },
    jardin: {
        title: "Jardín Escénico Chapultepec 🌿🪵",
        video: "./jardin.mp4",
        badge: "📍 Poniente • ✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Zona de Despegue:</strong> Poniente (Junto al Auditorio Nacional)</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Coordenadas / Conexión:</strong> Metro Auditorio (Línea 7).</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Bitácora de Vuelo:</strong> Pasarela de madera y espejos de agua camuflados en la vegetación del bosque. Una escala relámpago justo al lado del Auditorio para caminar en absoluto silencio, respirar aire fresco y recargar batería en la cabina antes del siguiente destino.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️ (3/5 — Pasarela Verde Relámpago)</p>
        `
    },
    eden: {
        title: "Jardín El Edén CU 🌋🌿",
        video: "./eden.mp4",
        badge: "📍 Sur • ✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Zona de Despegue:</strong> Sur (Reserva Ecológica, UNAM)</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Coordenadas / Conexión:</strong> Metrobús Centro Cultural Universitario / Metro Universidad (Línea 3).</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Bitácora de Vuelo:</strong> Santuario natural escondido entre rocas de piedra volcánica. Cero ruido de motores ni interferencias: solo tú, la vegetación silvestre y un ambiente de paz absoluta para desconectar los transmisores y recargar el pasaporte de vuelo.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️ (3/5 — Trance Volcánico & Paz)</p>
        `
    },
    soumaya: {
        title: "Museo Soumaya 🪞🛸",
        video: "./soumaya.mp4",
        badge: "📍 Poniente • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Zona de Despegue:</strong> Poniente (Nuevo Polanco)</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Coordenadas / Conexión:</strong> Metro San Joaquín / Metro Polanco (Línea 7).</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Bitácora de Vuelo:</strong> La nave nodriza de Polanco. Más de 16,000 hexágonos de aluminio reflejando el cielo de la CDMX. Subir por su rampa espiral bajo luz blanca envolvente rodeado de esculturas monumentales se siente literalmente como caminar dentro de una estación espacial de Sci-Fi.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️ (4/5 — Nave Nodriza Futurista)</p>
        `
    },
    muac: {
        title: "MUAC CU (Museo Universitario Arte Contemporáneo) 🏛️📐",
        video: "./muac.mp4",
        badge: "📍 Sur • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Zona de Despegue:</strong> Sur (Centro Cultural Universitario, UNAM)</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Coordenadas / Conexión:</strong> Metrobús CCU / Metro Universidad (Línea 3).</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Bitácora de Vuelo:</strong> La meca del arte contemporáneo en el sur de la capital. Su fachada oblicua de cristal flotando sobre espejos de agua te prepara para instalaciones sonoras, luminosas y experiencias conceptuales que te reconfiguran la cabeza.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️✈️ (5/5 — Vuelo Transatlántico Visual)</p>
        `
    },
    oreo: {
        title: "Bolitas de Oreo (3 Ingredientes) 🍩",
        video: "./OREO.MP4",
        badge: "🏠 Casa • 🍿 Dulce • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Clasificación:</strong> 🏠 Supervivencia en Casa • 🍿 Dulce</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Ingredientes:</strong> 2 paquetes de galletas Oreo, 2 cdas de queso crema y 200 g de chocolate blanco.</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Preparación:</strong> Triturar las galletas en procesador o bolsa. Mezclar con el queso crema hasta formar una masa moldeable. Aceitar ligeramente las manos, formar bolitas, sumergirlas en el chocolate blanco derretido y enfriar.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Bajón: ✈️✈️✈️✈️ (4/5)</p>
        `
    },
    salchicha_hawaiana: {
        title: "Salchichas Hawaianas Glaseadas 🌭🍍",
        video: "./salchicha.MP4",
        badge: "🏠 Casa • 🍿 Salado • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Clasificación:</strong> 🏠 Supervivencia en Casa • 🍿 Salado</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Ingredientes:</strong> Salchichas para asar o de pavo, piña en almíbar picada, tocino en cubos, salsa BBQ y un chorrito de catsup.</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Preparación:</strong> Freír el tocino en un sartén fino hasta dorar, agregar las salchichas en rodajas y los trozos de piña. Añadir la salsa BBQ y reducir a fuego lento hasta lograr un glaseado espeso y brillante.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Bajón: ✈️✈️✈️✈️ (4/5)</p>
        `
    },
    pan_muerto: {
        title: "Pan de Muerto Relleno con Magnum 🍞🍫",
        video: "./pan-de-muerto.MP4",
        badge: "🏠 Casa • 🍿 Dulce • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Clasificación:</strong> 🏠 Supervivencia en Casa • 🍿 Dulce</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Ingredientes:</strong> 1 pan de muerto azucarado tradicional, 1 paleta Magnum (vainilla/almendras) y jarabe de chocolate.</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Preparación:</strong> Realizar un corte lateral en forma de bolsillo al pan de muerto. Introducir la paleta Magnum entera dentro del pan. Llevar a la sandwichera o plancha caliente durante 3 a 5 minutos hasta dorar. Servir caliente por fuera y helado por dentro.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Bajón: ✈️✈️✈️✈️✈️ (5/5)</p>
        `
    },
    pizzadog: {
        title: "PizzaDog Express 🍕🌭",
        video: "./pizza-dog.MP4",
        badge: "🏠 Casa • 🍿 Salado • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Clasificación:</strong> 🏠 Supervivencia en Casa • 🍿 Salado</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Ingredientes:</strong> Salchichas grandes, rebanadas de tocino, pan para hot dog, salsa marinara/pizzera y queso mozzarella o manchego rallado.</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Preparación:</strong> Envolver la salchicha en tocino y dorar en sartén. Calentar el pan, untar abundante salsa marinara, colocar la salchicha y cubrir con bastante queso. Gratinar en horno eléctrico o microondas.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Bajón: ✈️✈️✈️✈️ (4/5)</p>
        `
    },
    sandwich: {
        title: "Sándwich Monchoso de 3 Pisos 🥪🧀",
        video: "./sandwich.MP4",
        badge: "🏠 Casa • 🍿 Salado • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Clasificación:</strong> 🏠 Supervivencia en Casa • 🍿 Salado</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Ingredientes:</strong> 3 rebanadas de pan de caja, mantequilla, triple queso (manchego, cheddar, americano), jamón de pavo y tocino crujiente.</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Preparación:</strong> Untar mantequilla en la parte exterior del pan. Dorar a fuego lento en sartén armando capas con los tres tipos de queso, jamón y tocino. Presionar suavemente hasta que el queso se funda por completo.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Bajón: ✈️✈️✈️✈️ (4/5)</p>
        `
    },
    salchichas: {
        title: "Salchichas BBQ de Ricardo Pérez 🌭💨",
        video: "./salchichasbbq.MP4",
        badge: "🏠 Casa • 🍿 Salado • ✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Clasificación:</strong> 🏠 Supervivencia en Casa • 🍿 Salado</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Ingredientes:</strong> Salchichas cocktail o en rodajas, cebolla picada, salsa BBQ, toque de salsa inglesa y papas fritas o crujientes para acompañar.</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Preparación:</strong> Acitronar la cebolla en sartén, agregar las salchichas hasta que doren, bañar con salsa BBQ y un toque de salsa inglesa. Servir caliente sobre o al lado de papas saladas.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Bajón: ✈️✈️✈️ (3/5)</p>
        `
    },
    cotorras: {
        title: "Las Cotorras 🌮🍻",
        video: "./cotorras.MP4",
        badge: "📍 Centro CDMX • 🍿 Salado • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Clasificación:</strong> 🏙️ Monchis en la Calle • 🍿 Salado</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Ubicación:</strong> 📍 Centro CDMX (Cerca de Metro Bellas Artes / Allende - Línea 2)</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Especialidad:</strong> Tacos de guisado atascados, tostadas gigantes y micheladas preparadas.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Bajón: ✈️✈️✈️✈️ (4/5)</p>
        `
    },
    losperros: {
        title: "Los Perros de San Antonio 🌭🥓",
        video: "./losperros.MP4",
        badge: "📍 Sur CDMX • 🍿 Salado • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Clasificación:</strong> 🏙️ Monchis en la Calle • 🍿 Salado</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Ubicación:</strong> 📍 Sur CDMX (Cerca de Metro San Antonio / Mixcoac - Línea 7)</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Especialidad:</strong> Hot dogs tamaño jumbo envueltos en tocino, servidos con cebolla caramelizada, champiñones, queso fundido, jalapeños y variedad de aderezos.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Bajón: ✈️✈️✈️✈️✈️ (5/5)</p>
        `
    },
    burgergate: {
        title: "Burger Gate 🍔🔥",
        video: "./burgerg.mp4",
        badge: "📍 Centro CDMX • 🍿 Salado • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Clasificación:</strong> 🏙️ Monchis en la Calle • 🍿 Salado</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Ubicación:</strong> 📍 Centro CDMX (Zona Rosa / Metro Insurgentes - Línea 1)</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>Especialidad:</strong> Smash burgers con doble carne, costra de queso crujiente, mermelada de tocino, pan brioche artesanal y papas a la francesa sazonadas.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Bajón: ✈️✈️✈️✈️✈️ (5/5)</p>
        `
    },
    robots: {
        title: "LOVE, DEATH & ROBOTS 🤖🌀",
        video: "./robots.MP4",
        badge: "🎬 Psicodelia & Sci-Fi • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Psicodelia & Animación / Sci-Fi</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> Netflix</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Antología con animación 3D fotorrealista, cel-shading y rotoscopía.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️✈️ (5/5 — Estimulación Sensorial)</p>
        `
    },
    congreso: {
        title: "THE CONGRESS (2013) 👁️🎭",
        video: "./congreso.MP4",
        badge: "🎬 Viaje Mental • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Psicodelia & Animación / Viaje Mental</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> Apple TV / Prime Video / Cineteca / Archivos de Internet</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Comienza en Live-Action y muta a mitad de la película a una animación alucinante.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️✈️ (5/5 — Viaje Mental)</p>
        `
    },
    grasa_fria: {
        title: "CHILLED GREESE 🍟🚗",
        video: "./grasa-fria.MP4",
        badge: "🤣 Comedia Absurda & Risas",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Comedia Absurda & Risas</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> TikTok / YouTube Originals</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Cortos animados con humor cannabis.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️ (3/5 — Risas & Apetito)</p>
        `
    },
    pastoral: {
        title: "PASTORAL: TO DIE IN THE COUNTRY (1974) 🎭🎪",
        video: "./pastoral.MP4",
        badge: "🎬 Cine Experimental • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Cine Experimental / Surrealismo Vanguardista</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> MUBI / Archivos de Internet / Cineteca</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Obra maestra de Shūji Terayama. Un viaje poético repleto de estética teatral vanguardista.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️✈️ (5/5 — Vanguardia & Trance Filosófico)</p>
        `
    },
    neotokyo: {
        title: "NEO TOKYO (1987) 🏍️🌃",
        video: "./neotokyo.mp4",
        badge: "🎬 Cyberpunk Vintage • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Antología Anime Sci-Fi / Cyberpunk Vintage</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> YouTube / Prime Video / Archivos de Internet</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Tres cortometrajes dirigidos por genios del anime.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️ (4/5 — Retro Cyberpunk & Nostalgia)</p>
        `
    },
    dandadan: {
        title: "DANDADAN 👾🛸",
        video: "./dandadan.MP4",
        badge: "🎬 Action Sci-Fi & Yokai • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Anime / Acción Sci-Fi, Aliens & Yokai</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> Netflix / Crunchyroll</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Una explosión de animación ultra fluida.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️✈️ (5/5 — Adrenalina & Colores)</p>
        `
    },
    void: {
        title: "ENTER THE VOID (2009) 🏙️🌀",
        video: "./VOID.MP4",
        badge: "🎬 Psicodélica Neón • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Cine de Autor / Viaje Astral & Psicodelia Neón</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> MUBI / Tubi / Prime Video (Renta)</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Dirigida por Gaspar Noé. Toda la película está grabada en primera persona (POV).</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️✈️ (5/5 — Inmersión Neón & Mindfuck)</p>
        `
    },
    belladonna: {
        title: "BELLADONNA OF SADNESS (1973) 🌸👁️",
        video: "./BELLADONNA.MP4",
        badge: "🎬 Anime Psicodélico 70s • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Anime Clásico / Psicodelia 70s & Arte Acuarela</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> MUBI / Prime Video (Renta) / Cineteca / Archivos de Internet</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Pieza vanguardista del anime japonés de los 70s construida con acuarelas fluidas.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️✈️ (5/5 — Trippy Retro & Galería de Arte)</p>
        `
    },
    puparia: {
        title: "PUPARIA 👁️✨",
        video: "./PUPARIA.MP4",
        badge: "🍿 Cortometraje Surrealista • ✈️✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Cortometraje / Anime Surrealista & Arte Visual</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> YouTube</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Son solo 3 minutos de animación independiente hecha completamente a mano.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️✈️ (5/5 — Arte Puro & Trance)</p>
        `
    },
    goodtrip: {
        title: "HAVE A GOOD TRIP 🍄🧠",
        video: "./GOOD-TRIP.MP4",
        badge: "🍿 Documental & Comedia • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Documental / Comedia & Psicodelia</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> Netflix</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Celebridades, músicos y comediantes relatan sus historias reales de mal viajes.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️ (4/5 — Risas, Historias & Relax)</p>
        `
    },
    entergalactic: {
        title: "ENTERGALACTIC 🎨🌌",
        video: "./ENTERGALACTIC.MP4",
        badge: "🎨 Romance Urbano & Psicodelia • ✈️✈️✈️✈️",
        html: `
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Categoría:</strong> Animación / Romance Urbano & Psicodelia</p>
            <p style="color: #cbd5e1; margin-bottom: 8px;"><strong>Dónde ver:</strong> Netflix</p>
            <p style="color: #cbd5e1; margin-bottom: 12px;"><strong>¿Por qué es perfecto?:</strong> Creada por Kid Cudi, es una experiencia estética pura.</p>
            <p style="color: #facc15; font-weight: bold;">Nivel de Vuelo: ✈️✈️✈️✈️ (4/5 — Chill, Aesthetic & Sound)</p>
        `
    },
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
    vibrar([40, 60, 40]);
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
    vibrar(20);
    const modal = document.getElementById('promoModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none'; 
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
}

function desactivarPromo420() {
    window.esPromo420Activa = false;
    const banner = document.getElementById('bannerHora420');
    if (banner) banner.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarReloj420();
});

// ==========================================
// GESTIÓN DINÁMICA DE MARCAS Y CATALOGO
// ==========================================
async function cargarMarcasTienda() {
    if (!window.db || !window.fbMethods) return;
    const { collection, getDocs } = window.fbMethods;

    const brandsGrid = document.getElementById('brandsSelectorGrid');

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

    if (brandsGrid) {
        brandsGrid.innerHTML = window.marcasCache.map(m => `
            <div class="brand-logo-card" onclick="openFullscreenBrand('${m.id}')">
                <img src="${m.logo}" alt="${m.nombre}" style="${m.id === 'fryd' ? 'border-radius: 50%; object-fit: cover;' : ''}">
            </div>
        `).join('');
    }
}

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('🚀 PWA Service Worker activo:', reg.scope))
      .catch((err) => console.error('❌ Error al activar Service Worker:', err));
  });
}

// Función para compartir
function compartirContenido(titulo, categoria, descripcion) {
  const urlSitio = window.location.href; 
  
  const mensaje = `🔥 *MIRA ESTO EN AEROSHOP CDMX* 🔥\n\n` +
                  `📍 *${titulo}* (${categoria})\n` +
                  `💬 ${descripcion}\n\n` +
                  `Checa la guía completa y el catálogo aquí 👇\n` +
                  `${urlSitio}`;

  if (navigator.share) {
    navigator.share({
      title: `${titulo} - AEROSHOP`,
      text: mensaje,
      url: urlSitio
    }).catch((err) => console.log('Proceso de compartir cancelado', err));
  } else {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  }
}

function triggerPacmanChase(btn) {
    vibrar(30);
    const chaseSquad = document.getElementById('packmanChaseSquad');
    if (chaseSquad) {
        chaseSquad.classList.remove('active');
        void chaseSquad.offsetWidth; 
        chaseSquad.classList.add('active');
    }
    scrollToBrandProducts();
}

/* ==========================================
   INTERSECTION OBSERVER - LAZY LOADING VIDEOS
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
    const lazyVideos = document.querySelectorAll("video.lazy-video");

    if ("IntersectionObserver" in window) {
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((video) => {
                if (video.isIntersecting) {
                    const source = video.target.querySelector('source');
                    if (source && source.dataset.src) {
                        source.src = source.dataset.src;
                    } else if (video.target.dataset.src) {
                        video.target.src = video.target.dataset.src;
                    }
                    video.target.load();
                    video.target.play().catch(() => {});
                    video.target.classList.remove("lazy-video");
                    observer.unobserve(video.target);
                } else {
                    // Pausar video si sale de la vista
                    video.target.pause();
                }
            });
        });

        lazyVideos.forEach((video) => videoObserver.observe(video));
    }
});