// js/admin-conta.js — Pedidos y Contabilidad del Panel del Capitán (todo privado: solo el admin lo ve)
import { db, fbMethods } from '../firebase-config.js';
import { productsData } from './modules/productos.js';

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mxn = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-MX');
const ahoraISO = () => new Date().toISOString();
export const hoyCDMX = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }); // AAAA-MM-DD
const fechaBonita = (f) => {
    const d = new Date(String(f).length === 10 ? f + 'T12:00:00' : f);
    return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Mexico_City' });
};

const CATEGORIAS_GASTO = ['🛵 Envíos / transporte', '🛍️ Empaque / bolsas', '📣 Publicidad', '💳 Comisiones', '📦 Otro'];

let aviso = () => {};
let costos = {};        // { productId: costo por pieza }
let movimientos = [];   // ventas y gastos
let pedidos = [];       // pedidos de la página
let usuarios = {};      // uid → datos del cliente
let filtroPedidos = 'pendiente';
let periodo = 'mes';

/* ---------- Costos (privados, nunca salen en la página) ---------- */
export const costoDe = (id) => (Number.isFinite(costos[id]) ? costos[id] : null);
export async function guardarCosto(id, costo) {
    const ref = fbMethods.doc(db, 'admin_costos', id);
    if (costo === undefined || costo === null) {
        if (id in costos) { await fbMethods.deleteDoc(ref); delete costos[id]; }
        return;
    }
    if (costos[id] === costo) return;
    await fbMethods.setDoc(ref, { costo, actualizadoEn: ahoraISO() });
    costos[id] = costo;
}

// "MUHAMEDual 2g [Sativa/Indica ☯️]" → id del producto
function idPorTitulo(titulo) {
    const base = String(titulo).replace(/\s*\[.*\]\s*$/, '').trim();
    return Object.keys(productsData).find(id => productsData[id].title === base) || null;
}

/* ---------- Cargar todo ---------- */
export async function cargarConta(fnAviso) {
    aviso = fnAviso;
    const [snapCostos, snapMov] = await Promise.all([
        fbMethods.getDocs(fbMethods.collection(db, 'admin_costos')),
        fbMethods.getDocs(fbMethods.collection(db, 'admin_movimientos'))
    ]);
    costos = {};
    snapCostos.forEach(d => { const c = d.data().costo; if (Number.isFinite(c)) costos[d.id] = c; });
    movimientos = [];
    snapMov.forEach(d => movimientos.push({ id: d.id, ...d.data() }));
    pintarConta();
    cargarPedidos().catch(err => {
        console.error(err);
        $('listaPedidos').innerHTML = '<p class="vacio">😕 No se pudieron cargar los pedidos. Recarga la página.</p>';
    });
}

async function cargarPedidos() {
    const [snapPed, snapUsu] = await Promise.all([
        fbMethods.getDocs(fbMethods.collectionGroup(db, 'pedidos')),
        fbMethods.getDocs(fbMethods.collection(db, 'usuarios'))
    ]);
    usuarios = {};
    snapUsu.forEach(d => { usuarios[d.id] = d.data(); });
    pedidos = [];
    snapPed.forEach(d => pedidos.push({ id: d.id, ruta: d.ref.path, uid: d.ref.parent.parent?.id, ...d.data() }));
    pedidos.sort((a, b) => String(b.creadoEn).localeCompare(String(a.creadoEn)));
    pintarPedidos();
}

