import { test, before, after } from "node:test";
import assert from "node:assert/strict";

// Paksa mode memori + tanpa listen otomatis, apa pun isi .env.
process.env.VERCEL = "1";
process.env.SUPABASE_URL = "";
process.env.SUPABASE_KEY = "";
process.env.ADMIN_KEY = "rahasia-test";
process.env.NODE_ENV = "test";

const { default: app } = await import("../src/index.js");
const { SERIES, MOBILE_SUITS } = await import("../src/data/seed.js");

let server;
let base;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const call = (path, options = {}) =>
  fetch(base + path, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers ?? {}) },
  });
const admin = { "x-admin-key": "rahasia-test" };

test("GET / menampilkan info API", async () => {
  const res = await call("/");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.name, "Gundam Nexus API");
  assert.equal(body.dataSource, "memory");
});

test("GET /api/series mengembalikan semua series berurutan tahun + jumlah unit", async () => {
  const body = await (await call("/api/series")).json();
  assert.equal(body.length, SERIES.length);
  const years = body.map((s) => s.year);
  assert.deepEqual(years, [...years].sort((a, b) => a - b));
  assert.ok(body.every((s) => typeof s.mobile_suit_count === "number"));
  assert.equal(body.reduce((n, s) => n + s.mobile_suit_count, 0), MOBILE_SUITS.length);
});

test("GET /api/series?q= mencari", async () => {
  const body = await (await call("/api/series?q=seed")).json();
  assert.ok(body.some((s) => s.slug === "gundam-seed"));
  assert.ok(body.length < SERIES.length);
});

test("GET /api/series/:id memuat daftar mobile suit", async () => {
  const res = await call("/api/series/1");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.slug, "mobile-suit-gundam");
  assert.equal(body.mobile_suits.length, body.mobile_suit_count);
  assert.ok(body.mobile_suits.some((m) => m.model_number === "RX-78-2"));
});

test("GET /api/series/:id tidak ada -> 404, id bukan angka -> 404", async () => {
  assert.equal((await call("/api/series/9999")).status, 404);
  assert.equal((await call("/api/series/abc")).status, 404);
});

test("GET /api/mobile-suits mengembalikan semua unit dengan info series", async () => {
  const body = await (await call("/api/mobile-suits")).json();
  assert.equal(body.length, MOBILE_SUITS.length);
  assert.ok(body.every((m) => m.series && m.series.name));
});

test("GET /api/mobile-suits?q= mencari di nama, model, pilot", async () => {
  const byName = await (await call("/api/mobile-suits?q=zaku")).json();
  assert.ok(byName.length >= 1);
  const byPilot = await (await call("/api/mobile-suits?q=amuro")).json();
  assert.deepEqual(
    byPilot.map((m) => m.model_number).sort(),
    ["RX-78-2", "RX-93"],
  );
  const byModel = await (await call("/api/mobile-suits?q=rx-0")).json();
  assert.ok(byModel.some((m) => m.name === "Unicorn Gundam"));
});

test("GET /api/mobile-suits?series_id= memfilter", async () => {
  const body = await (await call("/api/mobile-suits?series_id=8")).json();
  assert.equal(body.length, 3);
  assert.ok(body.every((m) => m.series_id === 8));
  assert.equal((await call("/api/mobile-suits?series_id=x")).status, 400);
});

test("GET /api/mobile-suits/:id memuat series dan related", async () => {
  const body = await (await call("/api/mobile-suits/1")).json();
  assert.equal(body.name, "Gundam");
  assert.equal(body.series.id, 1);
  assert.ok(body.related.length > 0 && body.related.every((r) => r.id !== 1));
  assert.equal((await call("/api/mobile-suits/9999")).status, 404);
});

test("endpoint tulis ditolak tanpa/dengan x-admin-key salah", async () => {
  const payload = JSON.stringify({ name: "X", slug: "x", year: 2000 });
  assert.equal((await call("/api/series", { method: "POST", body: payload })).status, 401);
  assert.equal(
    (await call("/api/series", { method: "POST", body: payload, headers: { "x-admin-key": "salah" } })).status,
    401,
  );
  assert.equal((await call("/api/mobile-suits/1", { method: "DELETE" })).status, 401);
});

