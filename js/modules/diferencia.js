// js/modules/diferencia.js
// Tarjetas de "¿Qué nos diferencia?": contadores, entrada animada y teclado
export function initDiferencia() {
    const cards = [...document.querySelectorAll('.dif-portal')];
    if (!cards.length) return;

    // Contadores reales ("📍 16 spots"): cuentan lo que hay dentro de cada sección
    document.querySelectorAll('.dif-count[data-count]').forEach(el => {
        const n = document.querySelectorAll(el.dataset.count).length;
        el.textContent = n ? el.dataset.label.replace('{n}', n) : '';
    });

    // Se abren con Enter o espacio, igual que con un toque
    cards.forEach(c => c.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); c.click(); }
    }));

    // Entran una tras otra cuando aparecen en pantalla
    const mostrar = (c, i) => setTimeout(() => c.classList.add('in'), i * 90);
    if (!('IntersectionObserver' in window)) { cards.forEach(mostrar); return; }
    const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            mostrar(en.target, cards.indexOf(en.target) % 3);
            io.unobserve(en.target);
        });
    }, { threshold: 0.15 });
    cards.forEach(c => io.observe(c));
}