/* ---------- PEDIDOS ---------- */
function pintarPedidos() {
    const cuenta = (e) => pedidos.filter(p => (p.estado || 'pendiente') === e).length;
    const badge = $('badgePedidos');
    if (badge) { badge.textContent = cuenta('pendiente'); badge.hidden = !cuenta('pendiente'); }
    $('chipsPedidos').querySelectorAll('[data-e]').forEach(b => {
        b.classList.toggle('on', b.dataset.e === filtroPedidos);
        b.querySelector('b').textContent = cuenta(b.dataset.e);
    });
    const lista = pedidos.filter(p => (p.estado || 'pendiente') === filtroPedidos);
    $('listaPedidos').innerHTML = lista.length ? lista.map(p => {
        const u = usuarios[p.uid] || {};
        const nombre = u.apodo || u.nombreReal || u.email || 'Cliente';
        const tel = String(u.telefono || '').replace(/\D/g, '');
        const items = (p.items || []).map(i => `<li>${esc(i.quantity)}× ${esc(i.title)} <span>${mxn(i.price * i.quantity)}</span></li>`).join('');
        const botones = filtroPedidos === 'pendiente'
            ? `<button type="button" class="b-ok" data-ped="entregar">✅ Entregado</button>
               <button type="button" class="b-no" data-ped="cancelar">❌ Cancelar</button>`
            : `<button type="button" class="b-soft" data-ped="regresar">↩️ Regresar a pendiente</button>`;
        return `
        <article class="pedido" data-ruta="${esc(p.ruta)}">
            <div class="pedido-top">
                <div><b>${esc(nombre)}</b><small>${esc(fechaBonita(p.creadoEn))}${p.promo420 ? ' · 🔥 4:20' : ''}</small></div>
                <strong>${mxn(p.total)}</strong>
            </div>
            <ul class="pedido-items">${items}</ul>
            ${tel ? `<a class="pedido-wa" href="https://wa.me/${tel.length === 10 ? '52' + tel : tel}" target="_blank" rel="noopener">💬 WhatsApp ${esc(u.telefono)}</a>` : ''}
            <div class="pedido-acciones">${botones}</div>
        </article>`;
    }).join('') : `<p class="vacio">${filtroPedidos === 'pendiente' ? 'No hay pedidos pendientes 🛬' : 'Nada por aquí todavía'}</p>`;
}

async function accionPedido(ruta, accion, boton) {
    const p = pedidos.find(x => x.ruta === ruta);
    if (!p) return;
    const refPedido = fbMethods.doc(db, ...ruta.split('/'));
    const idVenta = `web-${p.id}`;
    boton.disabled = true;
    try {
        if (accion === 'entregar') {
            const u = usuarios[p.uid] || {};
            const items = (p.items || []).map(i => {
                const productId = idPorTitulo(i.title);
                return { productId, title: i.title, quantity: Number(i.quantity) || 1, price: Number(i.price) || 0, costo: productId ? costoDe(productId) : null };
            });
            const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
            const venta = {
                tipo: 'venta', origen: 'web', fecha: hoyCDMX(), items,
                total: Number(p.total) || subtotal, descuento: Math.max(0, subtotal - (Number(p.total) || subtotal)),
                cliente: u.apodo || u.nombreReal || u.email || '', pedidoRuta: ruta, creadoEn: ahoraISO()
            };
            await fbMethods.setDoc(fbMethods.doc(db, 'admin_movimientos', idVenta), venta);
            await fbMethods.updateDoc(refPedido, { estado: 'entregado' });
            movimientos = movimientos.filter(m => m.id !== idVenta).concat({ id: idVenta, ...venta });
            p.estado = 'entregado';
            aviso('✅ Entregado: se sumó a tus ventas y al vuelo del cliente ✈️');
        } else if (accion === 'cancelar') {
            if (!confirm('¿Cancelar este pedido? No cuenta como venta.')) { boton.disabled = false; return; }
            await fbMethods.updateDoc(refPedido, { estado: 'cancelado' });
            p.estado = 'cancelado';
            aviso('❌ Pedido cancelado');
        } else if (accion === 'regresar') {
            await fbMethods.updateDoc(refPedido, { estado: 'pendiente' });
            if (movimientos.some(m => m.id === idVenta)) {
                await fbMethods.deleteDoc(fbMethods.doc(db, 'admin_movimientos', idVenta));
                movimientos = movimientos.filter(m => m.id !== idVenta);
            }
            p.estado = 'pendiente';
            aviso('↩️ Regresó a pendientes');
        }
        pintarPedidos();
        pintarConta();
    } catch (err) {
        console.error(err);
        aviso(err.code === 'permission-denied' ? '🔒 Falta dar permiso en Firebase (reglas)' : '😕 No se pudo. Revisa tu internet.', true);
        boton.disabled = false;
    }
}

/* ---------- CONTABILIDAD ---------- */
function rangoPeriodo() {
    const hoy = hoyCDMX();
    const [y, m] = hoy.split('-').map(Number);
    const menos = (dias) => { const d = new Date(hoy + 'T12:00:00'); d.setDate(d.getDate() - dias); return d.toISOString().slice(0, 10); };
    switch (periodo) {
        case 'hoy': return [hoy, hoy];
        case 'semana': return [menos(6), hoy];
        case 'mes': return [`${y}-${String(m).padStart(2, '0')}-01`, hoy];
        case 'pasado': {
            const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
            const ultimo = new Date(py, pm, 0).getDate();
            return [`${py}-${String(pm).padStart(2, '0')}-01`, `${py}-${String(pm).padStart(2, '0')}-${ultimo}`];
        }
        default: return ['0000-00-00', '9999-12-31'];
    }
}

