// js/admin-conta.js — Pedidos y Cuentas del Panel del Capitán (todo privado: solo el admin lo ve)
//
// IDEA GENERAL ("libreta de movimientos"):
//   Todo lo que pasa con tu dinero se anota como un MOVIMIENTO en Firebase (colección "admin_movimientos").
//   Nada se guarda "ya calculado": los saldos, la ganancia y las deudas se calculan sumando movimientos
//   cada vez que abres el panel. Así, si borras o corriges uno, todo se recalcula solo y nunca se descuadra.
//
//   Tipos de movimiento:
//     venta     → vendiste algo. Suma a tus ventas. Si te pagaron, entra dinero a efectivo o banco.
//     gasto     → gastaste (envíos, bolsas…). Resta de efectivo o banco.
//     ajuste    → contaste tu dinero real y el panel corrige la diferencia (la primera vez = tu saldo inicial).
//     traspaso  → pasaste dinero de efectivo a banco o al revés (no ganas ni pierdes).
//     prestamo  → alguien te debe (medeben) o tú debes (debo). Si hubo dinero de por medio, mueve tu saldo.
//     abono     → un pago a cuenta de un préstamo.
//     encargo   → un pedido que te hicieron por mensaje o en persona (todavía no es dinero).
//     anticipo  → te pagaron un pedido ANTES de entregarlo (entra dinero ese día).
//     compra    → inversión en mercancía. "por_comprar" = lista de pendientes (aún no mueve nada);
//                 "comprado" = ya pagaste: sale dinero (o "de tu bolsa") y suben tus piezas en mano.
//     stock     → contaste tus piezas en mano de un producto (corrige el conteo).
//     retiro    → te pagaste a ti como dueño (sale dinero del negocio, pero NO es gasto).
//     config_reparto → tus porcentajes para separar lo que vendes cada semana (el más nuevo es el que vale).
//
import { db, fbMethods } from '../firebase-config.js';
import { productsData } from './modules/productos.js';

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mxn = (n) => (Number(n) < 0 ? '-' : '') + '$' + Math.abs(Math.round(Number(n) || 0)).toLocaleString('es-MX');
const ahoraISO = () => new Date().toISOString();
export const hoyCDMX = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }); // AAAA-MM-DD
const fechaBonita = (f) => {
    const d = new Date(String(f).length === 10 ? f + 'T12:00:00' : f);
    return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Mexico_City' });
};
const sinCepa = (t) => String(t).replace(/\s*\[.*\]\s*$/, '');

const CUENTAS = { efectivo: '💵 Efectivo', banco: '🏦 Banco', bolsa: '👛 De mi bolsa', fiado: '🤝 Fiado', adelantado: '💵 Pagado antes' };
// ¿Este movimiento va en la lista de "Movimientos" de dinero? (encargos, conteos y la lista "por comprar" no)
const enLibro = (m) => !['encargo', 'stock', 'config_reparto'].includes(m.tipo) && !(m.tipo === 'compra' && m.estado !== 'comprado');
const APARTADOS = {
    dueno: { nombre: '👑 Tu pago de dueño', ejemplo: 30 },
    reinversion: { nombre: '🔁 Reinversión / crecer', ejemplo: 50 },
    ahorro: { nombre: '🐷 Ahorro / emergencias', ejemplo: 10 },
    publicidad: { nombre: '📣 Publicidad', ejemplo: 10 }
};
const CATEGORIAS_GASTO = ['🛵 Envíos / transporte', '🛍️ Empaque / bolsas', '📣 Publicidad', '💳 Comisiones', '📦 Otro'];
const COLECCION = 'admin_movimientos';

let aviso = () => {};
let costos = {};        // { productId: costo por pieza }
let movimientos = [];   // TODO: ventas, gastos, ajustes, traspasos, préstamos, abonos y encargos
let pedidosWeb = [];    // pedidos que llegan por la página (viven en usuarios/{uid}/pedidos)
let usuarios = {};      // uid → datos del cliente
let filtroPedidos = 'pendiente';
let periodo = 'mes';
let verSaldadas = false;
let stockCache = {};    // productId → piezas en mano (solo productos que ya llevas)
let semanaOffset = 0;   // 0 = esta semana, -1 = la pasada…

/* ======================================================================
   1. GUARDAR Y LEER EN FIREBASE
   ====================================================================== */
const refMov = (id) => fbMethods.doc(db, COLECCION, id);

async function nuevoMovimiento(datos, id = null) {
    const completo = { fecha: hoyCDMX(), ...datos, creadoEn: ahoraISO() };
    if (id) await fbMethods.setDoc(refMov(id), completo);
    else id = (await fbMethods.addDoc(fbMethods.collection(db, COLECCION), completo)).id;
    movimientos = movimientos.filter(m => m.id !== id).concat({ id, ...completo });
    return id;
}
async function borrarMovimientoId(id) {
    await fbMethods.deleteDoc(refMov(id));
    movimientos = movimientos.filter(m => m.id !== id);
}
async function actualizarMovimiento(id, cambios) {
    await fbMethods.updateDoc(refMov(id), cambios);
    movimientos = movimientos.map(m => m.id === id ? { ...m, ...cambios } : m);
}

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
    const base = sinCepa(titulo).trim();
    return Object.keys(productsData).find(id => productsData[id].title === base) || null;
}

export async function cargarConta(fnAviso) {
    aviso = fnAviso;
    const [snapCostos, snapMov] = await Promise.all([
        fbMethods.getDocs(fbMethods.collection(db, 'admin_costos')),
        fbMethods.getDocs(fbMethods.collection(db, COLECCION))
    ]);
    costos = {};
    snapCostos.forEach(d => { const c = d.data().costo; if (Number.isFinite(c)) costos[d.id] = c; });
    movimientos = [];
    snapMov.forEach(d => movimientos.push({ id: d.id, ...d.data() }));
    calcularStock();
    pintarConta();
    pintarPedidos();
    pintarCompras();
    cargarPedidosWeb().catch(err => {
        console.error(err);
        aviso('😕 No se cargaron los pedidos de la página', true);
    });
}

async function cargarPedidosWeb() {
    const [snapPed, snapUsu] = await Promise.all([
        fbMethods.getDocs(fbMethods.collectionGroup(db, 'pedidos')),
        fbMethods.getDocs(fbMethods.collection(db, 'usuarios'))
    ]);
    usuarios = {};
    snapUsu.forEach(d => { usuarios[d.id] = d.data(); });
    pedidosWeb = [];
    snapPed.forEach(d => pedidosWeb.push({ id: d.id, ruta: d.ref.path, uid: d.ref.parent.parent?.id, ...d.data() }));
    pintarPedidos();
    pintarCompras();
}

/* ======================================================================
   2. CÁLCULOS (todo sale de sumar movimientos)
   ====================================================================== */
// ¿Cuánto dinero tengo en efectivo y en banco?
function calcularSaldos() {
    const s = { efectivo: 0, banco: 0 };
    const mover = (cuenta, cantidad) => { if (cuenta in s) s[cuenta] += Number(cantidad) || 0; };
    let iniciado = false;
    movimientos.forEach(m => {
        switch (m.tipo) {
            case 'venta': mover(m.cuenta, (Number(m.total) || 0) - (Number(m.anticipo) || 0)); break; // fiado o ya pagado antes: no entra nada nuevo
            case 'anticipo': mover(m.cuenta, m.monto); break;
            case 'compra': if (m.estado === 'comprado') mover(m.cuenta, -m.total); break;
            case 'retiro': mover(m.cuenta, -m.monto); break;                                         // te pagaste: sale, pero no es gasto            // "de mi bolsa" no toca el dinero del negocio
            case 'gasto': mover(m.cuenta, -m.monto); break;
            case 'ajuste': iniciado = true; mover(m.cuenta, m.monto); break;
            case 'traspaso': mover(m.de, -m.monto); mover(m.a, m.monto); break;
            case 'prestamo': mover(m.cuenta, m.deuda === 'debo' ? m.monto : -m.monto); break; // me prestan: entra / presto: sale
            case 'abono': mover(m.cuenta, m.deuda === 'debo' ? -m.monto : m.monto); break;    // yo pago: sale / me pagan: entra
        }
    });
    return { ...s, total: s.efectivo + s.banco, iniciado };
}

// Préstamos con lo que ya se abonó y lo que falta
function calcularDeudas() {
    return movimientos.filter(m => m.tipo === 'prestamo').map(p => {
        const abonos = movimientos.filter(a => a.tipo === 'abono' && a.deudaId === p.id);
        const pagado = abonos.reduce((t, a) => t + (Number(a.monto) || 0), 0);
        const falta = Math.max(0, (Number(p.monto) || 0) - pagado);
        return { ...p, abonos, pagado, falta, saldada: falta <= 0 };
    }).sort((a, b) => String(b.fecha + b.creadoEn).localeCompare(String(a.fecha + a.creadoEn)));
}

// Piezas en mano: suben con compras, bajan con ventas, y un conteo las deja en el número exacto.
// Un producto empieza a contarse desde su primer conteo o su primera compra.
function calcularStock() {
    const eventos = [];
    movimientos.forEach(m => {
        if (m.tipo === 'compra' && m.estado === 'comprado') (m.items || []).forEach(i => { if (i.productId) eventos.push({ t: m.compradoEn || m.creadoEn, id: i.productId, mas: Number(i.quantity) || 0 }); });
        else if (m.tipo === 'venta') (m.items || []).forEach(i => { if (i.productId) eventos.push({ t: m.creadoEn, id: i.productId, mas: -(Number(i.quantity) || 0) }); });
        else if (m.tipo === 'stock' && m.productId) eventos.push({ t: m.creadoEn, id: m.productId, exacto: Number(m.cantidad) || 0 });
    });
    eventos.sort((a, b) => String(a.t).localeCompare(String(b.t)));
    const s = {};
    eventos.forEach(e => {
        const x = s[e.id] || (s[e.id] = { n: 0, activo: false });
        if ('exacto' in e) { x.n = e.exacto; x.activo = true; }
        else if (e.mas > 0) { x.n += e.mas; x.activo = true; }
        else if (x.activo) x.n += e.mas;
    });
    stockCache = {};
    Object.entries(s).forEach(([id, x]) => { if (x.activo) stockCache[id] = x.n; });
}
export const stockDe = (id) => (id in stockCache ? stockCache[id] : null);

