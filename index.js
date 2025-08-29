const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

// Guardar el estado de cada usuario
let userState = {};

client.on('qr', qr => {
    console.log('📸 Escanea este código en WhatsApp Web:');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('🔑 Autenticado correctamente.');
});

client.on('ready', () => {
    console.log('✅ Bot conectado a WhatsApp');
});

client.on('message', async msg => {
    const userId = msg.from;
    const text = msg.body.trim().toLowerCase();

    if (!userState[userId]) {
        userState[userId] = { step: "menu" }; // Estado inicial siempre en "menu"
    }

    switch (userState[userId].step) {
        case "menu":
            if (text === 'hola' || text === 'menu') {
                msg.reply(
`👋 Bienvenido a *Progresando en Salud IPS*.  
Elige una opción:

1️⃣ Solicitar cita  
2️⃣ Tipos de cita  
3️⃣ Documentos requeridos  
4️⃣ Salir`
                );
            } else if (text === '1') {
                msg.reply("🗓 ¿Para qué fecha deseas la cita? (ejemplo: 2025-09-01)");
                userState[userId].step = "fecha";
            } else if (text === '2') {
                msg.reply("📌 Tipos de cita:\n- Médica\n- Odontológica\n- Asesoría\n\nEscribe el nombre del tipo que deseas.");
                userState[userId].step = "tipo";
            } else if (text === '3') {
                msg.reply("📝 Documentos requeridos:\n- Documento de identidad\n- Carné de EPS\n- Orden médica (si aplica)");
            } else if (text === '4') {
                msg.reply("👋 ¡Gracias por usar el sistema! Escribe *menu* si deseas volver.");
                userState[userId].step = "menu";
            }
            break;

        case "fecha": // Reservando cita
            msg.reply(`✅ Cita solicitada para la fecha: ${text}\n\nAhora dime qué tipo de cita necesitas.`);
            userState[userId].step = "tipo";
            break;

        case "tipo": // Tipo de cita
            msg.reply(`📌 Has seleccionado: ${text}\n\nAhora envía los documentos requeridos (foto o PDF).`);
            userState[userId].step = "documentos";
            break;

        case "documentos": // Documentos
            if (msg.hasMedia) {
                msg.reply("📥 Documento recibido. ✅ Tu cita será confirmada pronto.");
                userState[userId].step = "menu"; // volver al menú
            } else {
                msg.reply("⚠️ Debes enviar un documento (foto o archivo). Intenta de nuevo.");
            }
            break;
    }
});

client.initialize();
