// test-modelos.js
//Fichero para saber que modelos de Gemini tengo disponibles con mi API Key, y cuáles sirven para generar contenido (generateContent)
import dotenv from "dotenv";
dotenv.config();

async function listarModelos() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    if (datos.error) {
      console.error("Error de la API:", datos.error.message);
      return;
    }

    // Filtramos solo los modelos que sirven para generar contenido
    const modelosUtiles = datos.models
      .filter((m) => m.supportedGenerationMethods.includes("generateContent"))
      .map((m) => m.name.replace("models/", "")); // Limpiamos el prefijo

    console.log("✅ Modelos disponibles para tu API Key:");
    console.table(modelosUtiles);
  } catch (error) {
    console.error("Error al conectar:", error);
  }
}

listarModelos();