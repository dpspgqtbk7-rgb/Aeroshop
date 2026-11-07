// js/admin.js — Panel del Capitán: agrega, edita, agota y retira productos sin tocar código.
// Todo se guarda en Firebase (colección "productos"). La página lo lee sola al abrirse.
import { auth, db, googleProvider, fbMethods } from '../firebase-config.js';
import { productsData } from './modules/productos.js';
import { BASE, CAMPOS, aplicar } from './modules/inventario.js';
import { cargarConta, initConta, costoDe, guardarCosto } from './admin-conta.js';

const ADMIN_EMAIL = 'aeroshop.37@gmail.com';
const EDITABLES = Object.keys(CAMPOS).filter(k => k !== 'panel');
const FOTO_MAX_LADO = 1000;      // px
const FOTO_MAX_BYTES = 320000;   // ~320 KB por foto (para que la página cargue rápido)

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mxn = (n) => '$' + Number(n).toLocaleString('es-MX');

let remotos = {};          // lo que hay en Firebase
let filtro = 'todos';
let editando = null;       // id del producto abierto en el editor (null = nuevo)
let fotoNueva = null;      // foto elegida en el editor (data URL)
let pestana = 'productos';

/* ---------- Avisos ---------- */
let toastTimer;
function aviso(texto, error = false) {
    const t = $('toast');
    t.textContent = texto;
    t.classList.toggle('error', error);
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2800);
}

/* ---------- Entrar / salir ---------- */
function mostrar(vista) {
    $('vistaLogin').hidden = vista !== 'login';
    $('vistaPanel').hidden = vista !== 'panel';
    $('tabs').hidden = vista !== 'panel';
    $('btnNuevo').hidden = vista !== 'panel' || pestana !== 'productos';
    $('btnSalir').hidden = vista === 'login';
}

// Pestañas: Productos | Pedidos | Cuentas
$('tabs').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-tab]');
    if (!b) return;
    pestana = b.dataset.tab;
    $('tabs').querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t === b));
    $('tabProductos').hidden = pestana !== 'productos';
    $('tabPedidos').hidden = pestana !== 'pedidos';
    $('tabConta').hidden = pestana !== 'conta';
    $('btnNuevo').hidden = pestana !== 'productos';
    window.scrollTo(0, 0);
});
initConta();

$('btnEntrar').addEventListener('click', async () => {
    $('btnEntrar').disabled = true;
    try {
        await fbMethods.signInWithPopup(auth, googleProvider);
    } catch (err) {
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
            await fbMethods.signInWithRedirect(auth, googleProvider);
            return;
        }
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
            aviso('No se pudo entrar. Intenta otra vez.', true);
            console.error(err);
        }
    } finally {
        $('btnEntrar').disabled = false;
    }
});
$('btnSalir').addEventListener('click', () => fbMethods.signOut(auth));

fbMethods.onAuthStateChanged(auth, (user) => {
    if (!user) {
        $('quien').textContent = 'AEROSHOP CDMX';
        $('loginMsg').textContent = 'Entra con la cuenta de Google de AEROSHOP para manejar tus productos.';
        mostrar('login');
        return;
    }
    $('quien').textContent = user.email || '';
    if ((user.email || '').toLowerCase() !== ADMIN_EMAIL) {
        $('loginMsg').textContent = `La cuenta ${user.email} no es la del Capitán. Sal y entra con ${ADMIN_EMAIL}.`;
        $('btnEntrar').hidden = true;
        mostrar('login');
        $('btnSalir').hidden = false;
        return;
    }
    $('btnEntrar').hidden = false;
    mostrar('panel');
    cargar();
});

/* ---------- Datos ---------- */
async function cargar() {
    try {
        const snap = await fbMethods.getDocs(fbMethods.collection(db, 'productos'));
        remotos = {};
        snap.forEach(d => { remotos[d.id] = d.data(); });
        aplicar(remotos);
        pintarLista();
        cargarConta(aviso).then(pintarLista).catch(err => {
            console.error(err);
            aviso(err.code === 'permission-denied' ? '🔒 Falta dar permiso a Cuentas/Pedidos en Firebase' : '😕 No se cargaron las cuentas', true);
        });
    } catch (err) {
        console.error(err);
        $('lista').innerHTML = '<p class="vacio">😕 No se pudieron cargar los productos. Revisa tu internet y recarga.</p>';
    }
}

// Iguala "vacío", "no", "sin dato" para comparar con el original
function normal(v) {
    if (v === undefined || v === null || v === false || v === '') return undefined;
    if (Array.isArray(v) && v.length === 0) return undefined;
    return v;
}