/* ---------- Reparto semanal (lunes a domingo) ---------- */
function semana(offset = 0) {
    const hoy = new Date(hoyCDMX() + 'T12:00:00');
    const dia = (hoy.getDay() + 6) % 7;                 // lunes = 0 … domingo = 6
    const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - dia + offset * 7);
    const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
    const f = (d) => d.toISOString().slice(0, 10);
    return [f(lunes), f(domingo)];
}
const configsReparto = () => movimientos.filter(m => m.tipo === 'config_reparto')
    .sort((a, b) => String(a.creadoEn).localeCompare(String(b.creadoEn)));
// Porcentajes que valían en una fecha (si los cambiaste, las semanas viejas usan los de antes)
function porcentajesEn(fecha) {
    const lista = configsReparto();
    if (!lista.length) return null;
    const vigente = lista.filter(c => String(c.creadoEn).slice(0, 10) <= fecha).pop() || lista[0];
    return vigente.porcentajes;
}
// Cuánto te ha tocado como dueño en total (desde que pusiste porcentajes) y cuánto ya te pagaste
function cuentaDueno() {
    const lista = configsReparto();
    if (!lista.length) return { asignado: 0, pagado: 0, falta: 0 };
    const desde = lunesDe(String(lista[0].creadoEn).slice(0, 10)); // cuenta desde el lunes de la semana en que pusiste porcentajes
    let asignado = 0;
    movimientos.filter(m => m.tipo === 'venta' && m.fecha >= desde)
        .forEach(m => { asignado += (Number(m.total) || 0) * ((porcentajesEn(m.fecha)?.dueno || 0) / 100); });
    const pagado = movimientos.filter(m => m.tipo === 'retiro').reduce((t, m) => t + (Number(m.monto) || 0), 0);
    return { asignado, pagado, falta: Math.max(0, asignado - pagado) };
}
function lunesDe(fecha) {
    const d = new Date(fecha + 'T12:00:00');
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
}

const anticiposDe = (ref) => movimientos.filter(m => m.tipo === 'anticipo' && m.pedidoRef === ref);
const pagadoDe = (ref) => anticiposDe(ref).reduce((t, a) => t + (Number(a.monto) || 0), 0);

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
            return [`${py}-${String(pm).padStart(2, '0')}-01`, `${py}-${String(pm).padStart(2, '0')}-${new Date(py, pm, 0).getDate()}`];
        }
        default: return ['0000-00-00', '9999-12-31'];
    }
}

// Ganancia del periodo: SOLO ventas y gastos (préstamos y ajustes no son ganancia)
function calcularGanancia(lista) {
    let ventas = 0, costo = 0, gastos = 0, sinCosto = 0, numVentas = 0;
    const vendidos = {}, porCategoria = {};
    lista.forEach(m => {
        if (m.tipo === 'venta') {
            numVentas++;
            ventas += Number(m.total) || 0;
            (m.items || []).forEach(i => {
                const q = Number(i.quantity) || 0;
                if (Number.isFinite(i.costo)) costo += i.costo * q; else sinCosto++;
                const clave = i.productId ? (productsData[i.productId]?.title || i.title) : sinCepa(i.title);
                vendidos[clave] = (vendidos[clave] || 0) + q;
            });
        } else if (m.tipo === 'gasto') {
            const cat = m.categoria || '📦 Otro';
            gastos += Number(m.monto) || 0;
            porCategoria[cat] = (porCategoria[cat] || 0) + (Number(m.monto) || 0);
        }
    });
    return { ventas, costo, gastos, ganancia: ventas - costo - gastos, sinCosto, numVentas, vendidos, porCategoria };
}

/* ======================================================================
   3. DIBUJAR LA PESTAÑA CUENTAS
   ====================================================================== */
export function pintarConta() {
    if (!$('contaResumen')) return;
    pintarDinero();
    pintarReparto();
    pintarDeudas();

    const [desde, hasta] = rangoPeriodo();
    const lista = movimientos.filter(m => enLibro(m) && m.fecha >= desde && m.fecha <= hasta)
        .sort((a, b) => String(b.fecha + b.creadoEn).localeCompare(String(a.fecha + a.creadoEn)));
    const r = calcularGanancia(lista);
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

    $('contaLista').innerHTML = lista.length ? lista.map(movimientoHTML).join('') : '<p class="vacio">Sin movimientos en este periodo</p>';
}

function pintarDinero() {
    const s = calcularSaldos();
    $('contaDinero').innerHTML = `
        <h2>💰 Tu dinero ahorita</h2>
        <div class="dinero-grid">
            <div><small>${CUENTAS.efectivo}</small><b>${mxn(s.efectivo)}</b></div>
            <div><small>${CUENTAS.banco}</small><b>${mxn(s.banco)}</b></div>
        </div>
        <div class="dinero-total"><span>Total</span><b>${mxn(s.total)}</b></div>
        ${bolsaTotal() ? `<p class="dinero-nota" style="margin-bottom:6px">👛 Has metido de tu bolsa: <b>${mxn(bolsaTotal())}</b></p>` : ''}
        <p class="dinero-nota">${s.iniciado
            ? 'Se mueve solo con tus ventas, gastos y préstamos. Si no cuadra con lo que tienes, toca "Contar mi dinero".'
            : '👋 Empieza diciéndole al panel cuánto tienes hoy. Desde ahí se mueve solo.'}</p>
        <div class="dinero-botones">
            ${s.iniciado
                ? '<button type="button" data-dinero="contar">🧮 Contar mi dinero</button><button type="button" data-dinero="mover">🔁 Efectivo ⇄ Banco</button>'
                : '<button type="button" class="b-empezar" data-dinero="contar">🧮 Empezar: ¿cuánto tengo hoy?</button>'}
        </div>`;
}

function pintarReparto() {
    const caja = $('contaReparto');
    if (!caja) return;
    const [ini, fin] = semana(semanaOffset);
    const pct = porcentajesEn(fin);
    const ventasSem = movimientos.filter(m => m.tipo === 'venta' && m.fecha >= ini && m.fecha <= fin);
    const vendido = ventasSem.reduce((t, m) => t + (Number(m.total) || 0), 0);
    const r = calcularGanancia(movimientos.filter(m => (m.tipo === 'venta' || m.tipo === 'gasto') && m.fecha >= ini && m.fecha <= fin));
    const pagadoSem = movimientos.filter(m => m.tipo === 'retiro' && m.fecha >= ini && m.fecha <= fin).reduce((t, m) => t + (Number(m.monto) || 0), 0);
    const nombreSemana = semanaOffset === 0 ? 'Esta semana' : semanaOffset === -1 ? 'Semana pasada' : `Semana del ${fechaBonita(ini)}`;
    const total = cuentaDueno();

    if (!pct) {
        caja.innerHTML = `
            <div class="reparto">
                <h2>👑 Reparto semanal</h2>
                <p class="tenue" style="margin:0 0 12px">Cada semana el panel separa lo que vendiste en tus apartados: tu pago de dueño, reinversión, ahorro y publicidad. Primero pon tus porcentajes.</p>
                <button type="button" class="btn btn-main full" data-reparto="config">⚙️ Poner mis porcentajes</button>
            </div>`;
        return;
    }
    const monto = (k) => vendido * (Number(pct[k]) || 0) / 100;
    const reinv = monto('reinversion');
    caja.innerHTML = `
        <div class="reparto">
            <div class="reparto-head">
                <button type="button" class="mini" data-reparto="antes" aria-label="Semana anterior">◀</button>
                <div><h2>👑 ${esc(nombreSemana)}</h2><small>${esc(fechaBonita(ini))} – ${esc(fechaBonita(fin))}</small></div>
                <button type="button" class="mini" data-reparto="despues" aria-label="Semana siguiente" ${semanaOffset >= 0 ? 'disabled' : ''}>▶</button>
            </div>
            <div class="reparto-vendido"><span>Vendiste</span><b>${mxn(vendido)}</b></div>
            <div class="reparto-dueno">
                <small>${APARTADOS.dueno.nombre} (${pct.dueno}%)</small>
                <b>${mxn(monto('dueno'))}</b>
                <span>${pagadoSem ? `Ya te pagaste ${mxn(pagadoSem)} esta semana` : 'Aún no te pagas esta semana'}</span>
            </div>
            <div class="reparto-grid">
                ${['reinversion', 'ahorro', 'publicidad'].map(k => `
                    <div><small>${APARTADOS[k].nombre} (${pct[k]}%)</small><b>${mxn(monto(k))}</b></div>`).join('')}
            </div>
            ${vendido && reinv < r.costo ? `<p class="aviso-conta" style="margin:10px 0 0">⚠️ Para resurtir lo que vendiste necesitas <b>${mxn(r.costo)}</b>, y tu reinversión de esta semana es <b>${mxn(reinv)}</b>. Súbele a Reinversión o el stock se te va acabando.</p>` : ''}
            ${vendido ? `<p class="tenue reparto-nota">Ganancia real de la semana (ventas − costo − gastos): <b>${mxn(r.ganancia)}</b></p>` : ''}
            <div class="reparto-total">
                <div><small>Te ha tocado como dueño</small><b>${mxn(total.asignado)}</b></div>
                <div><small>Ya te pagaste</small><b>${mxn(total.pagado)}</b></div>
                <div><small>Te falta pagarte</small><b>${mxn(total.falta)}</b></div>
            </div>
            <div class="conta-botones" style="margin:12px 0 0">
                <button type="button" class="btn b-venta" data-reparto="pagarme">👑 Me pagué</button>
                <button type="button" class="btn btn-soft" data-reparto="config">⚙️ Porcentajes</button>
            </div>
        </div>`;
}

