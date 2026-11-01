// Sube la versión de caché de sw.js (aeroshop-v33 -> v34). Uso: node bump-cache.js
// Hazlo antes de cada deploy en el que cambies archivos estáticos que el sitio guarda offline.
const fs = require('fs');
const f = __dirname + '/sw.js';
const s = fs.readFileSync(f, 'utf8');
const m = s.match(/const CACHE_NAME = 'aeroshop-v(\d+)'/);
if (!m) { console.error('No encontré CACHE_NAME en sw.js'); process.exit(1); }
const n = Number(m[1]) + 1;
fs.writeFileSync(f, s.replace(m[0], `const CACHE_NAME = 'aeroshop-v${n}'`));
console.log(`CACHE_NAME: v${m[1]} -> v${n}`);
