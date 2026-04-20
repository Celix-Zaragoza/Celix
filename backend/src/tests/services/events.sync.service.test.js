import { jest } from "@jest/globals";

const eventFindOneAndUpdateMock = jest.fn();
const eventDeleteManyMock = jest.fn();

jest.unstable_mockModule("../../models/Event.js", () => ({
  Event: {
    findOneAndUpdate: eventFindOneAndUpdateMock,
    deleteMany: eventDeleteManyMock,
  },
}));

const { syncEvents } = await import("../../services/events.sync.js");

const mockApiEvent = {
  id: 307181,
  title: "Primavera ciclista",
  description:
    " Las bicicletas son para el verano... y para la primavera! Y un año mas, para celebrar la llegada del buen tiempo y las vacaciones de semana santa, nos vamos a almorzar al Galacho de Juslibol. Pon tu bici a punto, prepara tu bocata y vente a pasar la manana con nosotros. ",
  category: [{ title: "Deporte" }],
  type: "Excursiones y viajes",
  startDate: "2026-04-01T00:00:00",
  endDate: "2026-04-01T00:00:00",
  location: "Zona Joven Monzalbarba",
  geometry: { type: "Point", coordinates: [668942.53, 4618824.18] },
  image: "//www.zaragoza.es/cont/paginas/actividades/imagen/marina_velasco_ciclista21-6.png",
  registration: {
    url: "https://www.zaragoza.es/sede/servicio/cultura/evento/307181/inscripcion",
    startDate: "2026-03-24T00:00:00",
    endDate: "2026-04-02T00:00:00",
  },
  alt: "https://www.zaragoza.es/sede/servicio/cultura/evento/307181",
  organizer: [{ title: "Zona Joven Monzalbarba" }],
  price: [{ fareGroup: "Gratuita", hasCurrencyValue: 0, hasCurrency: "EUR" }],
};

describe("servicio de sincronización de eventos", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test("sincroniza, normaliza y elimina eventos no existentes", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          totalCount: 1,
          result: [mockApiEvent],
        }),
    });

    eventFindOneAndUpdateMock.mockResolvedValue({ _id: "mongo-1" });
    eventDeleteManyMock.mockResolvedValue({ deletedCount: 2 });

    const result = await syncEvents();

    expect(eventFindOneAndUpdateMock).toHaveBeenCalledTimes(1);
    expect(eventFindOneAndUpdateMock).toHaveBeenCalledWith(
      { externalId: 307181 },
      {
        $set: expect.objectContaining({
          title: "Primavera ciclista",
          tipo: "General",
          deporte: "Excursiones y viajes",
          coordenadas: { lat: 4618824.18, lng: 668942.53 },
          imagen:
            "https://www.zaragoza.es/cont/paginas/actividades/imagen/marina_velasco_ciclista21-6.png",
          gratuita: true,
        }),
      },
      { upsert: true, returnDocument: "after" }
    );
    expect(eventDeleteManyMock).toHaveBeenCalledWith({ externalId: { $nin: [307181] } });
    expect(result).toEqual({ ok: true, total: 1 });
  });

  test("reintenta cuando la API devuelve body vacio y continua", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "   ",
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            totalCount: 1,
            result: [mockApiEvent],
          }),
      });

    eventFindOneAndUpdateMock.mockResolvedValue({ _id: "mongo-2" });
    eventDeleteManyMock.mockResolvedValue({ deletedCount: 0 });

    const result = await syncEvents();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(eventFindOneAndUpdateMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true, total: 1 });
  });

  test("devuelve ok false cuando falla la API", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "",
    });

    const result = await syncEvents();

    expect(eventFindOneAndUpdateMock).not.toHaveBeenCalled();
    expect(eventDeleteManyMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, error: "Error API Zaragoza: 500" });
  });
});
