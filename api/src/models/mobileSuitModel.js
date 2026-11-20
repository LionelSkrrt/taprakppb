import { table } from "../config/repository.js";

const suits = table("mobile_suits");
const series = table("series");

const WRITABLE = [
  "name",
  "model_number",
  "series_id",
  "pilot",
  "faction",
  "unit_type",
  "height_m",
  "weight_t",
  "armaments",
  "description",
  "image_url",
];

const pick = (payload) =>
  Object.fromEntries(
    Object.entries(payload ?? {}).filter(([key]) => WRITABLE.includes(key)),
  );

const seriesInfo = ({ id, name, color, year, timeline }) => ({
  id,
  name,
  color,
  year,
  timeline,
});

export const MobileSuitModel = {
  async getAll({ q, seriesId } = {}) {
    const [rows, allSeries] = await Promise.all([
      suits.list({
        eq: seriesId ? { series_id: seriesId } : {},
        search: q
          ? { columns: ["name", "model_number", "pilot", "faction"], term: q }
          : null,
      }),
      series.list(),
    ]);
    const byId = new Map(allSeries.map((s) => [s.id, s]));
    return rows.map((row) => ({
      ...row,
      series: byId.has(row.series_id) ? seriesInfo(byId.get(row.series_id)) : null,
    }));
  },

  async getById(id) {
    const row = await suits.get(id);
    if (!row) return null;
    const [parent, siblings] = await Promise.all([
      series.get(row.series_id),
      suits.list({ eq: { series_id: row.series_id } }),
    ]);
    return {
      ...row,
      series: parent ? seriesInfo(parent) : null,
      related: siblings
        .filter((s) => s.id !== row.id)
        .slice(0, 4)
        .map(({ id, name, model_number, image_url }) => ({
          id,
          name,
          model_number,
          image_url,
        })),
    };
  },

  create(payload) {
    return suits.insert(pick(payload));
  },

  update(id, payload) {
    return suits.update(id, pick(payload));
  },

  remove(id) {
    return suits.remove(id);
  },
};
