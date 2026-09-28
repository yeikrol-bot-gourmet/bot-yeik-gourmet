require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Groq } = require("groq-sdk");
const { Client, LocalAuth } = require('whatsapp-web.js');

// ======================================================
// CONFIGURACIÓN Y CONSTANTES
// ======================================================

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "yeik-gourmet" }),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            ...
        ]
    }
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const NUMERO_TITULAR = "3017237672";
const LLAVE_PAGO = "0091587387";
const PEDIDO_MINIMO = 10000;

// Configuración Domicilio (Madrid, Cundinamarca)
const COSTO_DOMICILIO_FORANEO = 3000;
const ZONAS_NORTE_MADRID = [
    "norte", "la prosperidad", "quintashis", "el sosiego", 
    "san jose", "los pinos", "hacienda los cerezos", "san pedro"
];

const CARPETA_PRODUCTOS = path.join(__dirname, "productos");
const CARPETA_DATOS = path.join(__dirname, "datos");
const ARCHIVO_CLIENTES = path.join(CARPETA_DATOS, "clientes.json");

if (!fs.existsSync(CARPETA_PRODUCTOS)) fs.mkdirSync(CARPETA_PRODUCTOS, { recursive: true });
if (!fs.existsSync(CARPETA_DATOS)) fs.mkdirSync(CARPETA_DATOS, { recursive: true });

// ======================================================
// MENÚ OFICIAL COMPLETO Y MOLDEABLE
// ======================================================

const MENU = {
    // PLATOS PRINCIPALES
    hamburguesa: { nombre: "Hamburguesa 🍔", precio: 15000, aliases: ["hamburguesa", "hamburguesas", "burger", "burguer"] },
    perro: { nombre: "Perro caliente 🌭", precio: 10000, aliases: ["perro", "perro caliente", "perros", "perritos"] },
    rellena: { nombre: "Rellena (Libra) 🩸", precio: 8000, aliases: ["rellena", "rellenas", "libra de rellena", "rellena libra", "morcilla"] },
    
    // ACOMPAÑAMIENTOS Y ENTRADAS
    papa_rellena: { nombre: "Papa Rellena 🥔🥟", precio: 3000, aliases: ["papa rellena", "papas rellenas", "papa rellena", "papas rellena"] },
    papas: { nombre: "Porción de Papas a la Francesa 🍟", precio: 4000, aliases: ["papas", "papa", "papas francesas", "papas a la francesa", "porcion de papas"] },
    chanchito: { nombre: "Chanchito 🐷", precio: 3000, aliases: ["chanchito", "chanchitos"] },
    aborrajado: { nombre: "Aborrajado 🍌", precio: 3000, aliases: ["aborrajado", "aborrajados"] },
    empanada: { nombre: "Empanada 🥟", precio: 1000, aliases: ["empanada", "empanadas"] },
    chorizo: { nombre: "Chorizo 🌭", precio: 6000, aliases: ["chorizo", "chorizos"] },
    
    // BEBIDAS Y CERVEZAS (CON SABORES DETALLADOS)
    gaseosa: { 
        nombre: "Gaseosa Personal (400ml) 🥤", 
        precio: 3500, 
        aliases: [
            "gaseosa", "gaseosas", "bebida", "refresco", "gaseosa personal",
            "coca cola", "cocacola", "coca", "zero", "coca cola zero",
            "pepsi", "postobon", "colombiana", "manzana", "manzana postobon",
            "sprite", "quatro", "4tro", "hit", "jugo hit"
        ] 
    },
    gaseosa_litro: { 
        nombre: "Gaseosa Familiar (1.25L / 1.5L) 🥤🍾", 
        precio: 6000, 
        aliases: [
            "gaseosa litro", "gaseosa grande", "gaseosa familiar", "litro de gaseosa", 
            "gaseosa 1.5", "gaseosa 1.25", "coca cola litro", "cocacola grande", 
            "colombiana litro", "manzana litro", "pepsi litro"
        ] 
    },
    cerveza_litro: { nombre: "Cerveza Litro (Litrón) 🍺", precio: 8000, aliases: ["litron", "cerveza litro", "litro de cerveza", "cerveza grande"] },
    sixpack_cerveza: { nombre: "Six-Pack Cerveza (6 Latas) 🍻", precio: 22000, aliases: ["sixpack", "six pack", "six pack cerveza", "seis cervezas", "sixpack de cerveza", "poker sixpack", "aguila sixpack"] },

    // COMBOS PREESTABLECIDOS / SUGERIDOS
    combo_hamburguesa_papas: { nombre: "Combo Hamburguesa + Papas 🍔🍟", precio: 18000, aliases: ["hamburguesa con papas", "combo hamburguesa papas", "hamburguesa y papas"] },
    combo_perro_papas: { nombre: "Combo Perro + Papas 🌭🍟", precio: 13000, aliases: ["perro con papas", "combo perro papas", "perro y papas"] },
    trio_hamburguesa: { nombre: "Combo Trío Hamburguesa (Burguer + Papas + Gaseosa) 🍔🍟🥤", precio: 20500, aliases: ["combo trio hamburguesa", "hamburguesa completa", "hamburguesa con papas y gaseosa", "combo completo hamburguesa"] },
    trio_perro: { nombre: "Combo Trío Perro (Perro + Papas + Gaseosa) 🍔🍟🥤", precio: 15500, aliases: ["combo trio perro", "perro completo", "perro con papas y gaseosa", "combo completo perro"] },
    combo_familiar_hamburguesa: { nombre: "Combo Familiar Burguers (2 Burguers + Papas + Gaseosa 1.5L) 🍔🍔🍟🥤", precio: 42000, aliases: ["combo familiar hamburguesa", "combo pareja hamburguesa", "combo 2 hamburguesas"] },
    combo_familiar_perro: { nombre: "Combo Familiar Perros (2 Perros + Papas + Gaseosa 1.5L) 🌭🌭🍟🥤", precio: 32000, aliases: ["combo familiar perro", "combo pareja perro", "combo 2 perros"] },
    combo_cervecero_hamburguesa: { nombre: "Combo Cervecero Burguer (2 Burguers + Papas + Six-Pack) 🍔🍔🍟🍻", precio: 56000, aliases: ["combo cervecero hamburguesa", "combo cerveza hamburguesa", "combo amigos hamburguesa"] },
    combo_cervecero_perro: { nombre: "Combo Cervecero Perro (2 Perros + Papas + Six-Pack) 🌭🌭🍟🍻", precio: 46000, aliases: ["combo cervecero perro", "combo cerveza perro", "combo amigos perro"] }
};

