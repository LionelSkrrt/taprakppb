import { SeriesModel } from "../models/seriesModel.js";
import { parseId, sendError, dbErrorStatus, validate } from "../utils/http.js";

const RULES = {
  slug: { type: "string", required: true },
  name: { type: "string", required: true },
  year: { type: "int", required: true },
  timeline: { type: "string?" },
  format: { type: "string?" },
  color: { type: "string?" },
  synopsis: { type: "string?" },
  image_url: { type: "string?" },
};

export const SeriesController = {
  async getAll(req, res) {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      res.json(await SeriesModel.getAll({ q }));
    } catch (err) {
      sendError(res, 500, err.message);
    }
  },

  async getById(req, res) {
    try {
      const id = parseId(req.params.id);
      const row = id && (await SeriesModel.getById(id));
      if (!row) return sendError(res, 404, "Series tidak ditemukan.");
      res.json(row);
    } catch (err) {
      sendError(res, 500, err.message);
    }
  },

  async create(req, res) {
    const problem = validate(req.body, RULES);
    if (problem) return sendError(res, 400, problem);
    try {
      res.status(201).json(await SeriesModel.create(req.body));
    } catch (err) {
      sendError(res, dbErrorStatus(err) === 500 ? 400 : dbErrorStatus(err), err.message);
    }
  },

  async update(req, res) {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 404, "Series tidak ditemukan.");
    const problem = validate(req.body, RULES, { partial: true });
    if (problem) return sendError(res, 400, problem);
    try {
      const row = await SeriesModel.update(id, req.body);
      if (!row) return sendError(res, 404, "Series tidak ditemukan.");
      res.json(row);
    } catch (err) {
      sendError(res, dbErrorStatus(err) === 500 ? 400 : dbErrorStatus(err), err.message);
    }
  },

  async remove(req, res) {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 404, "Series tidak ditemukan.");
    try {
      const removed = await SeriesModel.remove(id);
      if (!removed) return sendError(res, 404, "Series tidak ditemukan.");
      res.json({ message: "Series berhasil dihapus." });
    } catch (err) {
      sendError(res, dbErrorStatus(err) === 500 ? 400 : dbErrorStatus(err), err.message);
    }
  },
};
