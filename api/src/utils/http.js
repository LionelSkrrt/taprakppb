// Helper kecil untuk controller.

// Mengubah :id dari URL menjadi integer. Mengembalikan null jika tidak valid.
export function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

// Error dari Supabase/Postgres: 23503 = pelanggaran foreign key,
// 23505 = nilai unik sudah ada.
export function dbErrorStatus(err) {
  if (err?.code === "23503" || err?.code === "23505") return 409;
  return 500;
}

const isBlank = (v) => typeof v !== "string" || v.trim() === "";
const isNumberOrNull = (v) => v === null || (typeof v === "number" && Number.isFinite(v));

// Validasi body. `partial` = true untuk PUT (hanya field yang dikirim dicek).
// Mengembalikan pesan error atau null.
export function validate(body, rules, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Body harus berupa objek JSON.";
  }
  for (const [field, rule] of Object.entries(rules)) {
    const present = Object.hasOwn(body, field);
    if (!present) {
      if (!partial && rule.required) return `Field "${field}" wajib diisi.`;
      continue;
    }
    const value = body[field];
    if (rule.type === "string" && isBlank(value)) return `Field "${field}" harus berupa teks.`;
    if (rule.type === "int" && !Number.isInteger(value)) return `Field "${field}" harus berupa bilangan bulat.`;
    if (rule.type === "number?" && !isNumberOrNull(value)) return `Field "${field}" harus berupa angka atau null.`;
    if (rule.type === "string?" && value !== null && typeof value !== "string") return `Field "${field}" harus berupa teks atau null.`;
    if (rule.type === "strings" && !(Array.isArray(value) && value.every((v) => typeof v === "string"))) {
      return `Field "${field}" harus berupa array teks.`;
    }
  }
  return null;
}
