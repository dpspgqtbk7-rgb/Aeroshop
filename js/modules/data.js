// js/modules/data.js

export const experiencesData = {
    rutas: {
        lagoalgo: {
            title: "LagoAlgo — Bosque de Chapultepec 🌊🛩️",
            media: "./lago-algo.MP4",
            isVideo: true,
            badge: "📍 Poniente • ✈️✈️✈️✈️✈️",
            zona: "Poniente (2da Sección del Bosque de Chapultepec)",
            conexion: "Metro Constituyentes (Línea 7) / Cablebús Los Pinos",
            calificacion: "✈️✈️✈️✈️✈️ (5/5 — Altitud Máxima)",
            bitacora: "Hángar de arquitectura brutalista flotando directo sobre el lago. Aquí la tripulación viene a nivelar presión entre exposiciones de arte inmersivo, arquitectura brutal y un vibe frente al agua que congela el tiempo.",
            discrecion: "🟢 Alto / Relajado. Entorno cultural de respeto; mantén la vibra discreta y disfruta la vista.",
            mapsUrl: "https://maps.google.com/?q=LagoAlgo+Chapultepec",
            comoLlegar: { destino: "LagoAlgo Chapultepec", desde: ["Metro Constituyentes", "Cablebús Los Pinos", "Metro Auditorio"] }
        },
        cenart: {
            title: "CENART (Centro Nacional de las Artes) 🎭🍊",
            media: "./cenart-hero.mp4",
            isVideo: true,
            badge: "📍 Sur • ✈️✈️✈️✈️",
            zona: "Sur (Churubusco)",
            conexion: "Metro General Anaya (Línea 2) / Metro Ermita (Línea 12 / 2)",
            calificacion: "✈️✈️✈️✈️ (4/5 — Turbinas de Arte & Sonido)",
            bitacora: "Áreas verdes enormes, arquitectura brutal y vibra artística. El spot perfecto para tirarte al pasto a filosofar o desconectar del ruido de la ciudad.",
            discrecion: "🟡 Medio. Hay guardias dando rondines. Se recomienda discreción.",
            extraInfo: "🗺️ Cerca de Cineteca de las Artes y Little Caesars Ermita para el bajón.",
            mapsUrl: "https://maps.google.com/?q=CENART+CDMX",
            comoLlegar: { destino: "CENART Centro Nacional de las Artes CDMX", desde: ["Metro General Anaya", "Metro Ermita", "Cineteca Nacional de las Artes"] },
            imagenExtra: { src: "./cenart-mapas.jpg", titulo: "🗺️ Mapa del CENART", nota: "Así se ve el CENART por dentro: ubica tu zona antes de aterrizar." }
        },
        chapultepec: {
            title: "Cineteca de Chapultepec 🎬🚀",
            media: "./chapultepec.mp4",
            isVideo: true,
            badge: "📍 Poniente • ✈️✈️✈️✈️",
            zona: "Poniente (4ta Sección del Bosque de Chapultepec)",
            conexion: "Cablebús Línea 3 (Estación Cineteca / Bodegas)",
            calificacion: "✈️✈️✈️✈️ (4/5 — Cine en las Alturas)",
            bitacora: "La nueva terminal espacial en el corazón del bosque. Súbete al Cablebús, sobrevuela los árboles y aterriza en salas de proyección de última generación y foros al aire libre.",
            discrecion: "🟢 Alto. Ambiente totalmente abierto, relajado y joven.",
            mapsUrl: "https://maps.google.com/?q=Cineteca+Nacional+Chapultepec",
            comoLlegar: { destino: "Cineteca Nacional Chapultepec", desde: ["Metro Chapultepec", "Metro Juanacatlán", "Metro Constituyentes"] }
        },
        laguna: {
            title: "Laguna CDMX 🏭☕",
            media: "./LAGUNA.MP4",
            isVideo: true,
            badge: "📍 Centro • ✈️✈️✈️✈️",
            zona: "Centro (Colonia Doctores)",
            conexion: "Metro Niños Héroes (Línea 3) / Metro Hospital General",
            calificacion: "✈️✈️✈️✈️ (4/5 — Hángar Industrial & Vibe)",
            bitacora: "Una antigua fábrica textil reconvertida en hángar creativo secreto. Pasillos industriales llenos de plantas, galerías de diseño y café de especialidad.",
            discrecion: "🟢 Alto / Privado. Espacio cerrado súper seguro para caminar en calma.",
            mapsUrl: "https://maps.google.com/?q=Laguna+CDMX+Dr+Erazo",
            comoLlegar: { destino: "Laguna CDMX Dr Erazo", desde: ["Metro Niños Héroes", "Metro Hospital General", "Metro Balderas"] }
        },
        jardin: {
            title: "Jardín Escénico Chapultepec 🌿🪵",
            media: "./jardin.mp4",
            isVideo: true,
            badge: "📍 Poniente • ✈️✈️✈️",
            zona: "Poniente (Junto al Auditorio Nacional)",
            conexion: "Metro Auditorio (Línea 7)",
            calificacion: "✈️✈️✈️ (3/5 — Pasarela Verde Relámpago)",
            bitacora: "Pasarela de madera y espejos de agua camuflados en la vegetación del bosque. Una escala relámpago para caminar en absoluto silencio.",
            discrecion: "🟡 Medio. Zona transitada por ser vía pública del parque.",
            mapsUrl: "https://maps.google.com/?q=Jardin+Escenico+Chapultepec",
            comoLlegar: { destino: "Jardín Escénico Chapultepec", desde: ["Metro Auditorio", "Metro Chapultepec", "Metro Polanco"] }
        },
        eden: {
            title: "Jardín El Edén CU 🌋🌿",
            media: "./eden.mp4",
            isVideo: true,
            badge: "📍 Sur • ✈️✈️✈️",
            zona: "Sur (Reserva Ecológica, UNAM)",
            conexion: "Metrobús Centro Cultural Universitario / Metro Universidad (Línea 3)",
            calificacion: "✈️✈️✈️ (3/5 — Trance Volcánico & Paz)",
            bitacora: "Santuario natural escondido entre rocas de piedra volcánica. Cero ruido de motores: solo tú, la vegetación silvestre y un ambiente de paz absoluta.",
            discrecion: "🟢 Alto / Discreto. Zona amplia y verde dentro del campus cultural.",
            extraInfo: "🚌 Pumabús: Usa la Ruta 3 o Ruta 10 saliendo directo de Metro Universidad.",
            mapsUrl: "https://maps.google.com/?q=Jardin+El+Eden+UNAM",
            comoLlegar: { destino: "Jardín El Edén UNAM", desde: ["Metro Universidad", "Metrobús Centro Cultural Universitario", "Metro Copilco"] },
            imagenExtra: { src: "./pumabus-rutas.jpg", titulo: "🚌 Rutas de Pumabús", nota: "Mapa oficial de rutas de Pumabús y ciclopista: tu transporte interno dentro de CU." }
        },
        soumaya: {
            title: "Museo Soumaya 🪞🛸",
            media: "./soumaya.mp4",
            isVideo: true,
            badge: "📍 Poniente • ✈️✈️✈️✈️",
            zona: "Poniente (Nuevo Polanco)",
            conexion: "Metro San Joaquín / Metro Polanco (Línea 7)",
            calificacion: "✈️✈️✈️✈️ (4/5 — Nave Nodriza Futurista)",
            bitacora: "La nave nodriza de Polanco. Subir por su rampa espiral bajo luz blanca envolvente rodeado de esculturas monumentales se siente como caminar dentro de una estación espacial.",
            discrecion: "🔴 Bajo. Hay mucha seguridad en el recinto; llega listo de origen.",
            mapsUrl: "https://maps.google.com/?q=Museo+Soumaya+Polanco",
            comoLlegar: { destino: "Museo Soumaya Plaza Carso", desde: ["Metro Polanco", "Metro San Joaquín", "Metro Auditorio"] }
        },
        muac: {
            title: "MUAC CU 🏛️📐",
            media: "./muac.mp4",
            isVideo: true,
            badge: "📍 Sur • ✈️✈️✈️✈️✈️",
            zona: "Sur (Centro Cultural Universitario, UNAM)",
            conexion: "Metrobús CCU / Metro Universidad (Línea 3)",
            calificacion: "✈️✈️✈️✈️✈️ (5/5 — Vuelo Transatlántico Visual)",
            bitacora: "La meca del arte contemporáneo en el sur. Su fachada oblicua de cristal flotando sobre espejos de agua te prepara para instalaciones sonoras y luminosas.",
            discrecion: "🟢 Alto. Las explanadas del Centro Cultural Universitario son amplias y pacíficas.",
            extraInfo: "🚌 Pumabús: Ruta 3 CCU para llegar directo desde Metro Universidad.",
            mapsUrl: "https://maps.google.com/?q=MUAC+UNAM",
            comoLlegar: { destino: "MUAC UNAM Centro Cultural Universitario", desde: ["Metro Universidad", "Metrobús Centro Cultural Universitario", "Metro Copilco"] },
            imagenExtra: { src: "./pumabus-rutas.jpg", titulo: "🚌 Rutas de Pumabús", nota: "Mapa oficial de rutas de Pumabús y ciclopista: tu transporte interno dentro de CU." }
        },
        bicentenario: {
            title: "Parque Bicentenario 🌳🚲",
            media: "./bicentenario.MP4",
            isVideo: true,
            badge: "📍 Poniente • ✈️✈️✈️✈️",
            zona: "Poniente (Av. 5 de Mayo 290, Col. Refinería 18 de Marzo, Miguel Hidalgo)",
            conexion: "Metro Refinería (Línea 7), a unos 100 m de la entrada principal",
            calificacion: "✈️✈️✈️✈️ (4/5 — Pista Larga & Pasto Infinito)",
            bitacora: "Un parque enorme dividido en ocho ecosistemas, con jardín botánico y una pista de 4 km para correr o andar en bici. Llega con tu manta y tus monchis, tírate en el pasto y deja que el día se estire.",
            discrecion: "🟡 Medio. Es un parque grande con vigilancia y mucha gente; elige una zona tranquila y mantén la vibra relajada.",
            extraInfo: "🧺 Ideal para picnic. Lleva agua y protector solar: hay mucho espacio abierto.",
            mapsUrl: "https://maps.google.com/?q=Parque+Bicentenario+CDMX",
            comoLlegar: { destino: "Parque Bicentenario CDMX", desde: ["Metro Refinería", "Metro El Rosario", "Metro Tacuba"] }
        },
        audiorama: {
            title: "Audiorama Chapultepec 🎧🌲",
            media: "./audiorama.MP4",
            isVideo: true,
            badge: "📍 Poniente • ✈️✈️✈️",
            zona: "Poniente (1ra Sección del Bosque de Chapultepec, detrás del Monumento al Escuadrón 201)",
            conexion: "Entrada por la Puerta de Flores, cerca del Castillo de Chapultepec / Metro Chapultepec (Línea 1)",
            calificacion: "✈️✈️✈️ (3/5 — Cabina de Silencio con Música)",
            bitacora: "Una escala chiquita y tranquila entre árboles, con música suave de fondo y a veces algún concierto instrumental. Perfecto para leer, dibujar, meditar o simplemente bajarle al ritmo.",
            discrecion: "🟢 Alto / Calmado. Espacio de silencio: habla bajito y disfruta el momento.",
            extraInfo: "🕘 Abre de martes a domingo, de 9:00 a 16:00. Confirma el horario antes de ir.",
            mapsUrl: "https://maps.google.com/?q=Audiorama+Chapultepec",
            comoLlegar: { destino: "Audiorama Chapultepec", desde: ["Metro Chapultepec", "Castillo de Chapultepec", "Metro Constituyentes"] }
        },
        laberinto: {
            title: "Laberinto del Ajusco 🌿🧭",
            media: "./laberinto.MP4",
            isVideo: true,
            badge: "📍 Sur • ✈️✈️✈️✈️",
            zona: "Sur (Camino Viejo al Maninal 13, km 15 carretera Picacho-Ajusco, Tlalpan)",
            conexion: "Metro Taxqueña (Línea 2) → Tren Ligero hasta Estadio Banorte → camión a Santo Tomás Ajusco → baja en la \"Y\" y camina unos 15 min",
            calificacion: "✈️✈️✈️✈️ (4/5 — Misión Secreta en el Ajusco)",
            bitacora: "Un laberinto de arbustos de más de dos metros, con pasadizos trampa y callejones sin salida, al estilo de los castillos ingleses. Perderte aquí toma unos 20 minutos y la entrada incluye una casona tipo Tudor con museo.",
            discrecion: "🟢 Alto / Relajado. Plan de día en un lugar alejado del ruido; si te pierdes, el personal te ayuda.",
            extraInfo: "💵 Entrada: $100 adultos y $50 niños. 🕘 Lunes a domingo, 9:30 a 19:00. Es un viaje largo: sal temprano. Confirma precios y horarios antes de ir.",
            mapsUrl: "https://maps.google.com/?q=Laberinto+del+Ajusco",
            comoLlegar: { destino: "Laberinto del Ajusco Tlalpan", desde: ["Metro Taxqueña", "Estadio Banorte (Tren Ligero)", "Santo Tomás Ajusco"] }
        }
    },
    monchis: {
        oreo: {
            title: "Oreo Fritas Crujientes / Bolitas de Oreo 🍩",
            media: "./OREO.MP4",
            isVideo: true,
            badge: "🏠 Casa • 🍩 Dulce",
            calificacion: "✈️✈️✈️✈️ (4/5)",
            ingredientes: "2 paquetes de galletas Oreo, 2 cdas de queso crema y 200 g de chocolate blanco.",
            preparacion: "1. Triturar las galletas.\n2. Mezclar el polvo con el queso crema hasta formar una masa uniforme.\n3. Formar bolitas, sumergir en el chocolate blanco derretido y congelar 15 minutos."
        },
        salchichas: {
            title: "Salchichas BBQ de Ricardo Pérez 🌭💨",
            media: "./salchichasbbq.MP4",
            isVideo: true,
            badge: "🏠 Casa • 🍿 Salado / Bajón Express",
            calificacion: "✈️✈️✈️ (3/5)",
            ingredientes: "1 paquete de salchichas en rodajas, mantequilla, salsa BBQ, catsup, salsa picante y refresco de cola.",
            preparacion: "1. Dora las salchichas en mantequilla.\n2. Añade BBQ, catsup, salsa picante y el chorrito de refresco de cola para caramelizar a fuego lento."
        },
        salchicha_hawaiana: {
            title: "Salchichas Hawaianas Glaseadas 🌭🍍",
            media: "./salchicha.MP4",
            isVideo: true,
            badge: "🏠 Casa • 🍿 Salado",
            calificacion: "✈️✈️✈️✈️ (4/5)",
            ingredientes: "Salchichas en rodajas, piña en almíbar en trozos, tocino picado y salsa BBQ.",
            preparacion: "1. Sofreír el tocino.\n2. Agregar salchichas y piña.\n3. Bañar con salsa BBQ y dejar reducir hasta glasear."
        },
        pan_muerto: {
            title: "Pan de Muerto Relleno con Magnum 🍞🍫",
            media: "./pan-de-muerto.MP4",
            isVideo: true,
            badge: "🏠 Casa • 🍩 Dulce / Choque Térmico",
            calificacion: "✈️✈️✈️✈️✈️ (5/5)",
            ingredientes: "1 pan de muerto azucarado, 1 paleta Magnum entera y jarabe de chocolate.",
            preparacion: "1. Introduce la paleta Magnum en el pan.\n2. Pásalo por la sandwichera 3 minutos hasta que el pan quede crujiente por fuera y cremoso por dentro."
        },
        pizzadog: {
            title: "PizzaDog Express 🍕🌭",
            media: "./pizza-dog.MP4",
            isVideo: true,
            badge: "🏠 Casa • 🍿 Salado",
            calificacion: "✈️✈️✈️✈️ (4/5)",
            ingredientes: "Salchicha envuelta en tocino, pan para hot dog, salsa marinara y queso mozzarella.",
            preparacion: "1. Dora la salchicha envuelta en tocino.\n2. Monta sobre el pan con salsa marinara y queso.\n3. Mételo 1 minuto al microondas."
        },
        sandwich: {
            title: "Sándwich Monchoso de 3 Pisos 🥪🧀",
            media: "./sandwich.MP4",
            isVideo: true,
            badge: "🏠 Casa • 🍿 Salado",
            calificacion: "✈️✈️✈️✈️ (4/5)",
            ingredientes: "3 rebanadas de pan de caja, mantequilla, queso manchego, cheddar y americano con jamón y tocino.",
            preparacion: "1. Mantequilla por fuera.\n2. Arma los pisos intercalando quesos y carnes en sartén a fuego bajo."
        },
        cotorras: {
            title: "Las Cotorras 🌮🍻",
            media: "./cotorras.MP4",
            isVideo: true,
            badge: "📍 Centro • 🍿 Salado",
            ubicacion: "📍 Centro CDMX (Cerca de Metro Bellas Artes / Allende)",
            calificacion: "✈️✈️✈️✈️ (4/5)",
            tipo: "🔴 Salado / Tradicional",
            resena: "Tacos de guisado gigantes cosidos en tortilla doble hecha a mano, acompañados con arroz, frijoles y micheladas preparadas.",
            presupuesto: "💸 Económico ($100 - $150)",
            mapsUrl: "https://maps.google.com/?q=Las+Cotorras+CDMX"
        },
        sugar_daddy: {
            title: "Dulcería Sugar Daddy 🍭🍬",
            media: "./cotorras.MP4",
            isVideo: true,
            badge: "📍 Calle • 🔴 Nivel Monstruo",
            ubicacion: "📍 Fernando Iglesias Calderón 91, Jardín Balbuena",
            calificacion: "✈️✈️✈️✈️✈️ (5/5 — Sello de Garantía)",
            tipo: "🔴 Nivel Monstruo / Aterrizaje Ultra Dulce",
            resena: "Preparaciones de gomitas, cacahuates y botanas mezclando lo dulce con lo acidito.",
            presupuesto: "💸 Económico ($100 - $200)",
            horario: "🕒 Abierto hasta las 9:30 PM.",
            mapsUrl: "https://maps.google.com/?q=Fernando+Iglesias+Calderon+91+Jardin+Balbuena"
        },
        losperros: {
            title: "Los Perros de San Antonio 🌭🥓",
            media: "./losperros.MP4",
            isVideo: true,
            badge: "📍 Calle • 🍿 Salado",
            ubicacion: "📍 Sur CDMX (Metro San Antonio, Línea 7)",
            calificacion: "✈️✈️✈️✈️✈️ (5/5 — Sello de Garantía)",
            tipo: "🔴 Nivel Monstruo / Grasoso y Caliente",
            resena: "Hot dogs estilo jumbo envueltos en tocino, bañados con queso fundido y champiñones.",
            presupuesto: "💸 Económico ($120 - $180)",
            mapsUrl: "https://maps.google.com/?q=Metro+San+Antonio+CDMX"
        },
        burgergate: {
            title: "Burger Gate 🍔🔥",
            media: "./burgerg.MP4",
            isVideo: true,
            badge: "📍 Calle • 🍿 Salado",
            ubicacion: "📍 Centro / Zona Rosa (Metro Insurgentes, Línea 1)",
            calificacion: "✈️✈️✈️✈️✈️ (5/5 — Sello de Garantía)",
            tipo: "🔴 Smash Burgers / Atascado",
            resena: "Smash burgers con doble carne crujiente, costra de queso manchego y mermelada de tocino.",
            presupuesto: "💸 Intermedio ($150 - $250)",
            mapsUrl: "https://maps.google.com/?q=Burger+Gate+Zona+Rosa+CDMX"
        }
    },
    cine: {
        robots: {
            title: "LOVE, DEATH & ROBOTS 🤖🌀",
            media: "./robots.MP4",
            isVideo: true,
            badge: "🎬 Antología Animada • ✈️✈️✈️✈️✈️",
            categoria: "Psicodelia & Animación / Sci-Fi",
            plataforma: "Netflix",
resena: "Despegue directo a otra dimensión. Cada episodio es un vuelo distinto: animación hiperreal, sci-fi sucio, humor negro y criaturas que no deberías mirar mucho tiempo. Es de esas antologías para ver con la tripulación completa y las turbinas encendidas: pones uno, y cuando te das cuenta ya llevas cinco.",
            links: [{ label: "Netflix", url: "https://www.netflix.com/search?q=Love%20Death%20%26%20Robots" }]
        },
        congreso: {
            title: "THE CONGRESS (2013) 👁️🎭",
            media: "./congreso.MP4",
            isVideo: true,
            badge: "🎬 Animación Surrealista • ✈️✈️✈️✈️✈️",
            categoria: "Psicodelia & Animación / Viaje Mental",
            plataforma: "Apple TV / Prime Video",
resena: "Altitud mental máxima. Una actriz vende su imagen digital y la película se desarma en un viaje animado de colores que se derriten, avatares y realidades que ya no sabes cuál es la tuya. Pónla cuando quieras que el cerebro dé vueltas en el aire. Piloto automático no recomendado.",
            links: [{ label: "Apple TV", url: "https://tv.apple.com/search?term=The%20Congress%202013" }, { label: "Prime Video", url: "https://www.primevideo.com/search?phrase=The%20Congress%202013" }]
        },
        grasa_fria: {
            title: "CHILLED GREESE 🍟🚗",
            media: "./grasa-fria.MP4",
            isVideo: true,
            badge: "🎬 Comedia Absurda • ✈️✈️✈️",
            categoria: "Comedia Absurda & Risas",
            plataforma: "TikTok / YouTube",
resena: "Escala exprés de risa. Conversaciones reales de las 3 a.m. dentro del coche, animadas de forma simple y absurda. Es perfecta para el aterrizaje suave: cortita, ligera y te deja con la panza adolorida de tanto reír. Ideal para el bajón.",
            links: [{ label: "YouTube", url: "https://www.youtube.com/results?search_query=Chilled%20Greese%20animaci%C3%B3n" }, { label: "TikTok", url: "https://www.tiktok.com/search?q=Chilled%20Greese" }]
        },
        entergalactic: {
            title: "ENTERGALACTIC 🎨🌌",
            media: "./ENTERGALACTIC.MP4",
            isVideo: true,
            badge: "🎨 Animación & Romance • ✈️✈️✈️✈️",
            categoria: "Animación / Romance Urbano & Psicodelia",
            plataforma: "Netflix",
resena: "Neón, romance y Nueva York en modo galaxia. Creada por Kid Cudi: cada cuadro parece un mural y el soundtrack te mantiene flotando sin turbulencia. Es la que pones cuando quieres vibra bonita, colores intensos y cero estrés.",
            links: [{ label: "Netflix", url: "https://www.netflix.com/search?q=Entergalactic" }]
        },
        goodtrip: {
            title: "HAVE A GOOD TRIP 🍄🧠",
            media: "./GOOD-TRIP.MP4",
            isVideo: true,
            badge: "🍿 Documental & Comedia • ✈️✈️✈️✈️",
            categoria: "Documental / Comedia",
            plataforma: "Netflix",
resena: "Bitácora de viajes ajenos. Famosos cuentan sus historias más locas y las animaciones las recrean con humor y colores de otro planeta. Es para reírte, sorprenderte y sentir que no eres el único que ha tenido un vuelo raro. Compañía perfecta para cualquier sesión.",
            links: [{ label: "Netflix", url: "https://www.netflix.com/search?q=Have%20a%20Good%20Trip" }]
        },
        puparia: {
            title: "PUPARIA 👁️✨",
            media: "./PUPARIA.MP4",
            isVideo: true,
            badge: "🍿 Cortometraje Anime • ✈️✈️✈️✈️✈️",
            categoria: "Cortometraje / Anime Surrealista",
            plataforma: "YouTube (Shingo Tamagawa)",
resena: "Tres minutos de ritual visual. Animación hecha a mano, colores que pegan directo al cerebro y una atmósfera mística que te deja con la boca abierta. Despega y aterriza rapidísimo: ideal si solo tienes unos minutos pero quieres volar alto.",
            links: [{ label: "YouTube", url: "https://www.youtube.com/results?search_query=PUPARIA%20Shingo%20Tamagawa" }]
        },
        belladonna: {
            title: "BELLADONNA OF SADNESS (1973) 🌸👁️",
            media: "./BELLADONNA.MP4",
            isVideo: true,
            badge: "🎬 Anime Clásico • ✈️✈️✈️✈️✈️",
            categoria: "Anime Clásico / Psicodelia 70s",
            plataforma: "MUBI / Prime Video",
resena: "Clásico de culto de los 70. Acuarelas que se mueven como sueños, jazz progresivo y una historia oscura y hermosa a la vez. No es para ver distraído: es para entrar despacio, apagar las luces y dejar que te lleve. Altitud máxima en cada cuadro.",
            links: [{ label: "MUBI", url: "https://mubi.com/es/search/films?query=Belladonna%20of%20Sadness" }, { label: "Prime Video", url: "https://www.primevideo.com/search?phrase=Belladonna%20of%20Sadness" }]
        },
        void: {
            title: "ENTER THE VOID (2009) 🏙️🌀",
            media: "./VOID.MP4",
            isVideo: true,
            badge: "🎬 Psicodélica & Inmersiva • ✈️✈️✈️✈️✈️",
            categoria: "Viaje Astral & Psicodelia Neón",
            plataforma: "MUBI / Tubi",
resena: "Aterrizaje forzoso en el Tokio neón. Gaspar Noé te mete en primera persona a un viaje astral: luces, sombras, colores y sonido que te atraviesan. Es intensa, sin filtros y solo para tripulación que ya tiene experiencia en vuelos largos.",
            links: [{ label: "MUBI", url: "https://mubi.com/es/search/films?query=Enter%20the%20Void" }, { label: "Tubi", url: "https://tubitv.com/search/Enter%20the%20Void" }]
        },
        dandadan: {
            title: "DANDADAN 👾🛸",
            media: "./dandadan.MP4",
            isVideo: true,
            badge: "🎬 Anime Sci-Fi • ✈️✈️✈️✈️✈️",
            categoria: "Anime / Sci-Fi & Yokai",
            plataforma: "Netflix / Crunchyroll",
resena: "Aliens, fantasmas y adolescentes en una sola cabina. Explosión de neón, humor loco y animación tan fluida que no puedes parpadear. Es la que pones cuando quieres energía pura, acción y cero ganas de que se acabe el episodio.",
            links: [{ label: "Netflix", url: "https://www.netflix.com/search?q=Dandadan" }, { label: "Crunchyroll", url: "https://www.crunchyroll.com/search?q=Dandadan" }]
        },
        neotokyo: {
            title: "NEO TOKYO (1987) 🏍️🌃",
            media: "./neotokyo.MP4",
            isVideo: true,
            badge: "🎬 Cyberpunk Vintage • ✈️✈️✈️✈️",
            categoria: "Anime Sci-Fi / Cyberpunk Vintage",
            plataforma: "YouTube / Prime Video",
resena: "Cyberpunk vintage en tres cortos. Magia, ciudades futuristas y robots dibujados por leyendas del anime de los 80. Es una cápsula del tiempo: viejita, rara y bellísima. Perfecta para una escala corta con mucho estilo.",
            links: [{ label: "YouTube", url: "https://www.youtube.com/results?search_query=Neo%20Tokyo%201987%20anime" }, { label: "Prime Video", url: "https://www.primevideo.com/search?phrase=Neo%20Tokyo%201987" }]
        },
        pastoral: {
            title: "PASTORAL: TO DIE IN THE COUNTRY (1974) 🎭🎪",
            media: "./pastoral.MP4",
            isVideo: true,
            badge: "🎬 Cine Experimental • ✈️✈️✈️✈️✈️",
            categoria: "Cine Experimental / Surrealismo",
            plataforma: "MUBI / Cineteca",
resena: "Teatro, sueño y colores primarios saturados. Shūji Terayama rompe la pantalla con escenas que parecen performance en vivo. Es una nave experimental que no te explica nada: tú pones la interpretación y la vibra se encarga de lo demás.",
            links: [{ label: "MUBI", url: "https://mubi.com/es/search/films?query=Pastoral%20To%20Die%20in%20the%20Country" }]
        }
    },
    music: {
        dubside: {
            title: "DUB SIDE OF THE MOON — Easy Star All-Stars 🎧",
            media: "./dub.png",
            isVideo: false,
            badge: "🌀 Trip Conceptual",
            categoria: "Trip Conceptual / Reggae Dub",
            plataforma: "Spotify / Apple Music / YouTube",
resena: "Pink Floyd en modo reggae. Cada rola del clásico álbum baja las revoluciones a ritmo dub: bajos gordos, ecos largos y un viaje conceptual que flota. Ponlo de fondo cuando la tripulación quiera nivelar la presión sin prisa.",
            links: [{ label: "Spotify", url: "https://open.spotify.com/search/Dub%20Side%20of%20the%20Moon%20Easy%20Star%20All-Stars" }, { label: "YouTube", url: "https://www.youtube.com/results?search_query=Dub%20Side%20of%20the%20Moon%20Easy%20Star%20All-Stars" }]
        }
    }
};