const ZARAGOZA_EVENTS_URL = "https://www.zaragoza.es/sede/servicio/actividades/evento";

const DEFAULT_SORT = "daysLeft asc";
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;
const MAX_FETCH_RETRIES = 5;

// Sanear entrada de números para la llamada a la API
function toPositiveInt(value, fallback) {
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed) || parsed < 0) return fallback;
	return parsed;
}


// Normalizar el evento recibido de la API para que coincida con el modelo en la base de datos
function normalizeEvent(event) {
	const ZARAGOZA_BASE = "https://www.zaragoza.es";

	function normalizeImageUrl(url) {
		if (!url) return null;
		// Protocol-relative: //www.zaragoza.es/...
		if (url.startsWith("//")) return `https:${url}`;
		// Absoluta
		if (url.startsWith("http")) return url;
		// Relativa: /cont/paginas/...
		if (url.startsWith("/")) return `${ZARAGOZA_BASE}${url}`;
		return null;
	}

	// Obtener los valores de los arrays del
	const firstPrice = Array.isArray(event.price) ? event.price[0] : null;
	const firstOrganizer = Array.isArray(event.organizer) ? event.organizer[0] : null;
	const geometryCoords = Array.isArray(event.geometry?.coordinates)
		? event.geometry.coordinates
		: null;

	return {
		externalId: event.id,
		title: event.title,
		description: event.description,
		tipo: event.category[0]?.type || "General",
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
		oculto: false,
		interesados: []
	};
}

// Wrapper de la llamada a la API de Zaragoza con los filtros proporcionados
async function fetchZaragozaEventsPage({ start, rows, sort, theme, query, signal }) {
	// Construye una peticion de una sola pagina a la API de Zaragoza.
	const params = new URLSearchParams({
		rf: "html",
		srsname: "utm30n",
		start: String(start),
		rows: String(rows),
		sort,
		fq: `temas_smultiple:${theme}`,
	});

	if (query) {
		params.set("query", query);
	}

	// Intenta llamar a la API 5 veces (no siempre devuelve resultados a la primera llamada)
	for (let i = 0; i < MAX_FETCH_RETRIES; i++) {
		const response = await fetch(`${ZARAGOZA_EVENTS_URL}?${params.toString()}`, {
			method: "GET",
			headers: {
				// Este accept fuerza el formato JSON especifico de su API (solr-results).
				accept: "application/solr-results+json",
			},
			signal,
		});

		if (!response.ok) {
			throw Error(`Error en API Zaragoza: ${response.status}`);
		}

		const body = await response.text();

		if (!body.trim()) {
			if (i < MAX_FETCH_RETRIES - 1) continue;

			throw Error("La API de Zaragoza devolvio una respuesta vacia");
		}

		try {
			return JSON.parse(body);
		} catch {
			if (i < MAX_FETCH_RETRIES - 1) continue;
			throw new Error("Respuesta no valida de la API de Zaragoza");
		}
	}

	throw new Error("API de Zaragoza no responde");

}

// Wrapper de la función anterior para mantener en cuenta todas las páginas devueltas por la API
async function fetchAllZaragozaEvents({ start, rows, sort, theme, query, signal }) {
	let currentStart = start;
	let totalCount = null;
	const events = [];

	while (totalCount === null || currentStart < totalCount) {
		const page = await fetchZaragozaEventsPage({
			start: currentStart,
			rows,
			sort,
			theme,
			query,
			signal,
		});

		if (totalCount === null) {
			totalCount = page.totalCount || 0;
		}

		events.push(...(page.result || []));
		currentStart += rows;

		if (rows <= 0) break;
	}

	return {
		totalCount: totalCount || 0,
		events,
	};
}

// GET /api/v1/events
export const getSportsEvents = async (req, res, next) => {
	try {
		const start = toPositiveInt(req.query.start, 0);
		const rows = Math.min(MAX_PAGE_SIZE, toPositiveInt(req.query.rows, DEFAULT_PAGE_SIZE));
		const sort = req.query.sort || DEFAULT_SORT;
		const query = req.query.query?.trim();
		const theme = req.query.theme?.trim() || "Deporte";

		// Timeout global: si Zaragoza tarda demasiado, aborta todas las peticiones en curso.
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10_000);

		try {
			const allPages = await fetchAllZaragozaEvents({
				start,
				rows,
				sort,
				theme,
				query,
				signal: controller.signal,
			});

			return res.json({
				ok: true,
				filters: { theme, query: query || null, sort },
				pagination: {
					start,
					rows,
					totalCount: allPages.totalCount,
					fetched: allPages.events.length,
				},
				events: allPages.events.map(normalizeEvent),
			});
		} finally {
			clearTimeout(timeout);
		}
	} catch (err) {
		return next(err);
	}
};