// Qué hay que guardar en Firebase para que el producto quede como "nuevoEstado"
function documentoPara(id, nuevoEstado) {
    const doc = {};
    if (BASE[id]) {
        // Producto "de fábrica": solo se guarda lo que es distinto
        EDITABLES.forEach(k => {
            const a = normal(nuevoEstado[k]);
            const b = normal(BASE[id][k]);
            if (JSON.stringify(a) !== JSON.stringify(b)) doc[k] = a === undefined ? null : a;
        });
    } else {
        // Producto nuevo del Panel: se guarda completo
        EDITABLES.forEach(k => { const v = normal(nuevoEstado[k]); if (v !== undefined) doc[k] = v; });
        doc.panel = true;
        doc.creadoEn = remotos[id]?.creadoEn || new Date().toISOString();
    }
    return doc;
}

async function guardar(id, nuevoEstado, mensaje = '✅ Guardado. Ya se ve en la página') {
    const doc = documentoPara(id, nuevoEstado);
    const ref = fbMethods.doc(db, 'productos', id);
    const sinCambios = BASE[id] && Object.keys(doc).length === 0;
    try {
        if (sinCambios) {
            await fbMethods.deleteDoc(ref);
            delete remotos[id];
        } else {
            doc.actualizadoEn = new Date().toISOString();
            await fbMethods.setDoc(ref, doc);
            remotos[id] = doc;
        }
        aplicar(remotos);
        pintarLista();
        aviso(mensaje);
        return true;
    } catch (err) {
        console.error(err);
        aviso(err.code === 'permission-denied' ? '🔒 Esta cuenta no tiene permiso para guardar' : '😕 No se guardó. Revisa tu internet.', true);
        return false;
    }
}

/* ---------- Lista ---------- */
function pasaFiltro(id, p, texto) {
    if (texto) {
        const t = `${p.title} ${p.marca || ''}`.toLowerCase();
        if (!t.includes(texto)) return false;
    }
    switch (filtro) {
        case 'disponibles': return !p.agotado && !p.oculto;
        case 'agotados': return !!p.agotado;
        case 'retirados': return !!p.oculto;
        case 'mieles': return p.seccion !== 'nubes';
        case 'nubes': return p.seccion === 'nubes';
        default: return true;
    }
}

function pintarLista() {
    const texto = $('buscar').value.trim().toLowerCase();
    const ids = Object.keys(productsData);
    // Los nuevos del Panel primero (más recientes arriba), luego los de siempre
    ids.sort((a, b) => (!!productsData[b].panel - !!productsData[a].panel)
        || String(remotos[b]?.creadoEn || '').localeCompare(String(remotos[a]?.creadoEn || '')));
    const visibles = ids.filter(id => pasaFiltro(id, productsData[id], texto));

    const total = ids.length;
    const agotados = ids.filter(id => productsData[id].agotado).length;
    const retirados = ids.filter(id => productsData[id].oculto).length;
    $('resumen').textContent = `${total} productos · ${agotados} agotados · ${retirados} retirados`;

    $('lista').innerHTML = visibles.length ? visibles.map(id => {
        const p = productsData[id];
        const promo = Number.isFinite(p.antes) && p.antes > p.price;
        const badges = [
            p.oculto ? '<span class="badge">🚫 RETIRADO</span>'
                : p.agotado ? '<span class="badge bad">😢 AGOTADO</span>' : '<span class="badge ok">✅ DISPONIBLE</span>',
            promo ? '<span class="badge promo">PROMO 🔥</span>' : '',
            p.destacado ? '<span class="badge warn">⭐ DESTACADO</span>' : '',
            p.anuncio && !promo && p.anuncio !== 'RECOMENDADO ⭐' ? `<span class="badge warn">${esc(p.anuncio)}</span>` : '',
            p.panel ? '<span class="badge">NUEVO (Panel)</span>' : (remotos[id] ? '<span class="badge">✏️ Editado</span>' : ''),
            p.seccion === 'nubes' ? '<span class="badge">💨 Nubes</span>' : ''
        ].join('');
        return `
        <article class="prod${p.agotado ? ' agotado' : ''}${p.oculto ? ' retirado' : ''}" data-id="${esc(id)}">
            <img src="${esc(p.image)}" alt="" loading="lazy" onerror="this.src='./avion.png'">
            <div>
                <h3>${esc(p.title)}</h3>
                <div class="precio">${promo ? `<s>${mxn(p.antes)}</s>` : ''}${Number.isFinite(p.price) && p.price > 0 ? mxn(p.price) + ' MXN' : 'Sin precio'}</div>
                ${costoDe(id) !== null && Number.isFinite(p.price) ? `<div class="gana">🔒 Te cuesta ${mxn(costoDe(id))} · ganas ${mxn(p.price - costoDe(id))}</div>` : ''}
                <div class="badges">${badges}</div>
            </div>
            <div class="acciones">
                <button type="button" class="a-stock${p.agotado ? ' is-agotado' : ''}" data-accion="stock">${p.agotado ? '😢 Agotado' : '✅ Hay'}</button>
                <button type="button" class="a-ver${p.oculto ? ' is-retirado' : ''}" data-accion="ver">${p.oculto ? '🚫 Retirado' : '👁️ Visible'}</button>
                <button type="button" class="a-edit" data-accion="editar">✏️</button>
            </div>
        </article>`;
    }).join('') : '<p class="vacio">No hay productos con ese filtro 🛬</p>';

    // Marcas para sugerir en el editor
    const marcas = [...new Set(ids.map(id => productsData[id].marca).filter(Boolean))].sort();
    $('listaMarcas').innerHTML = marcas.map(m => `<option value="${esc(m)}">`).join('');
}

