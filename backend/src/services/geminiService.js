import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializar el cliente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analizarPostConIA = async (textoPost, deporteDeclarado, nivelUsuario) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      Eres un asistente experto en CELIX, una red social deportiva. 
      Tu misión es analizar una publicación para el motor de recomendaciones.

      CONTEXTO PROPORCIONADO:
      - Deporte seleccionado por el usuario: ${deporteDeclarado}
      - Nivel del autor en este deporte: ${nivelUsuario}/5 (1: Principiante, 5: Experto)

      TEXTO DE LA PUBLICACIÓN:
      "${textoPost}"

      TAREA:
      1. Determina si el texto contradice o confirma el nivel del usuario. 
      2. Extrae etiquetas precisas.
      
      Devuelve estrictamente un JSON:
      {
        "deporte_principal": "${deporteDeclarado}", 
        "nivel_recomendado": (Número 1-5. Si el texto sugiere un nivel distinto al del autor, ajusta este valor. Si no dice nada, usa ${nivelUsuario}),
        "keywords": ["array de 3 palabras clave"],
        "es_evento_competitivo": (boolean, true si menciona torneo, trofeo, puntos, ranking)
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error en Gemini:", error);
    return null;
  }
};