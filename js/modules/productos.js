// js/modules/productos.js
// 📦 Productos "de fábrica". Lo que cambies en el Panel (aeroshop7.vercel.app/admin)
//    se guarda en Firebase y gana sobre lo que está aquí. No necesitas tocar este archivo.
// Base de datos oficial de productos para la vista detallada
export const productsData = {
    'cookies1g': {
        gramos: 1, marca: 'Cookies', anuncio: 'NUEVO ✨',
        title: 'Cookies 1g 💙',
        price: 400,
        image: './cookies-1g.jpg',
        description: 'Cookies Delta 8 Vape de 1G desechable 💙 Listo para usar, sin recargas. Varios sabores de la línea Cookies, como Cereal Milk Caramel y Peach Pie. Pregunta por los sabores disponibles.',
        strains: ['Cereal Milk Caramel 🥣', 'Peach Pie 🍑', 'Pregunta por más sabores 💬']
    },
    'corridostumbados': {
        agotado: true, // quita esta línea cuando vuelva a haber
        gramos: 2.5, marca: 'Corridos Tumbados', anuncio: 'NUEVO ✨',
        title: 'CORRIDOS TUMBADOS × LOS CT 🔥',
        price: 790,
        image: './ace-ct-1.jpg',
        description: 'Edición Corridos Tumbados de Natanael Cano · LOS CT Records. Bolsas de colección con Liquid Diamonds 2.5G + Infused Preroll + Gummies en 7 variedades. También hay pack de 3 gomitas infusionadas (300 MG) + 1.5G premium preroll. Pregunta por disponibilidad.',
        strains: ['EL F — Acapulco', 'ENRE LAS DE 20 — Frescout Cookie', 'ORULA — Amnesia', 'CHICLONA — Bubba Kush', 'JUEVES 10 — Juice Bar', 'CARLITOS — Sour Diesel', 'TUMBADOS — Runtz']
    },
    'luigi': {
        gramos: 0.5, marca: 'ACE ULTRA',
        title: 'LUIGI',
        price: 700,
        image: './ace-luigi.jpg',
        description: 'LUIGI Infused Fattone. Dispositivo rosa con pre-roll Dream Cream (Indica) de 0.5G incluido en estuche de colección. Producto ACE ULTRA.',
        strains: ['Dream Cream — Indica 🌙', 'Pregunta por disponibilidad 💬']
    },
    'muhacajas3000': {
        gramos: 3, marca: 'Muha Meds',
        title: 'MUHA MEDS 3000 MG',
        price: 850,
        image: './ace-muha-cajas.jpg',
        description: 'Muha Meds 3000 MG (0.106 OZ). Dispositivo negro con cuatro variedades en caja de colección. Producto ACE ULTRA.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️', 'Pregunta por disponibilidad 💬']
    },
    'muhameds2000': {
        gramos: 2, marca: 'Muha Meds',
        title: 'MUHA MEDS 2000 MG',
        price: 800,
        image: './ace-muha-2026.jpg',
        description: 'Muha Meds 2000 MG (0.071 OZ). Edición negro y oro con detalles metálicos. Producto ACE ULTRA.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️', 'Pregunta por disponibilidad 💬']
    },
    'lebowski': {
        gramos: 2, marca: 'Cookies',
        title: 'Cookies × Lebowski 2g 🥃',
        price: 780,
        image: './lebo.JPG',
        description: 'Cookies × Lebowski 🥃 Dispositivo DUO de 2g (1g + 1g) con Liquid Diamonds + Live Resin. Dos vuelos en un solo equipo, edición de colección en azul Cookies. Relax total, estilo "The Dude". Pregunta por las variedades disponibles.',
        strains: ['Variedad surtida ☯️', 'Pregunta por disponibilidad 💬']
    },
    'snoopdog': {
        gramos: 3.5, marca: 'Death Row',
        title: 'Snoop Dogg × Death Row 🎤',
        price: 1200,
        image: './snoop-dog.jpg',
        description: 'Death Row Records 🔥 La edición de Snoop Dogg aterriza en la cabina: vape de 3.5 ml con dos vuelos distintos. Sour Diesel para despegar con energía y Grape Ape para bajar suave. Vibra West Coast directo a tu equipaje.',
        strains: ['Sour Diesel — Sativa 🚀', 'Grape Ape — Indica 🌙']
    },
    'muhameds2026': {
        gramos: 2, marca: 'Muha Meds',
        title: 'MUHA MEDS 2026 ✨ All-in-One',
        price: 700,
        image: './muhameds%202026.jpg',
        description: 'Muha Meds 2026 ✨ All-in-One de 2g (2000 mg) en negro y oro. Galactic Diesel, perfil Indica: relajado, aromático y con vibra espacial. Todo en un solo dispositivo, listo para despegar.',
        strains: ['Galactic Diesel — Indica 🌙']
    },
    'crybaby': {
        gramos: 2, marca: 'CryBaby',
        title: 'CryBaby 2g 🍼 + Gomitas',
        price: 800,
        image: './crybaby.jpg',
        description: 'CryBaby 🍼 2G Liquid Diamonds con Live Resin, sabor Mango Ice Cream (Híbrida). Dulce, helado y con certificado de autenticidad. Incluye gomitas Gumballs para completar la experiencia.',
        strains: ['Mango Ice Cream — Híbrida ☯️']
    },
    'frydovni': {
        gramos: 2, marca: 'FRYD',
        title: 'FRYD Ovni 🛸 + Gomitas 2g',
        price: 850,
        image: './frydgomas2.jpg',
        description: 'Edición especial FRYD Ovni con gomitas infundidas. Extracto Premium de Live Resin + Liquid Batter para una experiencia física y cerebral de alta potencia.',
        strains: ['Híbrida ☯️', 'Sativa 🚀', 'Indica 🌙']
    },
    'donutsdonitav3': {
        marca: 'Donuts', anuncio: 'PROMO 🔥',
        title: 'donuts donita v3',
        price: 500,
        antes: 850, // precio normal: mientras exista "antes", se muestra como PROMO
        image: './donusdonitav31.JPG',
        description: 'Dona Mágica ✨🪴. Extracto ultra limpio con sabores naturales y perfil terpénico refinado.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️']
    },
    'besos2g': {
        gramos: 2, marca: 'Besos',
        title: 'Besos Liquid Diamonds 2g 💋',
        price: 850,
        image: './besos.jpg',
        description: '2G Liquid Diamonds con perfil Cherry Berry Kiss. Potencia pura y sabor dulce e intenso.',
        strains: ['Híbrida ☯️', 'Indica 🌙']
    },
    'packman3g': {
        gramos: 3, marca: 'Packman',
        title: 'PACKMAN 3g + Pre-Roll',
        price: 950,
        antes: 1300,
        image: './packman1.jpg',
        description: 'Packman × PartyBoyz. 3G Live Resin + .5G Infused Pre-Roll de regalo. Combo de potencia máxima.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️']
    },
    'muhacmeds': {
        gramos: 2, marca: 'Muha Meds',
        title: 'MUHACMEDS 2g',
        price: 700,
        image: './Muhacmeds1.JPG',
        description: 'Muha Meds × Cookies. Colaboración exclusiva con perfil terpénico idéntico a flor recién cosechada.',
        strains: ['Sativa 🚀', 'Indica 🌙', 'Híbrida ☯️']
    },
    'waka36k': {
        seccion: 'nubes', marca: 'Waka',
        title: 'Waka 36k 💨',
        price: 510,
        image: './waka-mango.jpg',
        description: 'Waka 36k 💨 Desechable recargable con pantalla Turbo 24W. Elige tu sabor y mira cómo se ve.',
        strains: ['Peach Mango Watermelon 🍑🥭🍉', 'Menta Ice 🌿', 'Strawberry Watermelon 🍓🍉', 'Fresa Kiwi 🍓'],
        // Al elegir un sabor, la foto cambia a la de ese sabor
        strainImages: {
            'Peach Mango Watermelon 🍑🥭🍉': './waka-mango.jpg',
            'Menta Ice 🌿': './waka-menta.jpg',
            'Strawberry Watermelon 🍓🍉': './waka-sandia.jpg',
            'Fresa Kiwi 🍓': './waka-fresakiwi.jpg'
        }
    },
    'waka15k': {
        seccion: 'nubes', marca: 'Waka',
        title: 'Waka 15k 💨',
        price: 250,
        image: './waka15-mango.jpg',
        description: 'Waka SoPro 15,000 puffs 💨 con 5% de nicotina y pantalla digital. Elige tu sabor y mira cómo se ve.',
        strains: ['Mango Ice 🥭', 'Kiwi Dragon Berry 🐉', 'Strawberry Burst 🍓'],
        strainImages: {
            'Mango Ice 🥭': './waka15-mango.jpg',
            'Kiwi Dragon Berry 🐉': './waka15-kiwi.jpg',
            'Strawberry Burst 🍓': './waka15-strawberry.jpg'
        }
    },
    'lostmary5k': {
        seccion: 'nubes', marca: 'Lost Mary',
        title: 'Lost Mary 5k 🔥',
        price: 150,
        image: './lostmary-alphonso.jpg',
        description: 'Lost Mary MO5000 Black Gold 🔥 Edición limitada con 5,000 inhalaciones. Sabor Alphonso Mango Ice: mango dulce y jugoso con un final helado.',
        strains: ['Alphonso Mango Ice 🥭'],
        strainImages: { 'Alphonso Mango Ice 🥭': './lostmary-alphonso.jpg' }
    },
    'muhamedual': {
        gramos: 2, marca: 'Muha Meds',
        title: 'MUHAMEDual 2g',
        price: 800,
        image: './muhamedual 2.JPG',
        description: 'Dispositivo dual Muha Meds. Doble tanque con variante seleccionable y doble resistencia.',
        strains: ['Sativa/Indica ☯️', 'Sativa/Sativa 🚀']
    }
};