// Tus porcentajes (deben sumar 100%)
function abrirPorcentajes() {
    const actual = porcentajesEn(hoyCDMX()) || {};
    abrirHoja('⚙️ Mis porcentajes', `
        <p class="ayuda" style="margin-top:0">De todo lo que vendas cada semana, ¿cuánto va a cada apartado? Tienen que sumar 100%.</p>
        ${Object.entries(APARTADOS).map(([k, a]) => `
            <div class="conteo"><span>${a.nombre}</span>
            <input type="number" min="0" max="100" step="1" inputmode="numeric" data-pct="${k}" value="${actual[k] ?? ''}" placeholder="${a.ejemplo}"></div>`).join('')}
        <div class="total-venta"><span>Suma</span><span id="pctSuma">0%</span></div>
        <p class="ayuda">💡 Ojo: como se reparte <b>todo lo que vendes</b>, la Reinversión tiene que alcanzar para volver a comprar lo vendido. Si una pieza te cuesta $185 y la vendes en $250, ¡eso es 74%! El panel te avisa si no alcanza.</p>`,
    async () => {
        const porcentajes = {};
        let suma = 0;
        $('hoja').querySelectorAll('[data-pct]').forEach(i => { const n = Math.round(Number(i.value) || 0); porcentajes[i.dataset.pct] = n; suma += n; });
        if (suma !== 100) return `Tienen que sumar 100% (ahorita suman ${suma}%)`;
        await nuevoMovimiento({ tipo: 'config_reparto', porcentajes });
        return '⚙️ Porcentajes guardados';
    });
    const sumar = () => {
        let t = 0;
        $('hoja').querySelectorAll('[data-pct]').forEach(i => { t += Number(i.value) || 0; });
        $('pctSuma').textContent = `${t}%`;
        $('pctSuma').style.color = t === 100 ? 'var(--ok)' : 'var(--bad)';
    };
    $('hoja').querySelectorAll('[data-pct]').forEach(i => i.addEventListener('input', sumar));
    sumar();
}

// "Me pagué": sacas tu parte de dueño (sale del dinero del negocio, no es gasto)
function abrirPagarme() {
    const { falta } = cuentaDueno();
    abrirHoja('👑 Me pagué', `
        <p class="ayuda" style="margin-top:0">${falta ? `Te falta pagarte <b>${mxn(falta)}</b> de lo que te ha tocado.` : 'Registra cuánto sacaste para ti.'}</p>
        <div class="dos">
            ${campo('¿Cuánto?', `<input type="number" id="rMonto" min="0" step="1" inputmode="numeric" value="${falta ? Math.floor(falta) : ''}">`)}
            ${campo('¿De dónde lo sacaste?', selectCuenta('rCuenta'))}
        </div>
        ${campo('Fecha', `<input type="date" id="rFecha" value="${hoyCDMX()}">`)}
        ${campo('Nota <em>(opcional)</em>', '<input type="text" id="rNota" maxlength="80" placeholder="Ej. mi pago de la semana">')}`,
    async () => {
        const monto = numero('rMonto');
        if (!(monto > 0)) return 'Pon cuánto te pagaste';
        await nuevoMovimiento({ tipo: 'retiro', apartado: 'dueno', cuenta: $('rCuenta').value, monto,
            fecha: $('rFecha').value || hoyCDMX(), nota: $('rNota').value.trim().slice(0, 80) });
        return '👑 Listo, te pagaste';
    }, '💾 Registrar');
}

const bolsaTotal = () => movimientos.filter(m => m.tipo === 'compra' && m.estado === 'comprado' && m.cuenta === 'bolsa').reduce((t, m) => t + (Number(m.total) || 0), 0);

function pintarDeudas() {
    const deudas = calcularDeudas();
    const abiertas = deudas.filter(d => !d.saldada);
    const medeben = abiertas.filter(d => d.deuda === 'medeben').reduce((t, d) => t + d.falta, 0);
    const debo = abiertas.filter(d => d.deuda === 'debo').reduce((t, d) => t + d.falta, 0);
    const lista = verSaldadas ? deudas : abiertas;
    const saldadas = deudas.length - abiertas.length;
    $('contaDeudas').innerHTML = `
        <div class="deuda-resumen">
            <div class="kpi medeben"><small>Me deben</small><b>${mxn(medeben)}</b></div>
            <div class="kpi debo"><small>Yo debo</small><b>${mxn(debo)}</b></div>
        </div>
        ${lista.length ? lista.map(deudaHTML).join('') : '<p class="vacio" style="padding:14px 0">Sin préstamos pendientes 🙌</p>'}
        ${saldadas ? `<button type="button" class="ver-saldadas" data-ver-saldadas>${verSaldadas ? 'Ocultar' : 'Ver'} ${saldadas} ya pagado(s)</button>` : ''}`;
}

function deudaHTML(d) {
    const pct = d.monto ? Math.min(100, Math.round(d.pagado / d.monto * 100)) : 0;
    const quien = d.deuda === 'debo' ? `Le debo a ${d.persona}` : `${d.persona} me debe`;
    const ligadoAVenta = !!d.ventaId;
    return `
    <div class="deuda ${d.deuda}" data-deuda="${esc(d.id)}">
        <div class="deuda-top">
            <div><b>${esc(quien)}</b><small>${esc(d.concepto || '')}${d.fechaLimite ? ' · paga antes del ' + esc(fechaBonita(d.fechaLimite)) : ''}</small></div>
            <strong>${d.saldada ? '✅ Pagado' : 'Falta ' + mxn(d.falta)}</strong>
        </div>
        <div class="barra"><i style="width:${pct}%"></i></div>
        <small class="tenue">Abonado ${mxn(d.pagado)} de ${mxn(d.monto)} · desde ${esc(fechaBonita(d.fecha))}</small>
        <div class="deuda-acciones" style="margin-top:8px">
            ${d.saldada ? '' : `<button type="button" class="b-abono" data-deuda-accion="abono">＋ ${d.deuda === 'debo' ? 'Pagué un abono' : 'Me abonaron'}</button>`}
            ${ligadoAVenta ? '' : '<button type="button" data-deuda-accion="borrar" aria-label="Borrar préstamo">🗑️</button>'}
        </div>
    </div>`;
}

function movimientoHTML(m) {
    let titulo = '', detalle = '', monto = 0, clase = 'neutro', signo = '';
    const donde = m.cuenta ? CUENTAS[m.cuenta] : '';
    switch (m.tipo) {
        case 'venta':
            titulo = (m.items || []).map(i => `${i.quantity}× ${sinCepa(i.title)}`).join(', ') || 'Venta';
            detalle = [m.origen === 'web' ? '🌐 Página' : m.origen === 'encargo' ? '✍️ Encargo' : '✍️ A mano', donde, m.anticipo ? `adelantó ${mxn(m.anticipo)}` : '', m.cliente].filter(Boolean).join(' · ');
            monto = m.total; clase = 'venta'; signo = '+'; break;
        case 'gasto':
            titulo = m.concepto || 'Gasto'; detalle = [m.categoria, donde].filter(Boolean).join(' · ');
            monto = m.monto; clase = 'gasto'; signo = '−'; break;
        case 'ajuste':
            titulo = `🧮 Conteo de ${donde || 'dinero'}`; detalle = `Contaste ${mxn(m.saldoReal)}`;
            monto = Math.abs(m.monto); signo = m.monto >= 0 ? '+' : '−'; break;
        case 'traspaso':
            titulo = `🔁 ${CUENTAS[m.de]} → ${CUENTAS[m.a]}`; monto = m.monto; break;
        case 'prestamo':
            titulo = m.deuda === 'debo' ? `🤝 Me prestó ${m.persona}` : `🤝 Le presté / fié a ${m.persona}`;
            detalle = [m.concepto, donde || 'sin dinero de por medio'].filter(Boolean).join(' · ');
            monto = m.monto; signo = m.cuenta ? (m.deuda === 'debo' ? '+' : '−') : ''; break;
        case 'retiro':
            titulo = '👑 Me pagué (dueño)'; detalle = donde;
            monto = m.monto; signo = '−'; break;
        case 'anticipo':
            titulo = `💵 Pago adelantado de ${m.cliente || 'cliente'}`; detalle = donde;
            monto = m.monto; clase = 'venta'; signo = '+'; break;
        case 'compra':
            titulo = '🛒 ' + ((m.items || []).map(i => `${i.quantity}× ${sinCepa(i.title)}`).join(', ') || 'Compra de mercancía');
            detalle = donde; monto = m.total; signo = m.cuenta === 'bolsa' ? '' : '−'; break;
        case 'abono':
            titulo = m.deuda === 'debo' ? `💸 Le aboné a ${m.persona}` : `💸 Me abonó ${m.persona}`;
            detalle = donde; monto = m.monto; signo = m.deuda === 'debo' ? '−' : '+'; break;
    }
    // Lo que viene de Pedidos se corrige desde Pedidos; los fiados ligados a una venta, también
    const sePuedeBorrar = !(m.tipo === 'venta' && (m.origen === 'web' || m.origen === 'encargo')) && !(m.tipo === 'prestamo' && m.ventaId);
    return `
    <div class="mov ${clase}" data-mov="${esc(m.id)}">
        <div class="mov-info">
            <b>${esc(titulo)}</b>
            <small>${esc(fechaBonita(m.fecha))}${detalle ? ' · ' + esc(detalle) : ''}${m.nota ? ' · ' + esc(m.nota) : ''}</small>
        </div>
        <strong>${signo}${mxn(monto)}</strong>
        ${sePuedeBorrar ? '<button type="button" class="mov-x" data-borrar aria-label="Borrar">🗑️</button>' : ''}
    </div>`;
}