// ======================================================
// PERSISTENCIA DE CLIENTES
// ======================================================

let clientes = {};

function cargarClientes() {
    try {
        if (fs.existsSync(ARCHIVO_CLIENTES)) {
            const raw = fs.readFileSync(ARCHIVO_CLIENTES, "utf8");
            clientes = JSON.parse(raw || "{}");
        }
    } catch (error) {
        console.error("❌ Error leyendo clientes:", error);
        clientes = {};
    }
}

let timeoutGuardado = null;
function guardarClientes() {
    if (timeoutGuardado) clearTimeout(timeoutGuardado);
    timeoutGuardado = setTimeout(() => {
        try {
            fs.writeFileSync(ARCHIVO_CLIENTES, JSON.stringify(clientes, null, 2));
        } catch (error) {
            console.error("❌ Error guardando clientes:", error);
        }
    }, 1000);
}

cargarClientes();

function obtenerCliente(numero) {
    if (!clientes[numero]) {
        clientes[numero] = {
            nombre: "",
            direccion: "",
            barrio: "",
            costoDomicilio: 0,
            formaPago: "",
            carrito: {},
            estado: "inicio",
            ultimoPedido: null,
            fechaActualizacion: new Date().toISOString()
        };
        guardarClientes();
    }
    return clientes[numero];
}

// ======================================================
// UTILIDADES
// ======================================================

