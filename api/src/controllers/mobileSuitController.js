import { MobileSuitModel } from "../models/mobileSuitModel.js";
import { SeriesModel } from "../models/seriesModel.js";
import { parseId, sendError, dbErrorStatus, validate } from "../utils/http.js";

const RULES = {
  name: { type: "string", required: true },
  model_number: { type: "string", required: true },
  series_id: { type: "int", required: true },
  pilot: { type: "string?" },
  faction: { type: "string?" },
  unit_type: { type: "string?" },
  height_m: { type: "number?" },
  weight_t: { type: "number?" },
  armaments: { type: "strings" },
  description: { type: "string?" },
  image_url: { type: "string?" },
};

const writeStatus = (err) => (dbErrorStatus(err) === 500 ? 400 : dbErrorStatus(err));

export const MobileSuitController = {
  async getAll(req, res) {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const seriesId = req.query.series_id ? parseId(req.query.series_id) : null;
      if (req.query.series_id && !seriesId) {
        return sendError(res, 400, "series_id harus berupa angka.");
      }
      res.json(await MobileSuitModel.getAll({ q, seriesId }));
    } catch (err) {
      sendError(res, 500, err.message);
    }
  },

  async getById(req, res) {
    try {
      const id = parseId(req.params.id);
      const row = id && (await MobileSuitModel.getById(id));
      if (!row) return sendError(res, 404, "Mobile suit tidak ditemukan.");
      res.json(row);
    } catch (err) {
      sendError(res, 500, err.message);
    }
  },

  async create(req, res) {
    const problem = validate(req.body, RULES);
    if (problem) return sendError(res, 400, problem);
    try {
      if (!(await SeriesModel.getById(req.body.series_id))) {
        return sendError(res, 400, "series_id tidak ditemukan.");
      }
      res.status(201).json(await MobileSuitModel.create(req.body));
    } catch (err) {
      sendError(res, writeStatus(err), err.message);
    }
  },

  async update(req, res) {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 404, "Mobile suit tidak ditemukan.");
    const problem = validate(req.body, RULES, { partial: true });
    if (problem) return sendError(res, 400, problem);
    try {
      if (req.body.series_id && !(await SeriesModel.getById(req.body.series_id))) {
        return sendError(res, 400, "series_id tidak ditemukan.");
      }
      const row = await MobileSuitModel.update(id, req.body);
      if (!row) return sendError(res, 404, "Mobile suit tidak ditemukan.");
      res.json(row);
    } catch (err) {
      sendError(res, writeStatus(err), err.message);
    }
  },

  async remove(req, res) {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 404, "Mobile suit tidak ditemukan.");
    try {
      const removed = await MobileSuitModel.remove(id);
      if (!removed) return sendError(res, 404, "Mobile suit tidak ditemukan.");
      res.json({ message: "Mobile suit berhasil dihapus." });
    } catch (err) {
      sendError(res, writeStatus(err), err.message);
    }
  },
};
