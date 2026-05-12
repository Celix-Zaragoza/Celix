/**
 * @file events.controller.js
 * @description Controlador de eventos deportivos. Gestiona la consulta paginada
 * de eventos desde la base de datos y la sincronización manual con la API de Zaragoza.
 */

import { Event } from "../models/Event.js";
import { syncEvents } from "../services/events.sync.js";


/**
 * Devuelve los eventos deportivos paginados y filtrados por título, tipo y fecha.
 * Los eventos se leen desde la base de datos local, previamente sincronizada con Zaragoza.
 * @route GET /api/v1/events
 */
export const getSportsEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const filter = { oculto: false };
    if (req.query.query) filter.title = { $regex: req.query.query, $options: "i" };
    if (req.query.tipo && req.query.tipo !== "all") filter.tipo = req.query.tipo;

    // Filtro de fecha
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (req.query.fecha === "proximos") filter.startDate = { $gte: hoy };
    else if (req.query.fecha === "pasados") filter.startDate = { $lt: hoy };
    else if (req.query.fecha === "hoy") {
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);
      filter.startDate = { $gte: hoy, $lt: manana };
    }

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ startDate: 1 }).skip(skip).limit(limit),
      Event.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      events,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Fuerza una sincronización manual de eventos con la API pública de Zaragoza.
 * @route POST /api/v1/admin/events/sync
 */
export const triggerSync = async (req, res, next) => {
  try {
    const result = await syncEvents();
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};