function normalizar(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function dinero(valor) {
    return "$" + Number(valor).toLocaleString("es-CO");
}

function escaparTexto(texto) {
    return String(texto || "").replace(/\s+/g, " ").trim();
}

function calcularCostoDomicilio(direccionTexto) {
    const dirNorm = normalizar(direccionTexto);
    const esZonaNorte = ZONAS_NORTE_MADRID.some(zona => dirNorm.includes(zona));
    return esZonaNorte ? 0 : COSTO_DOMICILIO_FORANEO;
}

// ======================================================
// DETECCIONES Y ANALIZADORES
// ======================================================

function detectarProductos(texto) {
    const t = normalizar(texto);
    const encontrados = [];

    const ordenBusqueda = [
        "combo_cervecero_hamburguesa", "combo_cervecero_perro",
        "combo_familiar_hamburguesa", "combo_familiar_perro",
        "trio_hamburguesa", "trio_perro", 
        "combo_hamburguesa_papas", "combo_perro_papas", 
        "sixpack_cerveza", "cerveza_litro", "gaseosa_litro",
        "papa_rellena", "hamburguesa", "perro", "rellena", "papas", 
        "chanchito", "aborrajado", "empanada", "chorizo", "gaseosa"
    ];

    for (const id of ordenBusqueda) {
        const producto = MENU[id];
        for (const alias of producto.aliases) {
            if (t.includes(normalizar(alias))) {
                if (!encontrados.includes(id)) encontrados.push(id);
                break;
            }
        }
    }

    if (encontrados.includes("papa_rellena")) {
        const idxPapas = encontrados.indexOf("papas");
        if (idxPapas !== -1 && !t.includes("papas a la francesa") && !t.includes("papas francesas")) {
            encontrados.splice(idxPapas, 1);
        }
    }

    if (encontrados.includes("combo_cervecero_hamburguesa") || encontrados.includes("combo_familiar_hamburguesa")) {
        ["hamburguesa", "papas", "gaseosa", "sixpack_cerveza", "combo_hamburguesa_papas", "trio_hamburguesa"].forEach(i => {
            const idx = encontrados.indexOf(i);
            if (idx !== -1) encontrados.splice(idx, 1);
        });
    }

    if (encontrados.includes("combo_cervecero_perro") || encontrados.includes("combo_familiar_perro")) {
        ["perro", "papas", "gaseosa", "sixpack_cerveza", "combo_perro_papas", "trio_perro"].forEach(i => {
            const idx = encontrados.indexOf(i);
            if (idx !== -1) encontrados.splice(idx, 1);
        });
    }

    if (encontrados.includes("trio_hamburguesa")) {
        ["hamburguesa", "papas", "gaseosa", "combo_hamburguesa_papas"].forEach(i => {
            const idx = encontrados.indexOf(i);
            if (idx !== -1) encontrados.splice(idx, 1);
        });
    }

    if (encontrados.includes("trio_perro")) {
        ["perro", "papas", "gaseosa", "combo_perro_papas"].forEach(i => {
            const idx = encontrados.indexOf(i);
            if (idx !== -1) encontrados.splice(idx, 1);
        });
    }

    return encontrados;
}

function detectarCantidad(texto) {
    const t = normalizar(texto);
    const palabras = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 };

    for (const [palabra, numero] of Object.entries(palabras)) {
        if (new RegExp(`\\b${palabra}\\b`, "i").test(t)) return numero;
    }
    const match = t.match(/\b([1-9]|10)\b/);
    return match ? parseInt(match[1]) : 1;
}

function calcularTotal(cliente) {
    let subtotal = 0;
    for (const [id, cantidad] of Object.entries(cliente.carrito)) {
        if (MENU[id]) subtotal += MENU[id].precio * cantidad;
    }
    return subtotal;
}

function generarResumen(cliente) {
    const lineas = [];
    for (const [id, cantidad] of Object.entries(cliente.carrito)) {
        const prod = MENU[id];
        if (!prod) continue;
        lineas.push(`  ▪ ${cantidad}x ${prod.nombre} ➡️ *${dinero(prod.precio * cantidad)}*`);
    }

    if (lineas.length === 0) {
        return "🛒 *TU CARRITO ESTÁ VACÍO* 🛒\n\n¡Arma tu pedido o elige uno de nuestros combos deliciosos! 🍔🌭🍟🥤🍺";
    }

    const subtotal = calcularTotal(cliente);
    const costoDom = cliente.costoDomicilio || 0;
    const totalFinal = subtotal + costoDom;
    
    let ficha = "🧾 *RESUMEN DE TU PEDIDO* 🧾\n\n";
    ficha += lineas.join("\n") + "\n\n";
    ficha += "-----------------------------------\n";
    ficha += `Subtotal productos: ${dinero(subtotal)}\n`;
    
    if (cliente.direccion) {
        if (costoDom === 0) {
            ficha += `🛵 Domicilio (Zona Norte Madrid): *GRATIS*\n`;
        } else {
            ficha += `🛵 Domicilio (Fuera Zona Norte): *${dinero(costoDom)}*\n`;
        }
    }

    ficha += `💰 *SUMA TOTAL: ${dinero(totalFinal)}*\n`;
    ficha += "-----------------------------------\n\n";
    ficha += "💳 *MEDIOS DE PAGO DISPONIBLES:*\n";
    ficha += "💵 Efectivo contra entrega\n";
    ficha += `📲 Transferencia Nequi / Daviplata:\n    👉 *${LLAVE_PAGO}*`;

    return ficha;
}

