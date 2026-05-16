/**
 * @file instalaciones.controller.js
 * @description Controlador para la consulta de instalaciones deportivas de Zaragoza.
 * Obtiene los datos desde la API pública municipal, convierte las coordenadas
 * de UTM zona 30N a WGS84 y devuelve las instalaciones normalizadas.
 */

const ZARAGOZA_BASE = "https://www.zaragoza.es";
const INSTALACIONES_URL = `${ZARAGOZA_BASE}/sede/servicio/equipamiento/basic/instalacion-deportiva-elemental.json`;

/**
 * Convierte coordenadas UTM zona 30N ETRS89 a WGS84 (lat/lng).
 * La conversión es aproximada pero suficientemente precisa para el ámbito de Zaragoza.
 * @param {number} easting - Coordenada Este en metros.
 * @param {number} northing - Coordenada Norte en metros.
 * @returns {{ lat: number, lng: number }} Coordenadas en formato WGS84.
 */
function utmToLatLng(easting, northing) {
  // Parámetros elipsoide GRS80
  const a = 6378137.0;
  const f = 1 / 298.257222101;
  const b = a * (1 - f);
  const e2 = 1 - (b * b) / (a * a);
  const k0 = 0.9996;
  const zone = 30;
  const lambda0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180);

  const x = easting - 500000;
  const y = northing;

  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64));

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 * e1 * e1) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * e1 * e1 * e1 * e1) / 32) * Math.sin(4 * mu) +
    ((151 * e1 * e1 * e1) / 96) * Math.sin(6 * mu);

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) * Math.sin(phi1));
  const T1 = Math.tan(phi1) * Math.tan(phi1);
  const C1 = (e2 / (1 - e2)) * Math.cos(phi1) * Math.cos(phi1);
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * Math.sin(phi1) * Math.sin(phi1), 1.5);
  const D = x / (N1 * k0);

  const lat =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e2) * D * D * D * D) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e2 - 3 * C1 * C1) *
          D * D * D * D * D * D) /
          720);

  const lng =
    lambda0 +
    (D -
      ((1 + 2 * T1 + C1) * D * D * D) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e2 + 24 * T1 * T1) * D * D * D * D * D) /
        120) /
      Math.cos(phi1);

  return {
    lat: lat * (180 / Math.PI),
    lng: lng * (180 / Math.PI),
  };
}

/**
 * Transforma un elemento de la API de Zaragoza al formato de instalación de la aplicación.
 * Filtra las coordenadas que no sean válidas para el área de Zaragoza.
 * @param {object} item - Instalación en formato original de la API.
 * @returns {object} Instalación normalizada.
 */
function normalizeInstalacion(item) {
  let coordenadas = { lat: null, lng: null };

  const coords = item.geometry?.coordinates;
  if (coords && coords.length >= 2) {
    // El endpoint devuelve coordenadas UTM zona 30N ETRS89
    const converted = utmToLatLng(coords[0], coords[1]);
    // Validar que las coords son razonables para Zaragoza
    if (converted.lat > 41 && converted.lat < 42 && converted.lng > -1.2 && converted.lng < -0.5) {
      coordenadas = converted;
    }
  }

  return {
    id: item.id,
    nombre: item.title ?? "Sin nombre",
    direccion: item.address ?? "",
    telefono: item.tel ?? null,
    email: item.email ?? null,
    horario: item.horario ?? null,
    tipo: item.tipo?.title ?? "Instalación deportiva",
    coordenadas,
  };
}

/**
 * Devuelve la lista de instalaciones deportivas de Zaragoza con coordenadas válidas.
 * Consulta la API municipal con un timeout de 10 segundos.
 * @route GET /instalaciones
 */
export const getInstalaciones = async (req, res, next) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(
        `${INSTALACIONES_URL}?srsname=utm30n_etrs89&rows=500`,
        {
          headers: { accept: "application/json" },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Error API Zaragoza: ${response.status}`);
      }

      const data = await response.json();
      const instalaciones = (data.result ?? [])
        .map(normalizeInstalacion)
        .filter((i) => i.coordenadas.lat && i.coordenadas.lng);

      return res.json({
        ok: true,
        total: instalaciones.length,
        instalaciones,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    return next(err);
  }
};