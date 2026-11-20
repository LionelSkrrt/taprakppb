import { table } from "../config/repository.js";

const series = table("series");
const suits = table("mobile_suits");

const WRITABLE = [
  "slug",
  "name",
  "year",
  "timeline",
  "format",
  "color",
  "synopsis",
  "image_url",
];

const pick = (payload) =>
  Object.fromEntries(
    Object.entries(payload ?? {}).filter(([key]) => WRITABLE.includes(key)),
  );

export const SeriesModel = {
  async getAll({ q } = {}) {
    const [rows, allSuits] = await Promise.all([
      series.list({
        search: q ? { columns: ["name", "timeline", "synopsis"], term: q } : null,
        orderBy: "year",
      }),
      suits.list(),
    ]);
    return rows.map((row) => ({
      ...row,
      mobile_suit_count: allSuits.filter((s) => s.series_id === row.id).length,
    }));
  },

  async getById(id) {
    const row = await series.get(id);
    if (!row) return null;
    const mobileSuits = await suits.list({ eq: { series_id: id } });
    return {
      ...row,
      mobile_suit_count: mobileSuits.length,
      mobile_suits: mobileSuits.map(
        ({ id, name, model_number, pilot, faction, image_url }) => ({
          id,
          name,
          model_number,
          pilot,
          faction,
          image_url,
        }),
      ),
    };
  },

  create(payload) {
    return series.insert(pick(payload));
  },

  update(id, payload) {
    return series.update(id, pick(payload));
  },

  remove(id) {
    return series.remove(id);
  },
};