$('buscar').addEventListener('input', pintarLista);
$('chips').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-f]');
    if (!b) return;
    filtro = b.dataset.f;
    $('chips').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b));
    pintarLista();
});

$('lista').addEventListener('click', async (ev) => {
    const b = ev.target.closest('[data-accion]');
    if (!b) return;
    const id = b.closest('[data-id]').dataset.id;
    const p = productsData[id];
    if (b.dataset.accion === 'editar') return abrirEditor(id);
    b.disabled = true;
    if (b.dataset.accion === 'stock') {
        await guardar(id, { ...p, agotado: !p.agotado }, p.agotado ? '✅ Disponible otra vez' : '😢 Marcado como agotado');
    } else if (b.dataset.accion === 'ver') {
        await guardar(id, { ...p, oculto: !p.oculto }, p.oculto ? '👁️ Ya se ve en la página' : '🚫 Retirado de la página');
    }
    b.disabled = false;
});

/* ---------- Editor ---------- */
function abrirEditor(id) {
    editando = id;
    fotoNueva = null;
    const p = id ? productsData[id] : { strains: [], seccion: 'mieles' };
    $('sheetTitulo').textContent = id ? 'Editar producto' : 'Nuevo producto ✨';
    $('fFotoVista').src = p.image || './avion.png';
    $('fFotoNota').textContent = 'Se hace más ligera sola para que la página cargue rápido.';
    $('fFoto').value = '';
    $('fTitulo').value = p.title || '';
    $('fPrecio').value = Number.isFinite(p.price) ? p.price : '';
    $('fAntes').value = Number.isFinite(p.antes) ? p.antes : '';
    $('fDesc').value = p.description || '';
    $('fCepas').value = (p.strains || []).join('\n');
    $('fMarca').value = p.marca || '';
    const g = $('fGramos');
    if (p.gramos && ![...g.options].some(o => Number(o.value) === p.gramos)) g.add(new Option(`${p.gramos}g`, p.gramos));
    g.value = p.gramos ? String(p.gramos) : '';
    $('fSeccion').value = p.seccion === 'nubes' ? 'nubes' : 'mieles';
    $('campoSeccion').hidden = !!(id && BASE[id]); // los de siempre se quedan en su sección
    $('fAnuncio').value = ['NUEVO ✨', 'PROMO 🔥'].includes(p.anuncio) ? p.anuncio : '';
    if (p.anuncio && !$('fAnuncio').value) { $('fAnuncio').add(new Option(p.anuncio, p.anuncio)); $('fAnuncio').value = p.anuncio; }
    $('fAgotado').checked = !!p.agotado;
    $('fDestacado').checked = !!p.destacado;
    $('fCosto').value = id && costoDe(id) !== null ? costoDe(id) : '';
    $('fOculto').checked = !!p.oculto;
    $('btnOriginal').hidden = !(id && BASE[id] && remotos[id]);
    $('btnBorrar').hidden = !(id && !BASE[id]);
    $('sheetBg').classList.add('on');
    $('sheet').classList.add('on');
    $('sheet').scrollTop = 0;
}

function cerrarEditor() {
    $('sheetBg').classList.remove('on');
    $('sheet').classList.remove('on');
    editando = null;
    fotoNueva = null;
}
$('btnCerrar').addEventListener('click', cerrarEditor);
$('sheetBg').addEventListener('click', cerrarEditor);
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && $('sheet').classList.contains('on')) cerrarEditor(); });
$('btnNuevo').addEventListener('click', () => abrirEditor(null));