/* ======================================================================
   4. PEDIDOS (de la página + encargos)
   ====================================================================== */
// Junta los pedidos de la página y los encargos en una sola lista con la misma forma
function todosLosPedidos() {
    const web = pedidosWeb.map(p => {
        const u = usuarios[p.uid] || {};
        return { clave: 'web:' + p.ruta, origen: 'web', id: p.id, ruta: p.ruta, nombre: u.apodo || u.nombreReal || u.email || 'Cliente',
            telefono: u.telefono || '', items: p.items || [], total: Number(p.total) || 0, estado: p.estado || 'pendiente',
            creadoEn: p.creadoEn, promo420: p.promo420 };
    });
    const encargos = movimientos.filter(m => m.tipo === 'encargo').map(e => ({
        clave: 'enc:' + e.id, origen: 'encargo', id: e.id, nombre: e.cliente || 'Cliente', telefono: e.telefono || '',
        items: e.items || [], total: Number(e.total) || 0, estado: e.estado || 'pendiente', creadoEn: e.creadoEn, nota: e.nota
    }));
    const todos = [...web, ...encargos];
    todos.forEach(p => { p.pagado = pagadoDe(idVenta(p)); });
    return todos.sort((a, b) => String(b.creadoEn).localeCompare(String(a.creadoEn)));
}

function pintarPedidos() {
    if (!$('listaPedidos')) return;
    const todos = todosLosPedidos();
    const cuenta = (e) => todos.filter(p => p.estado === e).length;
    const badge = $('badgePedidos');
    if (badge) { badge.textContent = cuenta('pendiente'); badge.hidden = !cuenta('pendiente'); }
    $('chipsPedidos').querySelectorAll('[data-e]').forEach(b => {
        b.classList.toggle('on', b.dataset.e === filtroPedidos);
        b.querySelector('b').textContent = cuenta(b.dataset.e);
    });
    const lista = todos.filter(p => p.estado === filtroPedidos);
    $('listaPedidos').innerHTML = lista.length ? lista.map(p => {
        const tel = String(p.telefono).replace(/\D/g, '');
        const items = p.items.map(i => `<li>${esc(i.quantity)}× ${esc(i.title)} <span>${mxn(i.price * i.quantity)}</span></li>`).join('');
        const venta = movimientos.find(m => m.id === idVenta(p));
        const comoPago = venta ? (venta.cuenta === 'fiado' ? '🤝 Quedó a deber' : venta.cuenta ? CUENTAS[venta.cuenta] : '') : '';
        const falta = Math.max(0, p.total - p.pagado);
        const botones = p.estado === 'pendiente'
            ? `${falta > 0 ? `<button type="button" class="b-adelanto" data-ped="adelanto">💵 Ya me pagó${p.pagado ? ' otra parte' : ''}</button>` : ''}
               <button type="button" class="b-ok" data-ped="entregar">✅ Entregado</button>
               <button type="button" class="b-no" data-ped="cancelar">❌ Cancelar</button>`
            : `<button type="button" class="b-soft" data-ped="regresar">↩️ Regresar a pendiente</button>`;
        return `
        <article class="pedido" data-clave="${esc(p.clave)}">
            <div class="pedido-top">
                <div><b>${esc(p.nombre)}</b>${p.origen === 'encargo' ? '<span class="tag-enc">✍️ Encargo</span>' : ''}
                    <small>${esc(fechaBonita(p.creadoEn))}${p.promo420 ? ' · 🔥 4:20' : ''}${comoPago ? ' · ' + esc(comoPago) : ''}</small></div>
                <strong>${mxn(p.total)}</strong>
            </div>
            <ul class="pedido-items">${items}</ul>
            ${p.pagado ? `<span class="adelanto">💵 Pagado por adelantado ${mxn(p.pagado)}${falta > 0 ? ` · falta ${mxn(falta)}` : ' · completo ✅'}</span>` : ''}
            ${p.nota ? `<p class="pedido-nota">📝 ${esc(p.nota)}</p>` : ''}
            ${tel ? `<a class="pedido-wa" href="https://wa.me/${tel.length === 10 ? '52' + tel : tel}" target="_blank" rel="noopener">💬 WhatsApp ${esc(p.telefono)}</a>` : ''}
            <div class="pedido-acciones">${botones}</div>
        </article>`;
    }).join('') : `<p class="vacio">${filtroPedidos === 'pendiente' ? 'No hay pedidos pendientes 🛬' : 'Nada por aquí todavía'}</p>`;
}

const idVenta = (p) => (p.origen === 'web' ? `web-${p.id}` : `enc-${p.id}`);
const idFiado = (p) => `fiado-${idVenta(p)}`;

async function cambiarEstadoPedido(p, estado) {
    if (p.origen === 'web') await fbMethods.updateDoc(fbMethods.doc(db, ...p.ruta.split('/')), { estado });
    else await actualizarMovimiento(p.id, { estado });
    const w = pedidosWeb.find(x => x.ruta === p.ruta);
    if (w) w.estado = estado;
}

// Entregar = registrar la venta (+ préstamo si quedó a deber) y marcar el pedido
async function entregarPedido(p, cuenta) {
    const items = p.items.map(i => {
        const productId = i.productId || idPorTitulo(i.title);
        return { productId, title: i.title, quantity: Number(i.quantity) || 1, price: Number(i.price) || 0, costo: productId ? costoDe(productId) : null };
    });
    const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
    const total = p.total || subtotal;
    const anticipo = Math.min(total, pagadoDe(idVenta(p)));   // lo que ya te habían pagado antes
    await nuevoMovimiento({
        tipo: 'venta', origen: p.origen, cuenta, items, total, anticipo, descuento: Math.max(0, subtotal - total),
        cliente: p.nombre, ...(p.origen === 'web' ? { pedidoRuta: p.ruta } : { encargoId: p.id })
    }, idVenta(p));
    if (cuenta === 'fiado') {
        await nuevoMovimiento({
            tipo: 'prestamo', deuda: 'medeben', persona: p.nombre, cuenta: null, monto: total - anticipo,
            concepto: 'Pedido: ' + items.map(i => `${i.quantity}× ${sinCepa(i.title)}`).join(', ').slice(0, 120), ventaId: idVenta(p)
        }, idFiado(p));
    }
    await cambiarEstadoPedido(p, 'entregado');
}

async function regresarPedido(p) {
    const fiado = movimientos.find(m => m.id === idFiado(p));
    if (fiado && movimientos.some(a => a.tipo === 'abono' && a.deudaId === fiado.id)) {
        aviso('Ese pedido ya tiene abonos. Bórralos primero en Cuentas → Movimientos.', true);
        return false;
    }
    if (fiado) await borrarMovimientoId(fiado.id);
    if (movimientos.some(m => m.id === idVenta(p))) await borrarMovimientoId(idVenta(p));
    await cambiarEstadoPedido(p, 'pendiente');
    return true;
}

async function accionPedido(clave, accion, boton) {
    const p = todosLosPedidos().find(x => x.clave === clave);
    if (!p) return;
    try {
        if (accion === 'adelanto') { abrirAdelanto(p); return; }
        if (accion === 'entregar') {
            if (p.total - p.pagado > 0) { preguntarComoPago(p); return; }
            // Ya estaba pagado completo: se entrega directo
            boton.disabled = true;
            await entregarPedido(p, 'adelantado');
            aviso('✅ Entregado (ya estaba pagado) 💰');
            refrescar();
            return;
        }
        boton.disabled = true;
        if (accion === 'cancelar') {
            const pregunta = p.pagado
                ? `¿Cancelar este pedido? Ya te había pagado ${mxn(p.pagado)}: se quita de tu saldo (como si se lo regresaras).`
                : '¿Cancelar este pedido? No cuenta como venta.';
            if (!confirm(pregunta)) { boton.disabled = false; return; }
            for (const a of anticiposDe(idVenta(p))) await borrarMovimientoId(a.id);
            await cambiarEstadoPedido(p, 'cancelado');
            aviso('❌ Pedido cancelado');
        } else if (accion === 'regresar') {
            if (await regresarPedido(p)) aviso('↩️ Regresó a pendientes');
        }
        refrescar();
    } catch (err) {
        console.error(err);
        aviso(err.code === 'permission-denied' ? '🔒 Firebase no dio permiso' : '😕 No se pudo. Revisa tu internet.', true);
        boton.disabled = false;
    }
}

function refrescar() {
    calcularStock();
    pintarPedidos();
    pintarCompras();
    pintarConta();
    document.dispatchEvent(new CustomEvent('conta-cambio'));
}

/* ======================================================================
   5. FORMULARIOS (una sola "hoja" que cambia según lo que vas a anotar)
   ====================================================================== */
let alGuardar = null;
function abrirHoja(titulo, cuerpoHTML, guardar, textoBoton = '💾 Guardar') {
    const hoja = $('hoja');
    hoja.innerHTML = `
        <div class="sheet-head"><h2>${titulo}</h2><button type="button" class="x" data-cerrar-hoja aria-label="Cerrar">✕</button></div>
        ${cuerpoHTML}
        ${guardar ? `<div class="sheet-pie"><button type="submit" class="btn btn-main" id="hojaGuardar">${textoBoton}</button></div>` : ''}`;
    alGuardar = guardar;
    $('hojaBg').classList.add('on');
    hoja.classList.add('on');
    hoja.scrollTop = 0;
}
function cerrarHoja() {
    $('hojaBg').classList.remove('on');
    $('hoja').classList.remove('on');
    alGuardar = null;
}