function calcular(lista) {
    let ventas = 0, costo = 0, gastos = 0, sinCosto = 0, numVentas = 0;
    const vendidos = {}, porCategoria = {};
    lista.forEach(m => {
        if (m.tipo === 'venta') {
            numVentas++;
            ventas += Number(m.total) || 0;
            (m.items || []).forEach(i => {
                const q = Number(i.quantity) || 0;
                if (Number.isFinite(i.costo)) costo += i.costo * q; else sinCosto++;
                const clave = i.productId ? (productsData[i.productId]?.title || i.title) : String(i.title).replace(/\s*\[.*\]\s*$/, '');
                vendidos[clave] = (vendidos[clave] || 0) + q;
            });
        } else if (m.tipo === 'gasto') {
            gastos += Number(m.monto) || 0;
            porCategoria[m.categoria || '📦 Otro'] = (porCategoria[m.categoria || '📦 Otro'] || 0) + (Number(m.monto) || 0);
        }
    });
    return { ventas, costo, gastos, ganancia: ventas - costo - gastos, sinCosto, numVentas, vendidos, porCategoria };
}

export function pintarConta() {
    if (!$('contaResumen')) return;
    const [desde, hasta] = rangoPeriodo();
    const lista = movimientos.filter(m => m.fecha >= desde && m.fecha <= hasta)
        .sort((a, b) => (b.fecha + b.creadoEn).localeCompare(a.fecha + a.creadoEn));
    const r = calcular(lista);
    $('chipsPeriodo').querySelectorAll('[data-p]').forEach(b => b.classList.toggle('on', b.dataset.p === periodo));

    $('contaResumen').innerHTML = `
        <div class="kpi"><small>Ventas (${r.numVentas})</small><b>${mxn(r.ventas)}</b></div>
        <div class="kpi"><small>Costo de lo vendido</small><b>${mxn(r.costo)}</b></div>
        <div class="kpi"><small>Gastos</small><b>${mxn(r.gastos)}</b></div>
        <div class="kpi kpi-gan ${r.ganancia < 0 ? 'neg' : ''}"><small>Ganancia</small><b>${mxn(r.ganancia)}</b></div>`;
    $('contaAviso').hidden = !r.sinCosto;
    $('contaAviso').textContent = `⚠️ ${r.sinCosto} producto(s) vendido(s) no tienen costo, así que la ganancia puede salir más alta de lo real. Ponles costo en Productos → ✏️.`;

    const top = Object.entries(r.vendidos).sort((a, b) => b[1] - a[1]).slice(0, 5);
    $('contaTop').innerHTML = top.length
        ? top.map(([t, q], i) => `<li><span>${i + 1}. ${esc(t)}</span><b>${q} pz</b></li>`).join('')
        : '<li class="tenue">Aún no hay ventas en este periodo</li>';
    const cats = Object.entries(r.porCategoria).sort((a, b) => b[1] - a[1]);
    $('contaGastosCat').innerHTML = cats.length
        ? cats.map(([c, v]) => `<li><span>${esc(c)}</span><b>${mxn(v)}</b></li>`).join('')
        : '<li class="tenue">Sin gastos en este periodo</li>';

    $('contaLista').innerHTML = lista.length ? lista.map(m => {
        const esVenta = m.tipo === 'venta';
        const detalle = esVenta
            ? (m.items || []).map(i => `${i.quantity}× ${String(i.title).replace(/\s*\[.*\]\s*$/, '')}`).join(', ')
            : (m.concepto || '');
        const extra = esVenta ? [m.origen === 'web' ? '🌐 Página' : '✍️ A mano', m.cliente].filter(Boolean).join(' · ') : (m.categoria || '');
        return `
        <div class="mov ${esVenta ? 'venta' : 'gasto'}" data-mov="${esc(m.id)}">
            <div class="mov-info">
                <b>${esc(detalle) || (esVenta ? 'Venta' : 'Gasto')}</b>
                <small>${esc(fechaBonita(m.fecha))} · ${esc(extra)}${m.nota ? ' · ' + esc(m.nota) : ''}</small>
            </div>
            <strong>${esVenta ? '+' : '−'}${mxn(esVenta ? m.total : m.monto)}</strong>
            ${m.origen === 'web' ? '' : '<button type="button" class="mov-x" data-borrar aria-label="Borrar">🗑️</button>'}
        </div>`;
    }).join('') : '<p class="vacio">Sin movimientos en este periodo</p>';
}

