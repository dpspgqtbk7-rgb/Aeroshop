// js/modules/inventario.js — Trae de Firebase lo que cambiaste en el Panel y lo junta con productos.js
import { productsData } from './productos.js';

const CACHE_KEY = 'aeroshop_catalogo_v1';
// Copia intacta de los productos "de fábrica" (para poder deshacer cambios)
export const BASE = JSON.parse(JSON.stringify(productsData));

// Solo estos datos se pueden cambiar desde el Panel
export const CAMPOS = {
    title: 'texto', price: 'numero', antes: 'numero', image: 'foto', description: 'texto',
    strains: 'lista', gramos: 'numero', marca: 'texto', agotado: 'si-no', oculto: 'si-no',
    anuncio: 'texto', seccion: 'texto', panel: 'si-no'
};

function limpiar(valor, tipo) {
    if (valor === null) return null; // null = quitar el dato (por ejemplo, quitar la promo)
    switch (tipo) {
        case 'texto': return typeof valor === 'string' ? valor.slice(0, 2000) : undefined;
        case 'numero': return Number.isFinite(valor) ? valor : undefined;
        case 'si-no': return typeof valor === 'boolean' ? valor : undefined;
        case 'lista': return Array.isArray(valor) ? valor.filter(v => typeof v === 'string').map(v => v.slice(0, 120)).slice(0, 30) : undefined;
        case 'foto': return typeof valor === 'string' && /^(data:image\/(jpeg|png|webp);base64,|https:\/\/|\.\/)/.test(valor) ? valor : undefined;
        default: return undefined;
    }
}

// Junta productos.js + cambios. Devuelve qué campos cambió cada producto.
export function aplicar(remotos) {
    // 1) Regresar todo a como viene de fábrica
    Object.keys(productsData).forEach(id => { if (!(id in BASE)) delete productsData[id]; });
    Object.keys(BASE).forEach(id => { productsData[id] = JSON.parse(JSON.stringify(BASE[id])); });

    // 2) Encima, lo del Panel
    const cambios = {};
    Object.entries(remotos || {}).forEach(([id, datos]) => {
        if (!/^[a-z0-9-]{1,60}$/i.test(id) || !datos || typeof datos !== 'object') return;
        const nuevo = !(id in productsData);
        if (nuevo && !(typeof datos.title === 'string' && datos.title && Number.isFinite(datos.price) && datos.image)) return;
        const p = nuevo ? { strains: [], description: '' } : productsData[id];
        const hechos = {};
        Object.entries(CAMPOS).forEach(([k, tipo]) => {
            if (!(k in datos)) return;
            const v = limpiar(datos[k], tipo);
            if (v === undefined) return;
            if (v === null) delete p[k]; else p[k] = v;
            hechos[k] = true;
        });
        if (!Array.isArray(p.strains)) p.strains = [];
        if (nuevo) p.panel = true;
        productsData[id] = p;
        cambios[id] = hechos;
    });
    return cambios;
}

// Al abrir la página: usa lo último que se guardó en este celular (rápido, sin esperar internet)
export function aplicarDesdeCache() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (guardado && typeof guardado === 'object') return { cambios: aplicar(guardado), json: JSON.stringify(guardado) };
    } catch (e) { /* sin caché */ }
    return { cambios: {}, json: '{}' };
}

// Luego trae lo más nuevo de Firebase. Devuelve los cambios solo si algo es distinto.
export async function cargarDesdeFirebase(jsonAnterior = '{}') {
    const { db, fbMethods } = await import('../../firebase-config.js');
    const snap = await fbMethods.getDocs(fbMethods.collection(db, 'productos'));
    const remotos = {};
    snap.forEach(d => { remotos[d.id] = d.data(); });
    const json = JSON.stringify(remotos);
    try { localStorage.setItem(CACHE_KEY, json); } catch (e) { /* lleno o modo privado */ }
    if (json === jsonAnterior) return null;
    return aplicar(remotos);
}