const campo = (etiqueta, html) => `<label class="campo"><span>${etiqueta}</span>${html}</label>`;
const selectCuenta = (id, extra = '', elegido = 'efectivo') => `<select id="${id}"><option value="efectivo"${elegido === 'efectivo' ? ' selected' : ''}>${CUENTAS.efectivo}</option><option value="banco"${elegido === 'banco' ? ' selected' : ''}>${CUENTAS.banco}</option>${extra}</select>`;
const numero = (id) => { const v = $(id).value; const n = Number(v); return v !== '' && Number.isFinite(n) ? n : NaN; };

/* --- Renglones de productos (venta a mano y encargo) --- */
function opcionesProductos(sel = '') {
    const ids = Object.keys(productsData).filter(id => !productsData[id].oculto)
        .sort((a, b) => productsData[a].title.localeCompare(productsData[b].title));
    return ids.map(id => `<option value="${esc(id)}"${id === sel ? ' selected' : ''}>${esc(productsData[id].title)}</option>`).join('')
        + '<option value="">Otro (escribir)</option>';
}
const lineaHTML = (modo = 'precio', sel = Object.keys(productsData)[0]) => `
    <div class="linea">
        <select class="l-prod">${opcionesProductos(sel)}</select>
        <input type="text" class="l-otro" placeholder="¿Qué producto?" hidden maxlength="80">
        <div class="linea-nums">
            <label><small>Piezas</small><input type="number" class="l-q" min="1" step="1" value="1" inputmode="numeric"></label>
            <label><small>${modo === 'costo' ? 'Costo c/u' : 'Precio c/u'}</small><input type="number" class="l-p" min="0" step="1" inputmode="numeric"></label>
            <button type="button" class="l-x" aria-label="Quitar">✕</button>
        </div>
    </div>`;
const bloqueProductos = () => `
    <div id="lineas"></div>
    <button type="button" class="btn btn-soft full" id="btnOtraLinea">＋ Otro producto</button>
    <div class="total-venta"><span>Total</span><span id="lTotal">$0</span></div>`;

// modo "precio" = lo que cobras (ventas, encargos) · modo "costo" = lo que te cuesta (compras)
function activarLineas(modo = 'precio', iniciales = []) {
    const cont = $('lineas');
    const total = () => {
        let t = 0;
        cont.querySelectorAll('.linea').forEach(l => { t += (Number(l.querySelector('.l-q').value) || 0) * (Number(l.querySelector('.l-p').value) || 0); });
        $('lTotal').textContent = mxn(t);
    };
    const agregar = (inicial = null) => {
        const elegido = inicial ? (inicial.productId || '') : Object.keys(productsData)[0];
        cont.insertAdjacentHTML('beforeend', lineaHTML(modo, elegido));
        const linea = cont.lastElementChild;
        const sel = linea.querySelector('.l-prod');
        const llenar = () => {
            const p = productsData[sel.value];
            linea.querySelector('.l-otro').hidden = !!sel.value;
            const sugerido = modo === 'costo' ? costoDe(sel.value) : p?.price;
            linea.querySelector('.l-p').value = Number.isFinite(sugerido) ? sugerido : '';
            total();
        };
        sel.addEventListener('change', llenar);
        linea.querySelectorAll('input').forEach(i => i.addEventListener('input', total));
        linea.querySelector('.l-x').addEventListener('click', () => { if (cont.children.length > 1) { linea.remove(); total(); } });
        llenar();
        if (inicial) {
            if (!inicial.productId) linea.querySelector('.l-otro').value = inicial.title || '';
            linea.querySelector('.l-q').value = inicial.quantity || 1;
            const v = modo === 'costo' ? inicial.costo : inicial.price;
            if (Number.isFinite(v)) linea.querySelector('.l-p').value = v;
            total();
        }
    };
    $('btnOtraLinea').addEventListener('click', () => agregar());
    if (iniciales.length) iniciales.forEach(agregar); else agregar();
}

function leerLineas(modo = 'precio') {
    const items = [];
    let error = '';
    $('lineas').querySelectorAll('.linea').forEach(l => {
        const id = l.querySelector('.l-prod').value;
        const title = id ? productsData[id]?.title : l.querySelector('.l-otro').value.trim();
        const quantity = Math.round(Number(l.querySelector('.l-q').value));
        const price = Number(l.querySelector('.l-p').value);
        if (!title) error = 'Escribe qué producto es';
        else if (!(quantity > 0)) error = 'Pon cuántas piezas';
        else if (l.querySelector('.l-p').value === '' || !(price >= 0)) error = modo === 'costo' ? 'Pon cuánto cuesta (aunque sea aproximado)' : 'Pon el precio';
        items.push(modo === 'costo'
            ? { productId: id || null, title, quantity, costo: price }
            : { productId: id || null, title, quantity, price, costo: id ? costoDe(id) : null });
    });
    return { items, error, total: items.reduce((a, i) => a + (modo === 'costo' ? i.costo : i.price) * i.quantity, 0) };
}

/* --- Encargo (pedido por mensaje / en persona) --- */
function abrirEncargo() {
    abrirHoja('✍️ Nuevo encargo', `
        <div class="dos">
            ${campo('¿Quién lo pidió?', '<input type="text" id="eCliente" maxlength="60" placeholder="Ej. Beto">')}
            ${campo('WhatsApp <em>(opcional)</em>', '<input type="tel" id="eTel" maxlength="14" inputmode="tel" placeholder="55 1234 5678">')}
        </div>
        ${bloqueProductos()}
        ${campo('¿Ya te pagó?', `<select id="ePago"><option value="">Todavía no</option>
            <option value="banco">Sí, me depositó / transfirió</option><option value="efectivo">Sí, en efectivo</option></select>`)}
        ${campo('Nota <em>(opcional)</em>', '<input type="text" id="eNota" maxlength="200" placeholder="Ej. se lo llevo el viernes a la uni">')}`,
    async () => {
        const cliente = $('eCliente').value.trim();
        if (!cliente) return 'Escribe quién te lo pidió';
        const { items, error, total } = leerLineas();
        if (error) return error;
        const idEnc = await nuevoMovimiento({ tipo: 'encargo', estado: 'pendiente', cliente: cliente.slice(0, 60),
            telefono: $('eTel').value.trim().slice(0, 14), items: items.map(({ costo, ...i }) => i), total,
            nota: $('eNota').value.trim().slice(0, 200) });
        if ($('ePago').value && total > 0) {
            await nuevoMovimiento({ tipo: 'anticipo', pedidoRef: `enc-${idEnc}`, cliente: cliente.slice(0, 60), cuenta: $('ePago').value, monto: total });
        }
        filtroPedidos = 'pendiente';
        return $('ePago').value ? '✍️ Encargo anotado (ya pagado 💵)' : '✍️ Encargo anotado en Pendientes';
    }, '💾 Anotar encargo');
    activarLineas();
}

/* --- Pago adelantado de un pedido --- */
function abrirAdelanto(p) {
    const falta = Math.max(0, p.total - p.pagado);
    abrirHoja(`💵 ${esc(p.nombre)} ya te pagó`, `
        <p class="ayuda" style="margin-top:0">Total del pedido: <b>${mxn(p.total)}</b>${p.pagado ? ` · ya te había dado ${mxn(p.pagado)}` : ''}. El dinero entra hoy a tu saldo; al entregar ya no se vuelve a cobrar.</p>
        <div class="dos">
            ${campo('¿Cuánto?', `<input type="number" id="adMonto" min="0" step="1" inputmode="numeric" value="${Math.round(falta)}">`)}
            ${campo('¿Cómo?', selectCuenta('adCuenta', '', 'banco'))}
        </div>`,
    async () => {
        const monto = numero('adMonto');
        if (!(monto > 0)) return 'Pon cuánto te pagó';
        if (monto > falta + 0.5) return `Es más de lo que falta (${mxn(falta)})`;
        await nuevoMovimiento({ tipo: 'anticipo', pedidoRef: idVenta(p), cliente: p.nombre, cuenta: $('adCuenta').value, monto });
        return '💵 Pago adelantado registrado';
    });
}

/* --- ¿Cómo te pagó? (al entregar) --- */
function preguntarComoPago(p) {
    abrirHoja(`✅ Entregar a ${esc(p.nombre)}`, `
        <p class="ayuda" style="margin-top:0">${p.pagado
            ? `Ya te había pagado <b>${mxn(p.pagado)}</b>. Falta <b>${mxn(p.total - p.pagado)}</b>: ¿cómo te pagó el resto?`
            : `Total: <b>${mxn(p.total)}</b>. ¿Cómo te pagó?`}</p>
        <div class="pago-opciones">
            <button type="button" data-pago="efectivo">💵 Efectivo<small>Entra a tu efectivo</small></button>
            <button type="button" data-pago="banco">🏦 Transferencia / tarjeta<small>Entra a tu banco</small></button>
            <button type="button" data-pago="fiado">🤝 Me quedó a deber<small>Se anota en "Me deben" y le vas registrando abonos</small></button>
        </div>`, null);
    $('hoja').querySelectorAll('[data-pago]').forEach(b => b.addEventListener('click', async () => {
        $('hoja').querySelectorAll('[data-pago]').forEach(x => { x.disabled = true; });
        try {
            await entregarPedido(p, b.dataset.pago);
            cerrarHoja();
            refrescar();
            aviso(b.dataset.pago === 'fiado' ? '✅ Entregado · quedó en "Me deben" 🤝' : '✅ Entregado y cobrado 💰');
        } catch (err) {
            console.error(err);
            aviso('😕 No se pudo. Revisa tu internet.', true);
            $('hoja').querySelectorAll('[data-pago]').forEach(x => { x.disabled = false; });
        }
    }));
}

