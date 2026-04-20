import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializar el cliente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// services/geminiService.js

export const reordenarFeedConIA = async (usuarioIntereses, postsCandidatos) => {
  try {
    console.log("🧠 [Gemini Service] Enviando prompt a la IA...");

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Simplificamos los posts para no enviar datos innecesarios a la API (ahorra tokens y tiempo)
    const postsSimplificados = postsCandidatos.map(p => ({
      id: p._id,
      contenido: p.contenido,
      deporte: p.deporte,
      nivel_ia: p.ia_tags?.nivel_recomendado
    }));

    const prompt = `
      Eres el Algoritmo de Recomendación de CELIX, una plataforma social diseñada para conectar deportistas amateurs en Zaragoza, España. 
      Tu objetivo es maximizar el "engagement" y la relevancia local, ayudando a los usuarios a encontrar compañeros de nivel similar y 
      contenido de los deportes que realmente practican.

      ### CONTEXTO DEL USUARIO (Target)
      A continuación se detallan los deportes que practica el usuario y su nivel de habilidad (escala 1-5):
      ${JSON.stringify(usuarioIntereses)}

      ### CANDIDATOS (Posts a evaluar)
      Lista de publicaciones recientes recolectadas de la base de datos:
      ${JSON.stringify(postsSimplificados)}

      ### INSTRUCCIONES DE RANKING (Prioridad de arriba a abajo)
      1. AFINIDAD DE DEPORTE: Los posts cuyo "deporte" coincida exactamente con los intereses del usuario deben aparecer en las primeras posiciones.
      2. EMPAREJAMIENTO DE NIVEL: Prioriza publicaciones donde el "nivel_ia" sea igual o tenga una diferencia de +/- 1 respecto al nivel del usuario
         en ese deporte. Un usuario nivel 2 no quiere ver contenido de profesionales (nivel 5), ni viceversa.
      3. RELEVANCIA SEMÁNTICA: Si el contenido del post menciona lugares de Zaragoza (ej. "Parque del Agua", "CDM Siglo XXI", "Actur") o palabras de
         acción ("busco", "entrenamiento", "partido", "falta uno"), sube su puntuación.
      4. PENALIZACIÓN: Los posts de deportes que NO están en la lista de intereses del usuario deben quedar al final de la lista, ordenados por su 
         nivel_ia de forma descendente.

      ### RESTRICCIÓN DE SALIDA
      Debes responder ÚNICAMENTE con un objeto JSON válido. No incluyas explicaciones, introducciones ni bloques de código markdown.

      Formato requerido:
      {
        "orden_ids": ["id_1", "id_2", "id_3", "..."]
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { 
        responseMimeType: "application/json",
        // Definimos el esquema para que la respuesta sea siempre predecible
        responseSchema: {
          type: "object",
          properties: {
            orden_ids: { type: "array", items: { type: "string" } }
          },
          required: ["orden_ids"]
        }
      }
    });

    const responseText = result.response.text();
    console.log("📥 [Gemini Service] Respuesta RAW de la IA:", responseText);

    const data = JSON.parse(responseText);

    if (data.orden_ids) {
      console.log("📊 [Gemini Service] Ranking completado con éxito");
      return data.orden_ids;
    }

    return null;
  } catch (error) {
    console.error("Error en Re-ranking Gemini:", error);
    return null; // Fallback: si falla, devolveremos el orden original de la DB
  }
};