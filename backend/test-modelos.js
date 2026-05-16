/**
 * @file test-modelos.js
 * @description Utilidad para listar los modelos de Gemini disponibles con la API Key configurada,
 * filtrando únicamente los que soportan generación de contenido (generateContent).
 */
import dotenv from "dotenv";
import { loggers } from "winston";
dotenv.config();


/**
 * Consulta la API de Gemini y muestra por consola los modelos disponibles
 * que soportan el método generateContent.
 */
async function listarModelos() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    if (datos.error) {
      loggers.error("Error de la API:", datos.error.message);
      return;
    }

    // Filtramos solo los modelos que sirven para generar contenido
    const modelosUtiles = datos.models
      .filter((m) => m.supportedGenerationMethods.includes("generateContent"))
      .map((m) => m.name.replace("models/", "")); // Limpiamos el prefijo

    loggers.info("✅ Modelos disponibles para tu API Key:");
    loggers.table(modelosUtiles);
  } catch (error) {
    loggers.error("Error al conectar:", error);
  }
}

listarModelos();