/* --- Venta a mano --- */
function abrirVenta() {
    abrirHoja('💰 Nueva venta', `
        <p class="ayuda" style="margin-top:0">Para algo que ya entregaste y no anotaste como encargo.</p>
        ${bloqueProductos()}
        <div class="dos" style="margin-top:12px">
            ${campo('¿Cómo te pagó?', selectCuenta('vCuenta', '<option value="fiado">🤝 Me quedó a deber</option>'))}
            ${campo('Fecha', `<input type="date" id="vFecha" value="${hoyCDMX()}">`)}
        </div>
        ${campo('Cliente <em>(obligatorio si te quedó a deber)</em>', '<input type="text" id="vCliente" maxlength="60" placeholder="Nombre o apodo">')}
        ${campo('Nota <em>(opcional)</em>', '<input type="text" id="vNota" maxlength="200">')}`,
    async () => {
        const { items, error, total } = leerLineas();
        if (error) return error;
        const cuenta = $('vCuenta').value;
        const cliente = $('vCliente').value.trim().slice(0, 60);
        if (cuenta === 'fiado' && !cliente) return 'Escribe quién te quedó a deber';
        const fecha = $('vFecha').value || hoyCDMX();
        const ventaId = await nuevoMovimiento({ tipo: 'venta', origen: 'manual', cuenta, fecha, items, total, descuento: 0, cliente, nota: $('vNota').value.trim().slice(0, 200) });
        if (cuenta === 'fiado') {
            await nuevoMovimiento({ tipo: 'prestamo', deuda: 'medeben', persona: cliente, cuenta: null, monto: total, fecha,
                concepto: 'Venta: ' + items.map(i => `${i.quantity}× ${sinCepa(i.title)}`).join(', ').slice(0, 120), ventaId }, `fiado-${ventaId}`);
        }
        return '💰 Venta registrada';
    }, '💾 Guardar venta');
    activarLineas();
}

/* --- Gasto --- */
function abrirGasto() {
    abrirHoja('🧾 Nuevo gasto', `
        ${campo('¿En qué gastaste?', '<input type="text" id="gConcepto" maxlength="80" placeholder="Ej. Uber para entregar en Coyoacán">')}
        <div class="dos">
            ${campo('Monto', '<input type="number" id="gMonto" min="0" step="1" inputmode="numeric" placeholder="120">')}
            ${campo('Pagaste con', selectCuenta('gCuenta'))}
        </div>
        <div class="dos">
            ${campo('Tipo', `<select id="gCategoria">${CATEGORIAS_GASTO.map(c => `<option>${esc(c)}</option>`).join('')}</select>`)}
            ${campo('Fecha', `<input type="date" id="gFecha" value="${hoyCDMX()}">`)}
        </div>
        ${campo('Nota <em>(opcional)</em>', '<input type="text" id="gNota" maxlength="200">')}`,
    async () => {
        const concepto = $('gConcepto').value.trim();
        const monto = numero('gMonto');
        if (!concepto) return 'Escribe en qué gastaste';
        if (!(monto > 0)) return 'Pon cuánto gastaste';
        await nuevoMovimiento({ tipo: 'gasto', fecha: $('gFecha').value || hoyCDMX(), concepto: concepto.slice(0, 80),
            categoria: $('gCategoria').value, cuenta: $('gCuenta').value, monto, nota: $('gNota').value.trim().slice(0, 200) });
        return '🧾 Gasto registrado';
    }, '💾 Guardar gasto');
}

/* --- Contar mi dinero (ajuste) --- */
function abrirContar() {
    const s = calcularSaldos();
    abrirHoja('🧮 ¿Cuánto tienes ahorita?', `
        <p class="ayuda" style="margin-top:0">${s.iniciado
            ? 'Cuenta tu dinero real. Si no coincide con lo que dice el panel, se corrige la diferencia (sin tocar tu ganancia).'
            : 'Escribe cuánto tienes hoy. Desde aquí el panel lo va moviendo solo con cada venta, gasto y préstamo.'}</p>
        <div class="dos">
            ${campo(CUENTAS.efectivo, `<input type="number" id="cEfectivo" min="0" step="1" inputmode="decimal" value="${s.iniciado ? Math.round(s.efectivo) : ''}" placeholder="0">`)}
            ${campo(CUENTAS.banco, `<input type="number" id="cBanco" min="0" step="1" inputmode="decimal" value="${s.iniciado ? Math.round(s.banco) : ''}" placeholder="0">`)}
        </div>`,
    async () => {
        const real = { efectivo: $('cEfectivo').value === '' ? 0 : numero('cEfectivo'), banco: $('cBanco').value === '' ? 0 : numero('cBanco') };
        if (!Number.isFinite(real.efectivo) || !Number.isFinite(real.banco)) return 'Revisa las cantidades';
        let cambios = 0;
        for (const cuenta of ['efectivo', 'banco']) {
            const diferencia = real[cuenta] - s[cuenta];
            if (Math.abs(diferencia) >= 0.5 || !s.iniciado) {
                await nuevoMovimiento({ tipo: 'ajuste', cuenta, monto: diferencia, saldoReal: real[cuenta] });
                cambios++;
            }
        }
        return cambios ? '🧮 Listo, tu dinero quedó al día' : '👌 Todo cuadra, no hubo que corregir';
    });
}

/* --- Mover entre efectivo y banco --- */
function abrirMover() {
    abrirHoja('🔁 Mover dinero', `
        <div class="dos">
            ${campo('De', selectCuenta('mDe'))}
            ${campo('A', '<select id="mA"><option value="banco">🏦 Banco</option><option value="efectivo">💵 Efectivo</option></select>')}
        </div>
        ${campo('¿Cuánto?', '<input type="number" id="mMonto" min="0" step="1" inputmode="numeric" placeholder="500">')}
        <p class="ayuda">Ej. depositaste efectivo en tu tarjeta, o sacaste del cajero.</p>`,
    async () => {
        const de = $('mDe').value, a = $('mA').value, monto = numero('mMonto');
        if (de === a) return 'Elige dos lugares distintos';
        if (!(monto > 0)) return 'Pon cuánto moviste';
        await nuevoMovimiento({ tipo: 'traspaso', de, a, monto });
        return '🔁 Movido';
    });
}

/* --- Préstamo nuevo --- */
function abrirPrestamo() {
    abrirHoja('🤝 Nuevo préstamo', `
        ${campo('¿Quién le debe a quién?', `<select id="pDeuda">
            <option value="medeben">Alguien ME debe (le presté o le fié)</option>
            <option value="debo">YO debo (me prestaron o me fiaron)</option></select>`)}
        <div class="dos">
            ${campo('¿Quién?', '<input type="text" id="pPersona" maxlength="60" placeholder="Nombre">')}
            ${campo('¿Cuánto?', '<input type="number" id="pMonto" min="0" step="1" inputmode="numeric" placeholder="1000">')}
        </div>
        ${campo('¿De qué es? <em>(opcional)</em>', '<input type="text" id="pConcepto" maxlength="120" placeholder="Ej. me fiaron 5 Muha Meds">')}
        ${campo('¿Se movió dinero tuyo?', `<select id="pCuenta">
            <option value="efectivo">Sí, en efectivo</option><option value="banco">Sí, por banco</option>
            <option value="">No (fue mercancía fiada o algo así)</option></select>`)}
        <div class="dos">
            ${campo('Fecha', `<input type="date" id="pFecha" value="${hoyCDMX()}">`)}
            ${campo('Paga antes del <em>(opcional)</em>', '<input type="date" id="pLimite">')}
        </div>
        <p class="ayuda" id="pAyuda"></p>`,
    async () => {
        const persona = $('pPersona').value.trim(), monto = numero('pMonto');
        if (!persona) return 'Escribe con quién es el préstamo';
        if (!(monto > 0)) return 'Pon el monto';
        await nuevoMovimiento({ tipo: 'prestamo', deuda: $('pDeuda').value, persona: persona.slice(0, 60), monto,
            cuenta: $('pCuenta').value || null, concepto: $('pConcepto').value.trim().slice(0, 120),
            fecha: $('pFecha').value || hoyCDMX(), fechaLimite: $('pLimite').value || '' });
        return '🤝 Préstamo anotado';
    });
    const ayuda = () => {
        const debo = $('pDeuda').value === 'debo', cuenta = $('pCuenta').value;
        $('pAyuda').textContent = !cuenta ? '💡 No cambia tu dinero de hoy; solo queda anotado para ir abonando.'
            : debo ? '💡 Ese dinero se suma a tu saldo (te lo prestaron) y sale cuando vayas pagando.'
            : '💡 Ese dinero sale de tu saldo (lo prestaste) y regresa con cada abono.';
    };
    $('pDeuda').addEventListener('change', ayuda);
    $('pCuenta').addEventListener('change', ayuda);
    ayuda();
}