function obtenerSugerenciaDinamica(cliente) {
    const carrito = cliente.carrito;
    if (carrito.hamburguesa && !carrito.papas && !carrito.gaseosa) {
        return "\n\n💡 *Tip Yeik Gourmet:* ¡Añade una porción de papas ($4.000) o una Papa Rellena ($3.000) para armar un combo perfecto! 🍟🥟";
    }
    if (carrito.perro && !carrito.papas && !carrito.gaseosa) {
        return "\n\n💡 *Sugerencia:* ¿Te agregamos unas papas a la francesa ($4.000) o una gaseosa personal de tu sabor favorito ($3.500)? 🌭🍟🥤";
    }
    if ((carrito.hamburguesa || carrito.perro) && (carrito.papas || carrito.papa_rellena) && !carrito.gaseosa) {
        return "\n\n💡 *¡Casi listo tu combo!* ¿Le sumamos una gaseosa helada (Coca-Cola, Colombiana, Manzana, Quatro) ($3.500) o un Litrón de cerveza ($8.000)? 🥤🍺";
    }
    return "\n\n¿Quieres agregar algo más a tu pedido o escribes *LISTO* para ingresar tu dirección? 🛵✨";
}

function mostrarMenu() {
    let mensaje = "✨ *MENÚ OFICIAL - YEIK GOURMET* ✨\n\n¡Puedes combinar los productos que quieras para armar tu combo ideal! 🤤👇\n\n";
    mensaje += "🔥 *PLATOS PRINCIPALES*\n";
    mensaje += `• ${MENU.hamburguesa.nombre} — *${dinero(MENU.hamburguesa.precio)}*\n`;
    mensaje += `• ${MENU.perro.nombre} — *${dinero(MENU.perro.precio)}*\n`;
    mensaje += `• ${MENU.rellena.nombre} — *${dinero(MENU.rellena.precio)}*\n\n`;

    mensaje += "🥟 *ACOMPAÑAMIENTOS Y ENTRADAS*\n";
    mensaje += `• ${MENU.papa_rellena.nombre} — *${dinero(MENU.papa_rellena.precio)}*\n`;
    mensaje += `• ${MENU.papas.nombre} — *${dinero(MENU.papas.precio)}*\n`;
    mensaje += `• ${MENU.chanchito.nombre} — *${dinero(MENU.chanchito.precio)}*\n`;
    mensaje += `• ${MENU.aborrajado.nombre} — *${dinero(MENU.aborrajado.precio)}*\n`;
    mensaje += `• ${MENU.chorizo.nombre} — *${dinero(MENU.chorizo.precio)}*\n`;
    mensaje += `• ${MENU.empanada.nombre} — *${dinero(MENU.empanada.precio)}*\n\n`;

    mensaje += "🥤 *BEBIDAS Y CERVEZAS*\n";
    mensaje += `• ${MENU.gaseosa.nombre} — *${dinero(MENU.gaseosa.precio)}*\n`;
    mensaje += `  _(Sabores: Coca-Cola, Coca-Cola Zero, Colombiana, Manzana, Pepsi, Quatro, Sprite, Hit)_\n`;
    mensaje += `• ${MENU.gaseosa_litro.nombre} — *${dinero(MENU.gaseosa_litro.precio)}*\n`;
    mensaje += `• ${MENU.cerveza_litro.nombre} — *${dinero(MENU.cerveza_litro.precio)}*\n`;
    mensaje += `• ${MENU.sixpack_cerveza.nombre} — *${dinero(MENU.sixpack_cerveza.precio)}*\n\n`;

    mensaje += "⭐ *COMBOS POPULARES SUGERIDOS* ⭐\n";
    mensaje += `• ${MENU.combo_hamburguesa_papas.nombre} — *${dinero(MENU.combo_hamburguesa_papas.precio)}*\n`;
    mensaje += `• ${MENU.trio_hamburguesa.nombre} — *${dinero(MENU.trio_hamburguesa.precio)}*\n`;
    mensaje += `• ${MENU.combo_familiar_hamburguesa.nombre} — *${dinero(MENU.combo_familiar_hamburguesa.precio)}*\n`;
    mensaje += `• ${MENU.combo_cervecero_hamburguesa.nombre} — *${dinero(MENU.combo_cervecero_hamburguesa.precio)}*\n\n`;

    mensaje += `🛒 *Pedido mínimo para domicilio:* ${dinero(PEDIDO_MINIMO)}\n🛵 *Domicilio:* GRATIS en Zona Norte de Madrid, Cund. / ${dinero(COSTO_DOMICILIO_FORANEO)} para otras zonas.\n\n💡 *Llave Nequi / Daviplata:* *${LLAVE_PAGO}*\n\n¡Simplemente dime qué te gustaría ordenar! 🎉`;
    return mensaje;
}

