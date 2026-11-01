// js/config.js — datos del negocio en UN solo lugar.
// Si cambias el WhatsApp, cámbialo aquí y se actualiza en toda la página.
export const WHATSAPP = '525561446446';
export const WHATSAPP_BONITO = '55 6144 6446';
export const waLink = (texto) =>
    `https://wa.me/${WHATSAPP}` + (texto ? `?text=${encodeURIComponent(texto)}` : '');
