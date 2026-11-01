// js/i18n.js — Idioma ES | EN. El HTML está en español; en inglés se traduce el texto al vuelo.
import { EXTRA, RULES } from './i18n/extra.js';

const KEY = 'aeroshop-lang';
const ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE']);

let lang = 'es';
let EN = {};
let cargado = false;
let observer = null;
const textos = new Map();   // nodo de texto -> { orig, puesto }
const attrs = new Map();    // elemento -> { attr: { orig, puesto } }

function guardado() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
}
function guardar(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

function tr(s) {
    const t = s.trim().replace(/\s+/g, ' ');
    if (!t) return s;
    let r = EXTRA[t] || EN[t];
    if (!r) {
        for (const [re, fn] of RULES) {
            const m = t.match(re);
            if (m) { r = fn(tr, m); break; }
        }
    }
    if (!r) return s;
    const ini = s.match(/^\s*/)[0], fin = s.match(/\s*$/)[0];
    return ini + r + fin;
}

function textoNodo(n) {
    if (lang !== 'en') return;
    const p = n.parentNode;
    if (!p || SKIP.has(p.nodeName)) return;
    const reg = textos.get(n);
    const actual = n.nodeValue;
    if (reg && actual === reg.puesto) return;       // ya traducido por nosotros
    const nuevo = tr(actual);
    if (nuevo !== actual) { textos.set(n, { orig: actual, puesto: nuevo }); n.nodeValue = nuevo; }
    else if (reg) textos.delete(n);
}

function atributosEl(el) {
    if (lang !== 'en') return;
    for (const a of ATTRS) {
        if (!el.hasAttribute(a)) continue;
        const val = el.getAttribute(a);
        const reg = attrs.get(el) && attrs.get(el)[a];
        if (reg && val === reg.puesto) continue;
        const nuevo = tr(val);
        if (nuevo !== val) {
            if (!attrs.has(el)) attrs.set(el, {});
            attrs.get(el)[a] = { orig: val, puesto: nuevo };
            el.setAttribute(a, nuevo);
        }
    }
}

function recorrer(raiz) {
    if (raiz.nodeType === 3) { textoNodo(raiz); return; }
    if (raiz.nodeType !== 1 && raiz.nodeType !== 11) return;
    if (raiz.nodeType === 1) { if (raiz.nodeName === 'SCRIPT' || raiz.nodeName === 'STYLE') return; atributosEl(raiz); }
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
        if (n.nodeType === 3) textoNodo(n);
        else if (n.nodeName !== 'SCRIPT' && n.nodeName !== 'STYLE') atributosEl(n);
    }
}

function observar() {
    if (observer) return;
    observer = new MutationObserver((muts) => {
        observer.disconnect();
        for (const m of muts) {
            if (m.type === 'childList') m.addedNodes.forEach(recorrer);
            else if (m.type === 'characterData') textoNodo(m.target);
            else if (m.type === 'attributes') atributosEl(m.target);
        }
        reanudar();
    });
    reanudar();
}
function reanudar() {
    observer.observe(document.body, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ATTRS
    });
}

function meta() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'es';
    const d = document.querySelector('meta[name="description"]');
    if (d) {
        if (!d.dataset.es) d.dataset.es = d.content;
        d.content = lang === 'en'
            ? 'AEROSHOP CDMX: catalog, flight routes and munchies. Safe, unique spots to fly in Mexico City.'
            : d.dataset.es;
    }
    if (!document.documentElement.dataset.titulo) document.documentElement.dataset.titulo = document.title;
    if (lang === 'en') document.title = tr(document.documentElement.dataset.titulo);
    else document.title = document.documentElement.dataset.titulo;
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === lang);
        b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
    });
}

function restaurar() {
    if (observer) observer.disconnect();
    textos.forEach((r, n) => { if (n.isConnected && n.nodeValue === r.puesto) n.nodeValue = r.orig; });
    textos.clear();
    attrs.forEach((o, el) => {
        for (const a in o) if (el.getAttribute(a) === o[a].puesto) el.setAttribute(a, o[a].orig);
    });
    attrs.clear();
    if (observer) reanudar();
}

export async function setLang(nuevo) {
    nuevo = nuevo === 'en' ? 'en' : 'es';
    guardar(nuevo);
    if (nuevo === 'en' && !cargado) {
        try { EN = (await import('./i18n/en.js')).EN; cargado = true; } catch (e) { return; }
    }
    lang = nuevo;
    if (observer) observer.disconnect();
    if (lang === 'en') recorrer(document.body); else restaurar();
    meta();
    observar();
    window.dispatchEvent(new CustomEvent('aeroshop:lang', { detail: lang }));
}

export function getLang() { return lang; }

export function initI18n() {
    window.setLang = setLang;
    let inicial = guardado();
    if (!inicial) inicial = (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'es';
    document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
    return setLang(inicial);
}