/* --- Abono a un préstamo --- */
function abrirAbono(deudaId) {
    const d = calcularDeudas().find(x => x.id === deudaId);
    if (!d) return;
    const debo = d.deuda === 'debo';
    abrirHoja(debo ? `💸 Pago a ${esc(d.persona)}` : `💸 Abono de ${esc(d.persona)}`, `
        <p class="ayuda" style="margin-top:0">Falta: <b>${mxn(d.falta)}</b></p>
        <div class="dos">
            ${campo('¿Cuánto?', `<input type="number" id="aMonto" min="0" step="1" inputmode="numeric" value="${Math.round(d.falta)}">`)}
            ${campo(debo ? 'Pagaste con' : 'Te pagó en', selectCuenta('aCuenta'))}
        </div>
        ${campo('Fecha', `<input type="date" id="aFecha" value="${hoyCDMX()}">`)}`,
    async () => {
        const monto = numero('aMonto');
        if (!(monto > 0)) return 'Pon el monto del abono';
        if (monto > d.falta + 0.5) return `El abono es más grande de lo que falta (${mxn(d.falta)})`;
        await nuevoMovimiento({ tipo: 'abono', deudaId: d.id, deuda: d.deuda, persona: d.persona, monto,
            cuenta: $('aCuenta').value, fecha: $('aFecha').value || hoyCDMX() });
        return monto >= d.falta - 0.5 ? '🎉 ¡Préstamo liquidado!' : '💸 Abono registrado';
    });
}

/* ======================================================================
   COMPRAS (inversión en mercancía) y STOCK
   ====================================================================== */
// Qué te falta comprar para entregar tus pedidos pendientes (pedidos − lo que tienes − lo ya anotado en "Por comprar")
function faltantesParaPedidos() {
    const necesito = {}, para = {};
    todosLosPedidos().filter(p => p.estado === 'pendiente').forEach(p => p.items.forEach(i => {
        const id = i.productId || idPorTitulo(i.title);
        if (!id) return;
        necesito[id] = (necesito[id] || 0) + (Number(i.quantity) || 0);
        (para[id] = para[id] || []).push(p.nombre);
    }));
    const anotado = {};
    movimientos.filter(m => m.tipo === 'compra' && m.estado === 'por_comprar')
        .forEach(m => (m.items || []).forEach(i => { if (i.productId) anotado[i.productId] = (anotado[i.productId] || 0) + (Number(i.quantity) || 0); }));
    return Object.entries(necesito).map(([id, n]) => ({
        productId: id, title: productsData[id]?.title || id, para: [...new Set(para[id])],
        quantity: n - Math.max(0, stockDe(id) || 0) - (anotado[id] || 0), costo: costoDe(id)
    })).filter(x => x.quantity > 0);
}

function pintarCompras() {
    if (!$('comprasPendientes')) return;
    // 1) Te falta para tus pedidos
    const faltan = faltantesParaPedidos();
    $('comprasFaltan').innerHTML = faltan.length ? `
        <div class="faltan">
            <h3>🔔 Para entregar tus pedidos te falta comprar:</h3>
            <ul>${faltan.map(f => `<li>${f.quantity}× ${esc(f.title)} <small>· para ${esc(f.para.join(', '))}</small></li>`).join('')}</ul>
            <button type="button" class="btn btn-soft full" data-compras="faltan">📝 Pasarlo a "Por comprar"</button>
        </div>` : '';

    // 2) Por comprar
    const pendientes = movimientos.filter(m => m.tipo === 'compra' && m.estado === 'por_comprar')
        .sort((a, b) => String(a.creadoEn).localeCompare(String(b.creadoEn)));
    const totalPend = pendientes.reduce((t, m) => t + (Number(m.total) || 0), 0);
    const s = calcularSaldos();
    $('comprasPendientes').innerHTML = pendientes.length ? `
        <p class="alcanza ${s.iniciado && s.total < totalPend ? 'no' : ''}">Necesitas aprox. <b>${mxn(totalPend)}</b>${s.iniciado
            ? ` · en el negocio tienes ${mxn(s.total)}${s.total < totalPend ? ` → te faltan ${mxn(totalPend - s.total)} (puedes pagar "de tu bolsa")` : ' ✅ te alcanza'}` : ''}</p>
        ${pendientes.map(m => `
        <div class="compra" data-compra="${esc(m.id)}">
            <div class="compra-top">
                <div><b>📝 ${esc(m.nota || 'Por comprar')}</b><small>Anotado ${esc(fechaBonita(m.creadoEn))}</small></div>
                <strong>~${mxn(m.total)}</strong>
            </div>
            <ul>${(m.items || []).map(i => `<li>${i.quantity}× ${esc(sinCepa(i.title))} · ~${mxn(i.costo)} c/u</li>`).join('')}</ul>
            <div class="compra-acciones">
                <button type="button" class="b-ok" data-compra-accion="comprar">✅ Ya lo compré</button>
                <button type="button" data-compra-accion="borrar" aria-label="Borrar">🗑️</button>
            </div>
        </div>`).join('')}` : '<p class="vacio" style="padding:14px 0">Nada pendiente por comprar 🙌</p>';

    // 3) Stock en mano
    const ids = Object.keys(stockCache).filter(id => productsData[id] || stockCache[id] !== 0)
        .sort((a, b) => stockCache[b] - stockCache[a]);
    const valor = ids.reduce((t, id) => t + Math.max(0, stockCache[id]) * (costoDe(id) || 0), 0);
    $('comprasStock').innerHTML = ids.length ? `
        <div class="stock-lista">
            ${ids.map(id => `<div><span>${esc(productsData[id]?.title || id)}</span><b class="${stockCache[id] < 0 ? 'neg' : ''}">${stockCache[id]} pz${stockCache[id] < 0 ? ' ⚠️' : ''}</b></div>`).join('')}
        </div>
        <p class="ayuda" style="margin-top:8px">${valor ? `Tu stock vale aprox. <b>${mxn(valor)}</b> (a lo que te costó). ` : ''}${ids.some(id => stockCache[id] < 0) ? '⚠️ Un número negativo = vendiste algo que no registraste como compra. Corrígelo con "Contar stock".' : ''}</p>`
        : '<p class="vacio" style="padding:14px 0">Toca "🔢 Contar stock" para decirle al panel qué tienes ahorita.</p>';

    // 4) Inversión
    const [desde, hasta] = rangoPeriodo();
    const compradas = movimientos.filter(m => m.tipo === 'compra' && m.estado === 'comprado')
        .sort((a, b) => String(b.compradoEn || b.creadoEn).localeCompare(String(a.compradoEn || a.creadoEn)));
    const delPeriodo = compradas.filter(m => m.fecha >= desde && m.fecha <= hasta).reduce((t, m) => t + (Number(m.total) || 0), 0);
    const etiquetaPeriodo = { hoy: 'hoy', semana: 'en 7 días', mes: 'este mes', pasado: 'el mes pasado', todo: 'en total' }[periodo];
    $('comprasResumen').innerHTML = `
        <div class="kpi"><small>Invertido ${etiquetaPeriodo}</small><b>${mxn(delPeriodo)}</b></div>
        <div class="kpi"><small>👛 Metido de tu bolsa (total)</small><b>${mxn(bolsaTotal())}</b></div>`;
    $('comprasHistorial').innerHTML = compradas.slice(0, 15).map(movimientoHTML).join('')
        || '<p class="vacio" style="padding:14px 0">Aún no registras compras</p>';
}

// "Por comprar" (con costo aproximado) — no mueve dinero ni stock todavía
function abrirPorComprar(iniciales = []) {
    abrirHoja('📝 Por comprar', `
        <p class="ayuda" style="margin-top:0">Lo que vas a ir a comprar. Si no sabes el costo exacto, pon uno aproximado: al comprarlo lo confirmas.</p>
        ${bloqueProductos()}
        ${campo('Nota <em>(opcional)</em>', '<input type="text" id="pcNota" maxlength="80" placeholder="Ej. surtir wax / para los encargos">')}`,
    async () => {
        const { items, error, total } = leerLineas('costo');
        if (error) return error;
        await nuevoMovimiento({ tipo: 'compra', estado: 'por_comprar', items, total, nota: $('pcNota').value.trim().slice(0, 80) });
        return '📝 Anotado en Por comprar';
    }, '💾 Anotar');
    activarLineas('costo', iniciales);
}

// "Ya compré": sale dinero (o de tu bolsa), suben tus piezas y se actualiza el costo de cada producto
function abrirCompra(pendiente = null) {
    abrirHoja(pendiente ? '✅ Confirmar compra' : '🛒 Registrar compra', `
        <p class="ayuda" style="margin-top:0">${pendiente ? 'Revisa que el costo sea el real y elige con qué pagaste.' : 'Mercancía que ya compraste (stock o para un encargo).'}</p>
        ${bloqueProductos()}
        <div class="dos" style="margin-top:12px">
            ${campo('¿Con qué pagaste?', selectCuenta('cpCuenta', '<option value="bolsa">👛 De mi bolsa (dinero mío)</option>'))}
            ${campo('Fecha', `<input type="date" id="cpFecha" value="${hoyCDMX()}">`)}
        </div>
        ${campo('Nota <em>(opcional)</em>', `<input type="text" id="cpNota" maxlength="80" value="${esc(pendiente?.nota || '')}" placeholder="Ej. con el proveedor de siempre">`)}
        <p class="ayuda">💡 "De mi bolsa" = lo pagaste con tu dinero personal: no se resta del negocio, pero se anota cuánto has metido tú.</p>`,
    async () => {
        const { items, error, total } = leerLineas('costo');
        if (error) return error;
        const datos = { tipo: 'compra', estado: 'comprado', items, total, cuenta: $('cpCuenta').value,
            fecha: $('cpFecha').value || hoyCDMX(), compradoEn: ahoraISO(), nota: $('cpNota').value.trim().slice(0, 80) };
        await nuevoMovimiento(datos, pendiente ? pendiente.id : null);
        // El último costo que pagaste se vuelve el costo del producto (para calcular tu ganancia)
        for (const i of items) if (i.productId) await guardarCosto(i.productId, i.costo);
        return '🛒 Compra registrada · stock y costos al día';
    }, '💾 Guardar compra');
    activarLineas('costo', pendiente ? pendiente.items : []);
}

