// backend/src/services/events.sync.js
import { Event } from "../models/Event.js";
import { logger } from "../config/logger.js"; 

const ZARAGOZA_EVENTS_URL = "https://www.zaragoza.es/sede/servicio/actividades/evento";
const ZARAGOZA_BASE = "https://www.zaragoza.es";

function normalizeImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${ZARAGOZA_BASE}${url}`;
  return null;
}

function normalizeEvent(event) {
  const firstPrice = Array.isArray(event.price) ? event.price[0] : null;
  const firstOrganizer = Array.isArray(event.organizer) ? event.organizer[0] : null;
  const geometryCoords = Array.isArray(event.geometry?.coordinates)
    ? event.geometry.coordinates
    : null;

  return {
    externalId: event.id,
    title: event.title,
    description: event.description,
    tipo: event.category?.[0]?.type || "General",
    deporte: event.type || "General",
    startDate: event.startDate,
    endDate: event.endDate,
    ubicacion: event.location || "",
    coordenadas: geometryCoords
      ? { lat: geometryCoords[1] ?? null, lng: geometryCoords[0] ?? null }
      : { lat: null, lng: null },
    imagen: normalizeImageUrl(event.image),
    registrationUrl: event.registration?.url || null,
    urlFuente: event.alt || "",
    organizer: firstOrganizer?.title || "",
    gratuita: firstPrice?.hasCurrencyValue === 0,
  };
}

async function fetchAllZaragozaEvents() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    let currentStart = 0;
    let totalCount = null;
    const events = [];

    while (totalCount === null || currentStart < totalCount) {
      const params = new URLSearchParams({
        rf: "html",
        srsname: "utm30n",
        start: String(currentStart),
        rows: "100",
        sort: "daysLeft asc",
        fq: "temas_smultiple:Deporte",
      });

      let response;
      for (let i = 0; i < 5; i++) {
        response = await fetch(`${ZARAGOZA_EVENTS_URL}?${params}`, {
          headers: { accept: "application/solr-results+json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Error API Zaragoza: ${response.status}`);
        const body = await response.text();
        if (body.trim()) {
          const page = JSON.parse(body);
          if (totalCount === null) totalCount = page.totalCount || 0;
          events.push(...(page.result || []));
          currentStart += 100;
          break;
        }
        if (i === 4) throw new Error("API Zaragoza no responde");
      }
    }

    return events;
  } finally {
    clearTimeout(timeout);
  }
}

export async function syncEvents() {
  logger.info("🔄 Sincronizando eventos con Zaragoza...");
  try {
    const rawEvents = await fetchAllZaragozaEvents();
    const normalized = rawEvents.map(normalizeEvent).filter((e) => e.externalId);

    let upserted = 0;
    for (const event of normalized) {
      await Event.findOneAndUpdate(
        { externalId: event.externalId },
        {
          $set: {
            title: event.title,
            description: event.description,
            tipo: event.tipo,
            deporte: event.deporte,
            startDate: event.startDate,
            endDate: event.endDate,
            ubicacion: event.ubicacion,
            coordenadas: event.coordenadas,
            imagen: event.imagen,
            registrationUrl: event.registrationUrl,
            urlFuente: event.urlFuente,
            organizer: event.organizer,
            gratuita: event.gratuita,
          },
          // oculto NO se toca — preservar lo que el admin haya marcado
        },
        { upsert: true, returnDocument: 'after' }
      );
      upserted++;
    }

    // ── Eliminar eventos que ya no existen en Zaragoza ──────────────────────
    const receivedIds = normalized.map((e) => e.externalId);
    const deleted = await Event.deleteMany({
      externalId: { $nin: receivedIds }
    });
    logger.info(`🗑️ ${deleted.deletedCount} eventos eliminados (ya no existen en Zaragoza)`);
    // ────────────────────────────────────────────────────────────────────────

    logger.info(`✅ Sync completado: ${upserted} eventos actualizados`);
    return { ok: true, total: upserted };
  } catch (err) {
    logger.error("❌ Error en sync de eventos:", err.message);
    return { ok: false, error: err.message };
  }
}