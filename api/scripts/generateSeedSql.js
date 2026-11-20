// Menghasilkan supabase/seed.sql dari src/data/seed.js
//   npm run seed:sql
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SERIES, MOBILE_SUITS } from "../src/data/seed.js";

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replaceAll("'", "''")}'`);
const n = (v) => (v === null || v === undefined ? "null" : String(v));
const arr = (a) =>
  a.length === 0 ? "'{}'::text[]" : `array[${a.map(q).join(", ")}]`;

const seriesRows = SERIES.map(
  (s) =>
    `  (${s.id}, ${q(s.slug)}, ${q(s.name)}, ${s.year}, ${q(s.timeline)}, ${q(s.format)}, ${q(s.color)}, ${q(s.synopsis)}, ${q(s.image_url)})`,
).join(",\n");

const suitRows = MOBILE_SUITS.map(
  (m) =>
    `  (${m.id}, ${q(m.name)}, ${q(m.model_number)}, ${m.series_id}, ${q(m.pilot)}, ${q(m.faction)}, ${q(m.unit_type)}, ${n(m.height_m)}, ${n(m.weight_t)}, ${arr(m.armaments)}, ${q(m.description)}, ${q(m.image_url)})`,
).join(",\n");

const sql = `-- DIHASILKAN OTOMATIS dari src/data/seed.js (npm run seed:sql). Jangan diedit manual.
-- Jalankan SETELAH schema.sql. Aman dijalankan ulang: data lama dengan id sama diganti.

insert into series (id, slug, name, year, timeline, format, color, synopsis, image_url) values
${seriesRows}
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, year = excluded.year,
  timeline = excluded.timeline, format = excluded.format, color = excluded.color,
  synopsis = excluded.synopsis, image_url = excluded.image_url;

insert into mobile_suits (id, name, model_number, series_id, pilot, faction, unit_type, height_m, weight_t, armaments, description, image_url) values
${suitRows}
on conflict (id) do update set
  name = excluded.name, model_number = excluded.model_number, series_id = excluded.series_id,
  pilot = excluded.pilot, faction = excluded.faction, unit_type = excluded.unit_type,
  height_m = excluded.height_m, weight_t = excluded.weight_t, armaments = excluded.armaments,
  description = excluded.description, image_url = excluded.image_url;

-- Sinkronkan sequence identity agar POST berikutnya tidak bentrok dengan id manual di atas.
select setval(pg_get_serial_sequence('series', 'id'), (select max(id) from series));
select setval(pg_get_serial_sequence('mobile_suits', 'id'), (select max(id) from mobile_suits));
`;

const out = resolve(dirname(fileURLToPath(import.meta.url)), "../supabase/seed.sql");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, sql, "utf8");
console.log(`seed.sql dibuat: ${SERIES.length} series, ${MOBILE_SUITS.length} mobile suit`);