async function borrarMovimiento(id) {
    if (!confirm('¿Borrar este movimiento?')) return;
    try {
        await fbMethods.deleteDoc(fbMethods.doc(db, 'admin_movimientos', id));
        movimientos = movimientos.filter(m => m.id !== id);
        pintarConta();
        aviso('🗑️ Borrado');
    } catch (err) {
        console.error(err);
        aviso('😕 No se pudo borrar', true);
    }
}

// Descarga lo del periodo en un archivo que abre Excel / Numbers / Google Sheets
function descargarCSV() {
    const [desde, hasta] = rangoPeriodo();
    const lista = movimientos.filter(m => m.fecha >= desde && m.fecha <= hasta).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const filas = [['Fecha', 'Tipo', 'Detalle', 'Categoría / origen', 'Cliente', 'Monto', 'Costo', 'Nota']];
    lista.forEach(m => {
        if (m.tipo === 'venta') {
            const costo = (m.items || []).reduce((a, i) => a + (Number.isFinite(i.costo) ? i.costo * i.quantity : 0), 0);
            filas.push([m.fecha, 'Venta', (m.items || []).map(i => `${i.quantity}x ${i.title}`).join(' + '), m.origen === 'web' ? 'Página' : 'A mano', m.cliente || '', m.total, costo, m.nota || '']);
        } else {
            filas.push([m.fecha, 'Gasto', m.concepto || '', m.categoria || '', '', -Number(m.monto || 0), '', m.nota || '']);
        }
    });
    const csv = '﻿' + filas.map(f => f.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `aeroshop-contabilidad-${periodo}-${hoyCDMX()}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------- Formularios: venta a mano y gasto ---------- */
function opcionesProductos(sel = '') {
    const ids = Object.keys(productsData).sort((a, b) => productsData[a].title.localeCompare(productsData[b].title));
    return ids.map(id => `<option value="${esc(id)}"${id === sel ? ' selected' : ''}>${esc(productsData[id].title)}</option>`).join('')
        + '<option value="">Otro (escribir)</option>';
}

function lineaVentaHTML() {
    return `
    <div class="linea">
        <select class="l-prod">${opcionesProductos(Object.keys(productsData)[0])}</select>
        <input type="text" class="l-otro" placeholder="¿Qué vendiste?" hidden maxlength="80">
        <div class="linea-nums">
            <label><small>Piezas</small><input type="number" class="l-q" min="1" step="1" value="1" inputmode="numeric"></label>
            <label><small>Precio c/u</small><input type="number" class="l-p" min="0" step="1" inputmode="numeric"></label>
            <button type="button" class="l-x" aria-label="Quitar">✕</button>
        </div>
    </div>`;
}

function prepararLinea(linea) {
    const sel = linea.querySelector('.l-prod');
    const precio = linea.querySelector('.l-p');
    const llenar = () => {
        const p = productsData[sel.value];
        linea.querySelector('.l-otro').hidden = !!sel.value;
        if (p && Number.isFinite(p.price)) precio.value = p.price;
        totalVenta();
    };
    sel.addEventListener('change', llenar);
    linea.querySelectorAll('input').forEach(i => i.addEventListener('input', totalVenta));
    linea.querySelector('.l-x').addEventListener('click', () => {
        if ($('lineasVenta').children.length > 1) { linea.remove(); totalVenta(); }
    });
    llenar();
}

function totalVenta() {
    let t = 0;
    $('lineasVenta').querySelectorAll('.linea').forEach(l => {
        t += (Number(l.querySelector('.l-q').value) || 0) * (Number(l.querySelector('.l-p').value) || 0);
    });
    $('vTotal').textContent = mxn(t);
}

function abrirHoja(id) {
    $('hojaBg').classList.add('on');
    $(id).classList.add('on');
    $(id).scrollTop = 0;
}
function cerrarHojas() {
    $('hojaBg').classList.remove('on');
    document.querySelectorAll('.sheet.hoja-conta').forEach(s => s.classList.remove('on'));
}

function abrirVenta() {
    $('vFecha').value = hoyCDMX();
    $('vCliente').value = '';
    $('vNota').value = '';
    $('lineasVenta').innerHTML = lineaVentaHTML();
    prepararLinea($('lineasVenta').lastElementChild);
    abrirHoja('hojaVenta');
}

function abrirGasto() {
    $('gFecha').value = hoyCDMX();
    $('gConcepto').value = '';
    $('gMonto').value = '';
    $('gNota').value = '';
    $('gCategoria').innerHTML = CATEGORIAS_GASTO.map(c => `<option>${esc(c)}</option>`).join('');
    abrirHoja('hojaGasto');
}

async function guardarMovimiento(datos) {
    const ref = await fbMethods.addDoc(fbMethods.collection(db, 'admin_movimientos'), datos);
    movimientos.push({ id: ref.id, ...datos });
    pintarConta();
}

/* ---------- Conectar botones ---------- */
export function initConta() {
    $('chipsPedidos').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-e]');
        if (!b) return;
        filtroPedidos = b.dataset.e;
        pintarPedidos();
    });
    $('listaPedidos').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-ped]');
        if (b) accionPedido(b.closest('[data-ruta]').dataset.ruta, b.dataset.ped, b);
    });
    $('btnRecargarPedidos').addEventListener('click', () => cargarPedidos().then(() => aviso('🔄 Pedidos al día')).catch(() => aviso('😕 No se pudo recargar', true)));

    $('chipsPeriodo').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-p]');
        if (!b) return;
        periodo = b.dataset.p;
        pintarConta();
    });
    $('contaLista').addEventListener('click', (ev) => {
        if (ev.target.closest('[data-borrar]')) borrarMovimiento(ev.target.closest('[data-mov]').dataset.mov);
    });
    $('btnVenta').addEventListener('click', abrirVenta);
    $('btnGasto').addEventListener('click', abrirGasto);
    $('btnCSV').addEventListener('click', descargarCSV);
    $('hojaBg').addEventListener('click', cerrarHojas);
    document.querySelectorAll('[data-cerrar-hoja]').forEach(b => b.addEventListener('click', cerrarHojas));
    $('btnOtraLinea').addEventListener('click', () => {
        $('lineasVenta').insertAdjacentHTML('beforeend', lineaVentaHTML());
        prepararLinea($('lineasVenta').lastElementChild);
    });

    $('hojaVenta').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const items = [];
        let error = '';
        $('lineasVenta').querySelectorAll('.linea').forEach(l => {
            const id = l.querySelector('.l-prod').value;
            const title = id ? productsData[id]?.title : l.querySelector('.l-otro').value.trim();
            const quantity = Math.round(Number(l.querySelector('.l-q').value));
            const price = Number(l.querySelector('.l-p').value);
            if (!title) error = 'Escribe qué vendiste';
            else if (!(quantity > 0)) error = 'Pon cuántas piezas';
            else if (!(price >= 0) || l.querySelector('.l-p').value === '') error = 'Pon el precio';
            items.push({ productId: id || null, title, quantity, price, costo: id ? costoDe(id) : null });
        });
        if (error) { aviso(error, true); return; }
        const fecha = $('vFecha').value || hoyCDMX();
        const total = items.reduce((a, i) => a + i.price * i.quantity, 0);
        $('btnGuardarVenta').disabled = true;
        try {
            await guardarMovimiento({ tipo: 'venta', origen: 'manual', fecha, items, total, descuento: 0,
                cliente: $('vCliente').value.trim().slice(0, 60), nota: $('vNota').value.trim().slice(0, 200), creadoEn: ahoraISO() });
            cerrarHojas();
            aviso('💰 Venta registrada');
        } catch (err) {
            console.error(err);
            aviso(err.code === 'permission-denied' ? '🔒 Falta dar permiso en Firebase (reglas)' : '😕 No se guardó. Revisa tu internet.', true);
        }
        $('btnGuardarVenta').disabled = false;
    });

    $('hojaGasto').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const concepto = $('gConcepto').value.trim();
        const monto = Number($('gMonto').value);
        if (!concepto) { aviso('Escribe en qué gastaste', true); return; }
        if (!(monto > 0)) { aviso('Pon cuánto gastaste', true); return; }
        $('btnGuardarGasto').disabled = true;
        try {
            await guardarMovimiento({ tipo: 'gasto', fecha: $('gFecha').value || hoyCDMX(), concepto: concepto.slice(0, 80),
                categoria: $('gCategoria').value, monto, nota: $('gNota').value.trim().slice(0, 200), creadoEn: ahoraISO() });
            cerrarHojas();
            aviso('🧾 Gasto registrado');
        } catch (err) {
            console.error(err);
            aviso(err.code === 'permission-denied' ? '🔒 Falta dar permiso en Firebase (reglas)' : '😕 No se guardó. Revisa tu internet.', true);
        }
        $('btnGuardarGasto').disabled = false;
    });
}
