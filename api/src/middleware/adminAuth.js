// Endpoint baca (GET) terbuka untuk publik. Endpoint tulis (POST/PUT/DELETE)
// dilindungi header `x-admin-key` supaya API yang sudah di-deploy tidak bisa
// diubah sembarang orang.
//
// - ADMIN_KEY terisi  -> header harus cocok.
// - ADMIN_KEY kosong  -> boleh di development, ditolak di production.
export function adminAuth(req, res, next) {
  const expected = process.env.ADMIN_KEY;

  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      return res
        .status(403)
        .json({ error: "Endpoint tulis dinonaktifkan: ADMIN_KEY belum diatur." });
    }
    return next();
  }

  if (req.get("x-admin-key") !== expected) {
    return res.status(401).json({ error: "x-admin-key tidak valid." });
  }
  next();
}
