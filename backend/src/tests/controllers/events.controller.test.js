/**
 * @file events.controller.test.js
 * @description Tests unitarios del controlador de eventos deportivos.
 * Comprueba la consulta paginada de eventos desde la base de datos
 * con sus distintos filtros.
 */

import { jest } from "@jest/globals";

const eventFindMock = jest.fn();
const eventCountDocumentsMock = jest.fn();
const syncEventsMock = jest.fn();

jest.unstable_mockModule("../../models/Event.js", () => ({
  Event: {
    find: eventFindMock,
    countDocuments: eventCountDocumentsMock,
  },
}));

jest.unstable_mockModule("../../services/events.sync.js", () => ({
  syncEvents: syncEventsMock,
}));

const { getSportsEvents } = await import("../../controllers/events.controller.js");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("controlador de eventos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getSportsEvents devuelve eventos paginados", async () => {
    const req = { query: { page: "1", limit: "10", tipo: "all" } };
    const res = createRes();
    const next = jest.fn();

    eventFindMock.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ _id: "e-1" }]),
    });
    eventCountDocumentsMock.mockResolvedValue(1);

    await getSportsEvents(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, events: [{ _id: "e-1" }] }));
  });

});
