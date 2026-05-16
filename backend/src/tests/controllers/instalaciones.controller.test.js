/**
 * @file instalaciones.controller.test.js
 * @description Tests unitarios del controlador de instalaciones deportivas.
 * Comprueba la normalización y filtrado de coordenadas de los datos
 * obtenidos desde la API pública de Zaragoza.
 */


import { jest } from "@jest/globals";

const originalFetch = global.fetch;

const { getInstalaciones } = await import("../../controllers/instalaciones.controller.js");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("controlador de instalaciones", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  test("getInstalaciones devuelve instalaciones normalizadas y filtradas", async () => {
    const req = {};
    const res = createRes();
    const next = jest.fn();

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        totalCount: 151,
        start: 0,
        rows: 1,
        result: [
          {
            id: "4192",
            title: "Instalación deportiva elemental Echegaray y Caballero",
            tipoEquipamiento: ["instalacion-deportiva-elemental"],
            titularidadPublica: true,
            streetAddress: "Pº Echegaray y Caballero (frente C/Celma)",
            postalCode: "50002",
            geometry: { coordinates: [675582.1367050485, 4614173.138711294] },
            latitud: 41.65997498153782,
            longitud: -0.8911400949269492,
            distritoId: "Casco Histórico",
            creationDate: "2010-03-01T01:00:00",
          },
        ],
      }),
    });

    await getInstalaciones(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: true, total: expect.any(Number), instalaciones: expect.any(Array) })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