// Hace la foto más chica (máx. 1000 px y ~320 KB) para guardarla en Firebase
function cargarImagen(archivo) {
    return new Promise((ok, mal) => {
        const url = URL.createObjectURL(archivo);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); ok(img); };
        img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('foto')); };
        img.src = url;
    });
}
async function comprimirFoto(archivo) {
    const img = await cargarImagen(archivo);
    let lado = FOTO_MAX_LADO;
    let calidad = 0.82;
    for (let intento = 0; intento < 8; intento++) {
        const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * escala);
        c.height = Math.round(img.naturalHeight * escala);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const data = c.toDataURL('image/jpeg', calidad);
        if (data.length <= FOTO_MAX_BYTES) return data;
        if (calidad > 0.6) calidad -= 0.1; else lado = Math.round(lado * 0.8);
    }
    throw new Error('muy pesada');
}

$('fFoto').addEventListener('change', async () => {
    const archivo = $('fFoto').files[0];
    if (!archivo) return;
    $('fFotoNota').textContent = 'Preparando foto… ⏳';
    try {
        fotoNueva = await comprimirFoto(archivo);
        $('fFotoVista').src = fotoNueva;
        $('fFotoNota').textContent = `✅ Lista (${Math.round(fotoNueva.length / 1024)} KB)`;
    } catch (err) {
        fotoNueva = null;
        $('fFotoNota').textContent = '😕 No se pudo usar esa foto. Prueba con otra (JPG o PNG).';
    }
});

const numero = (v) => { const n = Number(String(v).replace(/[$,\s]/g, '')); return v !== '' && Number.isFinite(n) && n >= 0 ? n : undefined; };
const slug = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'producto';

$('sheet').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const titulo = $('fTitulo').value.trim();
    const precio = numero($('fPrecio').value);
    const antes = numero($('fAntes').value);
    const actual = editando ? productsData[editando] : {};
    const foto = fotoNueva || actual.image;

    if (!titulo) { aviso('Ponle un nombre al producto', true); $('fTitulo').focus(); return; }
    if (!precio) { aviso('Ponle un precio', true); $('fPrecio').focus(); return; }
    if (!foto) { aviso('Elige una foto 📷', true); return; }
    if (antes !== undefined && antes <= precio) { aviso('El "precio antes" debe ser más alto que el precio (o déjalo vacío)', true); $('fAntes').focus(); return; }

    const nuevoEstado = {
        ...actual,
        title: titulo,
        price: precio,
        antes: antes,
        image: foto,
        description: $('fDesc').value.trim(),
        strains: $('fCepas').value.split('\n').map(s => s.trim()).filter(Boolean),
        marca: $('fMarca').value.trim(),
        gramos: numero($('fGramos').value),
        anuncio: $('fAnuncio').value,
        agotado: $('fAgotado').checked,
        oculto: $('fOculto').checked,
        destacado: $('fDestacado').checked
    };
    if (!editando || !BASE[editando]) nuevoEstado.seccion = $('fSeccion').value === 'nubes' ? 'nubes' : undefined;

    let id = editando;
    if (!id) {
        id = `${slug(titulo)}-${Date.now().toString(36).slice(-4)}`;
        while (productsData[id]) id += 'x';
    }
    $('btnGuardar').disabled = true;
    const ok = await guardar(id, nuevoEstado, editando ? '✅ Cambios guardados' : '✨ Producto agregado a la página');
    if (ok) {
        // El costo se guarda aparte, en un lugar privado
        try { await guardarCosto(id, numero($('fCosto').value)); pintarLista(); }
        catch (err) { console.error(err); aviso('😕 El costo no se guardó (revisa permisos de Firebase)', true); }
    }
    $('btnGuardar').disabled = false;
    if (ok) cerrarEditor();
});

$('btnOriginal').addEventListener('click', async () => {
    const id = editando;
    if (!id || !confirm('¿Regresar este producto a como estaba originalmente? Se quitan tus cambios (precio, foto, agotado…).')) return;
    try {
        await fbMethods.deleteDoc(fbMethods.doc(db, 'productos', id));
        delete remotos[id];
        aplicar(remotos);
        pintarLista();
        cerrarEditor();
        aviso('↩️ Regresó a como estaba');
    } catch (err) {
        console.error(err);
        aviso('😕 No se pudo. Revisa tu internet.', true);
    }
});

$('btnBorrar').addEventListener('click', async () => {
    const id = editando;
    if (!id || !confirm(`¿Borrar "${productsData[id]?.title}" para siempre? Si solo quieres esconderlo, mejor usa "Retirado".`)) return;
    try {
        await fbMethods.deleteDoc(fbMethods.doc(db, 'productos', id));
        delete remotos[id];
        aplicar(remotos);
        pintarLista();
        cerrarEditor();
        aviso('🗑️ Producto borrado');
    } catch (err) {
        console.error(err);
        aviso('😕 No se pudo borrar. Revisa tu internet.', true);
    }
});