function mostrarEjemplosCombos() {
    let mensaje = "🌟 *EJEMPLOS DE COMBOS QUE PUEDES ARMAR* 🌟\n\n";
    mensaje += "🔥 *1. Opciones Personales*\n";
    mensaje += `• *Burguer + Papa Rellena:* 1 Hamburguesa + 1 Papa Rellena = *${dinero(MENU.hamburguesa.precio + MENU.papa_rellena.precio)}*\n`;
    mensaje += `• *Trío Burguer Completo:* Hamburguesa + Papas + Gaseosa = *${dinero(MENU.trio_hamburguesa.precio)}*\n`;
    mensaje += `• *Trío Perro Completo:* Perro Caliente + Papas + Gaseosa = *${dinero(MENU.trio_perro.precio)}*\n\n`;

    mensaje += "👥 *2. Opciones Para Compartir*\n";
    mensaje += `• *Combo Pareja Burguer:* 2 Burguers + Papas + Gaseosa 1.5L = *${dinero(MENU.combo_familiar_hamburguesa.precio)}*\n`;
    mensaje += `• *Combo Pareja Perro:* 2 Perros + Papas + Gaseosa 1.5L = *${dinero(MENU.combo_familiar_perro.precio)}*\n\n`;

    mensaje += "🍻 *3. Combos Cerveceros*\n";
    mensaje += `• *Combo Cervecero Burguer:* 2 Burguers + Papas + Six-Pack = *${dinero(MENU.combo_cervecero_hamburguesa.precio)}*\n`;
    mensaje += `• *Combo Cervecero Perro:* 2 Perros + Papas + Six-Pack = *${dinero(MENU.combo_cervecero_perro.precio)}*\n\n`;

    mensaje += `💳 *Llave Nequi/Daviplata:* *${LLAVE_PAGO}*\n\n✨ *¡Elige cualquiera o arma el tuyo libremente!*`;
    return mensaje;
}

// ======================================================
// MANEJO DE CARRITO
// ======================================================

function agregarAlCarrito(cliente, productoId, cantidad) {
    if (!MENU[productoId]) return;
    cliente.carrito[productoId] = (cliente.carrito[productoId] || 0) + cantidad;
    cliente.estado = "tomando_pedido";
    guardarClientes();
}

function quitarDelCarrito(cliente, productoId, cantidad) {
    if (!cliente.carrito[productoId]) return;
    cliente.carrito[productoId] -= cantidad;
    if (cliente.carrito[productoId] <= 0) delete cliente.carrito[productoId];
    guardarClientes();
}

function vaciarCarrito(cliente) {
    cliente.carrito = {};
    cliente.costoDomicilio = 0;
    guardarClientes();
}

// ======================================================
// MENSAJES Y MEDIOS
// ======================================================

async function enviarMensajeSeguro(message, texto) {
    try {
        await message.reply(texto);
        return true;
    } catch {
        try {
            await client.sendMessage(message.from, texto);
            return true;
        } catch (error2) {
            console.error("❌ Error enviando mensaje:", error2.message);
            return false;
        }
    }
}

// ======================================================
// IA GROQ (ASISTENTE INTEGRADO)
// ======================================================