test("CRUD mobile suit lengkap", async () => {
  const created = await call("/api/mobile-suits", {
    method: "POST",
    headers: admin,
    body: JSON.stringify({
      name: "Test Suit",
      model_number: "TS-01",
      series_id: 1,
      armaments: ["Beam Rifle"],
      height_m: 18.5,
      weight_t: null,
      hack: "tidak boleh tersimpan",
    }),
  });
  assert.equal(created.status, 201);
  const row = await created.json();
  assert.equal(row.name, "Test Suit");
  assert.equal(row.hack, undefined, "field di luar whitelist harus dibuang");

  const updated = await call(`/api/mobile-suits/${row.id}`, {
    method: "PUT",
    headers: admin,
    body: JSON.stringify({ pilot: "Tester" }),
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).pilot, "Tester");

  assert.equal((await call(`/api/mobile-suits/${row.id}`)).status, 200);
  assert.equal((await call(`/api/mobile-suits/${row.id}`, { method: "DELETE", headers: admin })).status, 200);
  assert.equal((await call(`/api/mobile-suits/${row.id}`)).status, 404);
  assert.equal((await call(`/api/mobile-suits/${row.id}`, { method: "DELETE", headers: admin })).status, 404);
});

test("validasi: field wajib, tipe salah, series_id tidak ada, JSON rusak", async () => {
  const post = (body) =>
    call("/api/mobile-suits", { method: "POST", headers: admin, body: typeof body === "string" ? body : JSON.stringify(body) });

  assert.equal((await post({ name: "Tanpa model" })).status, 400);
  assert.equal((await post({ name: "A", model_number: "B", series_id: "1" })).status, 400);
  assert.equal((await post({ name: "A", model_number: "B", series_id: 9999 })).status, 400);
  assert.equal((await post({ name: "A", model_number: "B", series_id: 1, armaments: "bukan array" })).status, 400);
  assert.equal((await post("{rusak")).status, 400);
  assert.equal((await call("/api/mobile-suits", { method: "POST", headers: admin })).status, 400);
});

test("CRUD series; menghapus series ikut menghapus mobile suit-nya", async () => {
  const created = await call("/api/series", {
    method: "POST",
    headers: admin,
    body: JSON.stringify({ slug: "tes", name: "Series Tes", year: 2030 }),
  });
  assert.equal(created.status, 201);
  const row = await created.json();
  const put = await call(`/api/series/${row.id}`, {
    method: "PUT",
    headers: admin,
    body: JSON.stringify({ name: "Series Tes 2" }),
  });
  assert.equal((await put.json()).name, "Series Tes 2");

  const suit = await (
    await call("/api/mobile-suits", {
      method: "POST",
      headers: admin,
      body: JSON.stringify({ name: "Unit Tes", model_number: "T-1", series_id: row.id }),
    })
  ).json();

  assert.equal((await call(`/api/series/${row.id}`, { method: "DELETE", headers: admin })).status, 200);
  assert.equal((await call(`/api/series/${row.id}`)).status, 404);
  assert.equal((await call(`/api/mobile-suits/${suit.id}`)).status, 404);
});

test("route tidak dikenal -> 404 JSON", async () => {
  const res = await call("/api/tidak-ada");
  assert.equal(res.status, 404);
  assert.ok((await res.json()).error);
});

test("data seed konsisten: id unik, series_id valid, tiap unit punya gambar", () => {
  const uniq = (a) => new Set(a).size === a.length;
  assert.ok(uniq(SERIES.map((s) => s.id)) && uniq(MOBILE_SUITS.map((m) => m.id)));
  assert.ok(uniq(SERIES.map((s) => s.slug)));
  const ids = new Set(SERIES.map((s) => s.id));
  assert.ok(MOBILE_SUITS.every((m) => ids.has(m.series_id)));
  assert.ok(SERIES.every((s) => MOBILE_SUITS.some((m) => m.series_id === s.id)));
  assert.ok(MOBILE_SUITS.every((m) => typeof m.image_url === "string" && m.image_url.startsWith("https://")));
});
