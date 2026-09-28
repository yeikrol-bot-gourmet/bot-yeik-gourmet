import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function verModelos() {
    try {
        const lista = await groq.models.list();
        console.log("=== MODELOS DISPONIBLES EN TU CUENTA ===");
        lista.data.forEach(m => console.log("- " + m.id));
    } catch (e) {
        console.error("Error consultando modelos:", e.message);
    }
}
verModelos();