async function preguntarGroq(texto) {
    try {
        const respuesta = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `Eres el asistente virtual entusiasta de Yeik Gourmet. Menú: Hamburguesas ($15.000), Perros ($10.000), Rellena ($8.000 libra), Papa Rellena ($3.000), Papas ($4.000), Chanchitos ($3.000), Aborrajados ($3.000), Empanadas ($1.000), Chorizo ($6.000), Gaseosas ($3.500/$6.000) (Sabores disponibles: Coca-Cola, Coca-Cola Zero, Colombiana, Manzana, Pepsi, Quatro, Sprite, Hit), Cerveza Litro ($8.000) y Six-Pack ($22.000). Domicilio: Gratis para zonas norte de Madrid Cundinamarca, $3.000 para zonas fuera del norte. Llave Nequi/Daviplata: ${LLAVE_PAGO}. Sé súper amable, claro y usa emojis.`
                },
                { role: "user", content: texto }
            ],
            temperature: 0.3,
            max_tokens: 150
        });
        return respuesta.choices?.[0]?.message?.content?.trim() || null;
    } catch (error) {
        console.error("❌ Error Groq:", error.message);
        return null;
    }
}

async function notificarTitular(cliente, numeroCliente) {
    try {
        const resumen = generarResumen(cliente);
        const subtotal = calcularTotal(cliente);
        const totalConDomicilio = subtotal + (cliente.costoDomicilio || 0);
        
        const mensaje =
            `🚨 *NUEVO PEDIDO CONFIRMADO* 🛵🔥\n\n` +
            `📱 *Cliente:* ${numeroCliente}\n` +
            `📍 *Dirección:* ${cliente.direccion || "No registrada"}\n` +
            `🛵 *Costo Domicilio:* ${dinero(cliente.costoDomicilio || 0)}\n` +
            `💳 *Método de Pago:* ${cliente.formaPago || "No registrado"}\n\n` +
            `${resumen}\n\n` +
            `💰 *TOTAL A COBRAR: ${dinero(totalConDomicilio)}*`;

        await client.sendMessage(`${NUMERO_TITULAR}@c.us`, mensaje);
    } catch (error) {
        console.error("❌ Error notificando al titular:", error.message);
    }
}

// ======================================================
// FLUJO DE PEDIDOS
// ======================================================

async function confirmarPedido(message, cliente) {
    const subtotal = calcularTotal(cliente);

    if (subtotal < PEDIDO_MINIMO) {
        await enviarMensajeSeguro(
            message,
            `⚠️ *¡Casi lo logramos!* El pedido mínimo para domicilio es de *${dinero(PEDIDO_MINIMO)}*.\n\n` +
            `Tu pedido suma *${dinero(subtotal)}*.\n\n` +
            `¿Te gustaría agregar una Papa Rellena ($3.000) o una gaseosa ($3.500) para completar el valor? 🥟🥤✨`
        );
        cliente.estado = "tomando_pedido";
        guardarClientes();
        return;
    }

    const totalFinal = subtotal + (cliente.costoDomicilio || 0);

    cliente.ultimoPedido = {
        fecha: new Date().toISOString(),
        carrito: { ...cliente.carrito },
        subtotal: subtotal,
        costoDomicilio: cliente.costoDomicilio || 0,
        total: totalFinal,
        direccion: cliente.direccion,
        formaPago: cliente.formaPago
    };

    const resumen = generarResumen(cliente);

    await enviarMensajeSeguro(
        message,
        `🎉 ¡*PEDIDO CONFIRMADO EXITOSAMENTE*! 🎉\n\n` +
        `${resumen}\n\n` +
        `📍 *Dirección de Entrega:* ${cliente.direccion}\n` +
        `💳 *Método de Pago:* ${cliente.formaPago}\n\n` +
        `¡Muchas gracias por elegir *Yeik Gourmet*! ❤️🔥\n` +
        `Tu pedido ya está en preparación. 👨‍🍳🛵`
    );

    await notificarTitular(cliente, message.from);

    vaciarCarrito(cliente);
    cliente.estado = "inicio";
    guardarClientes();
}

async function procesarProductos(message, cliente, texto) {
    const productos = detectarProductos(texto);
    if (productos.length === 0) return false;

    const cantidad = detectarCantidad(texto);

    for (const productoId of productos) {
        agregarAlCarrito(cliente, productoId, cantidad);
    }

    const sugerencia = obtenerSugerenciaDinamica(cliente);

    await enviarMensajeSeguro(
        message,
        `✅ ¡Añadido al carrito con éxito! 😋🎉\n\n` +
        `${generarResumen(cliente)}` +
        `${sugerencia}`
    );
    return true;
}

// ======================================================
// PROCESADOR DE MENSAJES PRINCIPAL
// ======================================================