// Contar stock: escribes cuántas piezas tienes de cada producto
function abrirContarStock() {
    const ids = Object.keys(productsData).filter(id => !productsData[id].oculto)
        .sort((a, b) => ((stockDe(b) || 0) - (stockDe(a) || 0)) || productsData[a].title.localeCompare(productsData[b].title));
    abrirHoja('🔢 ¿Cuántas piezas tienes?', `
        <p class="ayuda" style="margin-top:0">Escribe solo los que tienes en mano (deja vacío lo que no llevas en stock). Desde aquí sube solo con tus compras y baja con cada entrega.</p>
        ${ids.map(id => `<div class="conteo"><span>${esc(productsData[id].title)}</span>
            <input type="number" min="0" step="1" inputmode="numeric" data-conteo="${esc(id)}" value="${stockDe(id) !== null ? stockDe(id) : ''}" placeholder="—"></div>`).join('')}`,
    async () => {
        let cambios = 0;
        for (const input of $('hoja').querySelectorAll('[data-conteo]')) {
            if (input.value === '') continue;
            const n = Math.max(0, Math.round(Number(input.value)));
            if (!Number.isFinite(n) || n === stockDe(input.dataset.conteo)) continue;
            await nuevoMovimiento({ tipo: 'stock', productId: input.dataset.conteo, cantidad: n });
            cambios++;
        }
        return cambios ? `🔢 Stock actualizado (${cambios})` : '👌 Sin cambios';
    }, '💾 Guardar conteo');
}

/* --- Borrar --- */
async function borrarMovimiento(id) {
    const m = movimientos.find(x => x.id === id);
    if (!m) return;
    const abonos = m.tipo === 'prestamo' ? movimientos.filter(a => a.tipo === 'abono' && a.deudaId === id) : [];
    const fiado = m.tipo === 'venta' ? movimientos.find(x => x.tipo === 'prestamo' && x.ventaId === id) : null;
    const pregunta = abonos.length ? `¿Borrar este préstamo y sus ${abonos.length} abono(s)?`
        : fiado ? '¿Borrar esta venta? También se quita lo que te quedaron a deber.' : '¿Borrar este movimiento?';
    if (!confirm(pregunta)) return;
    try {
        if (fiado && movimientos.some(a => a.tipo === 'abono' && a.deudaId === fiado.id)) {
            aviso('Esa venta ya tiene abonos. Bórralos primero.', true);
            return;
        }
        for (const a of abonos) await borrarMovimientoId(a.id);
        if (fiado) await borrarMovimientoId(fiado.id);
        await borrarMovimientoId(id);
        refrescar();
        aviso('🗑️ Borrado');
    } catch (err) {
        console.error(err);
        aviso('😕 No se pudo borrar', true);
    }
}

/* --- Excel (CSV) --- */
function descargarCSV() {
    const [desde, hasta] = rangoPeriodo();
    const lista = movimientos.filter(m => enLibro(m) && m.fecha >= desde && m.fecha <= hasta).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const filas = [['Fecha', 'Tipo', 'Detalle', 'Dónde', 'Persona / cliente', 'Monto', 'Costo', 'Nota']];
    const lugar = (c) => (c && CUENTAS[c] ? CUENTAS[c].replace(/^\S+\s/, '') : '');
    lista.forEach(m => {
        switch (m.tipo) {
            case 'venta': {
                const costo = (m.items || []).reduce((a, i) => a + (Number.isFinite(i.costo) ? i.costo * i.quantity : 0), 0);
                filas.push([m.fecha, 'Venta', (m.items || []).map(i => `${i.quantity}x ${i.title}`).join(' + '), lugar(m.cuenta), m.cliente || '', m.total, costo, m.nota || '']); break;
            }
            case 'gasto': filas.push([m.fecha, 'Gasto', m.concepto || '', lugar(m.cuenta), '', -Number(m.monto || 0), '', `${m.categoria || ''} ${m.nota || ''}`.trim()]); break;
            case 'ajuste': filas.push([m.fecha, 'Conteo de dinero', `Contaste ${m.saldoReal}`, lugar(m.cuenta), '', m.monto, '', '']); break;
            case 'traspaso': filas.push([m.fecha, 'Traspaso', `${lugar(m.de)} a ${lugar(m.a)}`, '', '', m.monto, '', '']); break;
            case 'prestamo': filas.push([m.fecha, m.deuda === 'debo' ? 'Préstamo (yo debo)' : 'Préstamo (me deben)', m.concepto || '', lugar(m.cuenta), m.persona, m.monto, '', '']); break;
            case 'abono': filas.push([m.fecha, m.deuda === 'debo' ? 'Abono que pagué' : 'Abono que recibí', '', lugar(m.cuenta), m.persona, m.monto, '', '']); break;
            case 'retiro': filas.push([m.fecha, 'Pago al dueño', m.nota || '', lugar(m.cuenta), '', -Number(m.monto || 0), '', '']); break;
            case 'anticipo': filas.push([m.fecha, 'Pago adelantado', '', lugar(m.cuenta), m.cliente || '', m.monto, '', '']); break;
            case 'compra': filas.push([m.fecha, 'Compra de mercancía', (m.items || []).map(i => `${i.quantity}x ${i.title} @${i.costo}`).join(' + '), lugar(m.cuenta), '', -Number(m.total || 0), '', m.nota || '']); break;
        }
    });
    const csv = '﻿' + filas.map(f => f.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `aeroshop-cuentas-${periodo}-${hoyCDMX()}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ======================================================================
   6. CONECTAR BOTONES
   ====================================================================== */
export function initConta() {
    // Pedidos
    $('chipsPedidos').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-e]');
        if (b) { filtroPedidos = b.dataset.e; pintarPedidos(); }
    });
    $('listaPedidos').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-ped]');
        if (b) accionPedido(b.closest('[data-clave]').dataset.clave, b.dataset.ped, b);
    });
    $('btnRecargarPedidos').addEventListener('click', () => cargarPedidosWeb().then(() => aviso('🔄 Pedidos al día')).catch(() => aviso('😕 No se pudo recargar', true)));
    $('btnEncargo').addEventListener('click', abrirEncargo);

    // Cuentas
    $('chipsPeriodo').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-p]');
        if (b) { periodo = b.dataset.p; pintarConta(); }
    });
    $('contaLista').addEventListener('click', (ev) => {
        if (ev.target.closest('[data-borrar]')) borrarMovimiento(ev.target.closest('[data-mov]').dataset.mov);
    });
    $('contaDinero').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-dinero]');
        if (b) (b.dataset.dinero === 'contar' ? abrirContar : abrirMover)();
    });
    $('contaDeudas').addEventListener('click', (ev) => {
        if (ev.target.closest('[data-ver-saldadas]')) { verSaldadas = !verSaldadas; pintarDeudas(); return; }
        const b = ev.target.closest('[data-deuda-accion]');
        if (!b) return;
        const id = b.closest('[data-deuda]').dataset.deuda;
        if (b.dataset.deudaAccion === 'abono') abrirAbono(id); else borrarMovimiento(id);
    });
    $('btnPrestamo').addEventListener('click', abrirPrestamo);
    $('contaReparto').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-reparto]');
        if (!b) return;
        const a = b.dataset.reparto;
        if (a === 'config') abrirPorcentajes();
        else if (a === 'pagarme') abrirPagarme();
        else { semanaOffset += a === 'antes' ? -1 : 1; if (semanaOffset > 0) semanaOffset = 0; pintarReparto(); }
    });

    // Compras
    $('btnCompra').addEventListener('click', () => abrirCompra());
    $('btnPorComprar').addEventListener('click', () => abrirPorComprar());
    $('btnContarStock').addEventListener('click', abrirContarStock);
    $('comprasFaltan').addEventListener('click', (ev) => {
        if (ev.target.closest('[data-compras="faltan"]')) abrirPorComprar(faltantesParaPedidos());
    });
    const accionCompra = (ev) => {
        const b = ev.target.closest('[data-compra-accion]');
        if (!b) return;
        const id = b.closest('[data-compra]').dataset.compra;
        if (b.dataset.compraAccion === 'comprar') abrirCompra(movimientos.find(m => m.id === id));
        else borrarMovimiento(id);
    };
    $('comprasPendientes').addEventListener('click', accionCompra);
    $('comprasHistorial').addEventListener('click', (ev) => {
        if (ev.target.closest('[data-borrar]')) borrarMovimiento(ev.target.closest('[data-mov]').dataset.mov);
    });
    $('btnVenta').addEventListener('click', abrirVenta);
    $('btnGasto').addEventListener('click', abrirGasto);
    $('btnCSV').addEventListener('click', descargarCSV);

    // La hoja de formularios
    $('hojaBg').addEventListener('click', cerrarHoja);
    $('hoja').addEventListener('click', (ev) => { if (ev.target.closest('[data-cerrar-hoja]')) cerrarHoja(); });
    $('hoja').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        if (!alGuardar) return;
        const boton = $('hojaGuardar');
        boton.disabled = true;
        try {
            const resultado = await alGuardar();
            // Si regresa un texto que no empieza con emoji de éxito, es un error de lo que escribiste
            if (resultado && !/^[\p{Extended_Pictographic}]/u.test(resultado)) { aviso(resultado, true); boton.disabled = false; return; }
            cerrarHoja();
            refrescar();
            if (resultado) aviso(resultado);
        } catch (err) {
            console.error(err);
            aviso(err.code === 'permission-denied' ? '🔒 Firebase no dio permiso' : '😕 No se guardó. Revisa tu internet.', true);
            boton.disabled = false;
        }
    });
}