async function procesarMensaje(message) {
    if (message.from.endsWith("@g.us")) return;

    const texto = escaparTexto(message.body);
    if (!texto) return;

    console.log(`📩 ${message.from}: ${texto}`);
    const cliente = obtenerCliente(message.from);
    cliente.fechaActualizacion = new Date().toISOString();
    const t = normalizar(texto);

    // 1. PASO A PASO DE ENTREGA Y PAGO
    if (cliente.estado === "esperando_direccion") {
        if (texto.length < 5) {
            await enviarMensajeSeguro(message, "📍 Por favor compárteme tu *dirección completa* y el *barrio* para realizar el envío 🛵.");
            return;
        }
        
        cliente.direccion = texto;
        cliente.costoDomicilio = calcularCostoDomicilio(texto);
        cliente.estado = "esperando_pago";
        guardarClientes();

        let mensajeDomicilio = cliente.costoDomicilio > 0 
            ? `🛵 *Costo de domicilio:* ${dinero(cliente.costoDomicilio)} (fuera del norte de Madrid)\n\n` 
            : "🛵 *Costo de domicilio:* ¡GRATIS! (Zona Norte de Madrid)\n\n";

        await enviarMensajeSeguro(
            message,
            "📍 ¡Dirección anotada! 👌✨\n\n" +
            mensajeDomicilio +
            "¿Cómo prefieres realizar el pago de tu pedido?\n\n" +
            "1️⃣ *Efectivo contra entrega*\n" +
            `2️⃣ *Nequi o Daviplata* (Llave: *${LLAVE_PAGO}*)`
        );
        return;
    }

    if (cliente.estado === "esperando_pago") {
        let pago = null;
        if (t.includes("nequi") || t.includes("daviplata") || t.includes("transferencia") || t === "2") pago = "Nequi/Daviplata";
        if (t.includes("efectivo") || t.includes("contraentrega") || t.includes("cash") || t === "1") pago = "Efectivo contra entrega";

        if (!pago) {
            await enviarMensajeSeguro(
                message,
                "💳 Por favor indícame tu método de pago preferido:\n\n" +
                "1️⃣ *Efectivo contra entrega*\n" +
                `2️⃣ *Nequi o Daviplata* (Llave: *${LLAVE_PAGO}*)`
            );
            return;
        }

        cliente.formaPago = pago;
        cliente.estado = "confirmacion_final";
        guardarClientes();

        let infoPago = pago === "Nequi/Daviplata" ? `\n📲 *Llave Nequi/Daviplata:* *${LLAVE_PAGO}*` : "";

        await enviarMensajeSeguro(
            message,
            `${generarResumen(cliente)}\n\n` +
            `📍 *Dirección:* ${cliente.direccion}\n` +
            `💳 *Método de pago:* ${cliente.formaPago}${infoPago}\n\n` +
            `¿Escribes *SI* para confirmar y despachar tu pedido? ✅🔥`
        );
        return;
    }

    if (cliente.estado === "confirmacion_final") {
        const confirmaciones = ["si", "confirmo", "confirmar", "dale", "listo", "ok", "okay", "correcto"];
        const negaciones = ["no", "cancelar", "cancela", "mejor no"];

        if (confirmaciones.some(c => t === c || t.startsWith(c + " "))) {
            await confirmarPedido(message, cliente);
            return;
        }
        if (negaciones.some(n => t === n || t.startsWith(n + " "))) {
            cliente.estado = "tomando_pedido";
            guardarClientes();
            await enviarMensajeSeguro(message, "¡Sin problema! 😊 El pedido sigue guardado. Indícame qué cambios te gustaría hacer.");
            return;
        }
    }

    // 2. RETIRAR PRODUCTOS
    if (t.includes("quitar") || t.includes("eliminar") || t.includes("borrar")) {
        const prodId = detectarProductos(texto)[0];
        if (prodId) {
            const cant = detectarCantidad(texto);
            quitarDelCarrito(cliente, prodId, cant);
            await enviarMensajeSeguro(message, `✅ Pedido actualizado.\n\n${generarResumen(cliente)}`);
        } else {
            await enviarMensajeSeguro(message, "Indícame qué producto deseas retirar de tu pedido 🛒.");
        }
        return;
    }

    // 3. SALUDOS Y SOLICITUDES DE COMBOS / MENÚ
    if (t === "hola" || t === "buenas" || t.includes("buenos dias") || t.includes("buenas tardes") || t.includes("buenas noches")) {
        cliente.estado = "tomando_pedido";
        guardarClientes();
        await enviarMensajeSeguro(
            message,
            "👋 ¡Hola! Bienvenido a *Yeik Gourmet* 🍔🔥\n\n" +
            "¡Qué gusto atenderte! 🎉\n\n" +
            "Escribe *menú* para ver los precios o *combos* para ver ideas deliciosas que puedes armar a tu gusto. 😋🍟🥟🍻"
        );
        return;
    }

    if (t.includes("combo") || t.includes("combos") || t.includes("promocion") || t.includes("ejemplos")) {
        cliente.estado = "tomando_pedido";
        guardarClientes();
        await enviarMensajeSeguro(message, mostrarEjemplosCombos());
        return;
    }

    if (t.includes("menu") || t.includes("precios") || t.includes("que venden") || t.includes("productos")) {
        cliente.estado = "tomando_pedido";
        guardarClientes();
        await enviarMensajeSeguro(message, mostrarMenu());
        return;
    }

    if (t.includes("mi pedido") || t.includes("carrito") || t.includes("resumen")) {
        await enviarMensajeSeguro(message, generarResumen(cliente));
        return;
    }

    // 4. DETECCIÓN Y ARMADO DE PRODUCTOS/COMBOS
    if (detectarProductos(texto).length > 0) {
        await procesarProductos(message, cliente, texto);
        return;
    }

    // 5. INICIO DE PROCESO DE PAGO O CONFIRMACIÓN DIRECTA
    const confirmaciones = ["si", "confirmo", "listo", "asi esta bien", "confirmar", "terminar"];
    if (cliente.estado === "tomando_pedido" && confirmaciones.some(c => t === c || t.startsWith(c + " ")) && Object.keys(cliente.carrito).length > 0) {
        if (calcularTotal(cliente) < PEDIDO_MINIMO) {
            await enviarMensajeSeguro(message, `⚠️ Tu pedido suma *${dinero(calcularTotal(cliente))}*. El mínimo para domicilio es de *${dinero(PEDIDO_MINIMO)}*. ¿Le agregamos algo más? 🍔🥟🥤🍻`);
            return;
        }
        cliente.estado = "esperando_direccion";
        guardarClientes();
        await enviarMensajeSeguro(message, "¡Excelente elección! 🤩🎉\n\n📍 Para llevarte el pedido caliente, por favor envíame tu *dirección de entrega* y el *barrio*.");
        return;
    }

    // 6. ASISTENCIA HUMANA
    if (t.includes("hablar con alguien") || t.includes("asesor") || t.includes("dueño") || t.includes("einer")) {
        await enviarMensajeSeguro(message, `¡Por supuesto! 🤝 Te pongo en contacto directo con Einer de *Yeik Gourmet*.\n\n📱 *Línea Directa:* ${NUMERO_TITULAR}`);
        return;
    }

    // 7. CONSULTAS GENERALES A GROQ
    const respuestaIA = await preguntarGroq(texto);
    if (respuestaIA) {
        await enviarMensajeSeguro(message, respuestaIA);
        return;
    }

    // 8. MENSAJE POR DEFECTO
    await enviarMensajeSeguro(
        message,
        "¡Hola! 👋 Estoy listo para tomar tu pedido en *Yeik Gourmet* 🍔🔥\n\n" +
        "Puedes armar tu combo expresándolo como quieras, por ejemplo:\n" +
        "• 🍔 *\"1 hamburguesa, 1 papa rellena y una Coca-Cola\"*\n" +
        "• 🌭 *\"1 perro caliente con papas y una gaseosa Manzana\"*\n" +
        `• 📲 *Llave Nequi/Daviplata:* *${LLAVE_PAGO}*` +
        "\n\n¡Escribe lo que se te antoje o pide el *menú*!"
    );
}

// ======================================================
// EVENTOS CLIENTE WHATSAPP (ENLACE QR WEB LIMPIO)
// ======================================================

client.on("qr", qr => {
    console.log("\n==================================================");
    console.log("📱 ESCANEA ESTE CÓDIGO QR DESDE TU NAVEGADOR");
    console.log("Copia este enlace y pégalo en tu navegador para ver el QR perfecto y nítido:");
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
    console.log("==================================================\n");
});

client.on("ready", () => {
    console.log("\n====================================");
    console.log("✅ YEIK GOURMET BOT CONECTADO EXITOSAMENTE");
    console.log("====================================\n");
});

client.on("message", async message => {
    try {
        await procesarMensaje(message);
    } catch (error) {
        console.error("❌ Error procesando mensaje:", error);
    }
});

client.initialize();
