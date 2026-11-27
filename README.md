# Gundam Nexus

Ensiklopedia (wiki) Gundam berbentuk **Progressive Web App**: jelajahi mobile suit, pilot, faksi, dan serial tempat mereka muncul. Tugas Akhir Praktikum PPB (platform: **PWA**).

| Bagian | Teknologi | Folder |
|---|---|---|
| Frontend (PWA) | React + Vite, React Router, Axios, vite-plugin-pwa | [`web/`](web) |
| Backend (web service buatan sendiri, Modul 1) | Node.js + Express, Supabase | [`api/`](api) |

## Demo (Vercel)

| | URL |
|---|---|
| Aplikasi (PWA) | https://gundam-nexus-nine.vercel.app |
| API | https://gundam-nexus-api.vercel.app (contoh: [`/api/series`](https://gundam-nexus-api.vercel.app/api/series), [`/api/mobile-suits`](https://gundam-nexus-api.vercel.app/api/mobile-suits)) |

## Pemenuhan ketentuan Tugas Akhir

| Ketentuan | Implementasi |
|---|---|
| API sendiri sesuai Modul 1 | `api/` - Express + Supabase, struktur model / controller / routes |
| Bottom Navigation Bar | `web/src/components/BottomNav.jsx` (Beranda, Unit, Series, Favorit, Profil) |
| Minimal 5 halaman | 8 halaman: Beranda, Daftar Unit, Detail Unit, Daftar Series, Detail Series, Favorit, Profil, Bandingkan |
| 2 halaman list + detail | **Unit** (`/suits` -> `/suits/:id`) dan **Series** (`/series` -> `/series/:id`) |
| Halaman Profile/About | `/profile` |
| GitHub | repository ini |
| PWA wajib deploy free hosting | Vercel (lihat bagian Deploy) |

Tambahan: pencarian + filter, favorit (localStorage), tombol bagikan tautan, lazy-load gambar, query caching, mode offline (service worker), tombol "Pasang aplikasi", dan **perbandingan mobile suit** (`/compare`).

### Fitur Bandingkan
- Pilih 2 sampai 3 unit lalu bandingkan series, pilot, faksi, tipe, tinggi, berat, jumlah senjata, dan persenjataan. Nilai tertinggi disorot hijau, senjata yang sama disorot emas, dan ada ringkasan persamaan.
- Jalan masuk: kartu di Beranda, tombol di halaman Unit, tombol **Bandingkan** di detail unit, dan **Bandingkan favorit** di halaman Favorit. Pilihan tersimpan di URL (`/compare?ids=1,11`) sehingga bisa dibagikan.
- **Riwayat perbandingan** disimpan di `localStorage` beserta salinan data unitnya, jadi tetap bisa dibuka offline. Kombinasi yang sama tidak diduplikasi; maksimal 30 entri, bisa dihapus satu per satu atau semuanya.
- **Offline**: daftar unit lengkap juga disalin ke `localStorage` setiap kali berhasil dimuat, sehingga halaman Bandingkan dan detail unit tetap bisa dibuka walau cache service worker kosong.

## Struktur

```
api/   Express API (src/models, src/controllers, src/routes, supabase/*.sql, test/)
web/   React PWA   (src/pages, src/components, src/hooks, src/services, src/config)
```

## Menjalankan di lokal

### 1. API

```bash
cd api
npm install
cp .env.example .env     # lalu isi bila memakai Supabase
npm run dev              # http://localhost:3000
```

Tanpa `SUPABASE_URL`/`SUPABASE_KEY`, API otomatis memakai **data seed di memori** (21 series, 62 mobile suit) sehingga bisa langsung dicoba. Perubahan POST/PUT/DELETE hilang saat server restart. Cek `GET /` untuk melihat `dataSource` (`memory` atau `supabase`).

### 2. Frontend

```bash
cd web
npm install
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:3000/api
npm run dev              # http://localhost:5173
```

Untuk mencoba mode PWA/offline (service worker hanya aktif pada build produksi):

```bash
npm run build
npm run preview          # http://localhost:4173
```

## Memakai Supabase (data permanen)

1. Buat project di [supabase.com](https://supabase.com).
2. **SQL Editor** -> New query -> tempel isi [`api/supabase/schema.sql`](api/supabase/schema.sql) -> Run.
3. New query lagi -> tempel isi [`api/supabase/seed.sql`](api/supabase/seed.sql) -> Run. (File ini dihasilkan dari `api/src/data/seed.js` lewat `npm run seed:sql`.)
4. **Project Settings -> Data API** salin *Project URL*; **API Keys** salin *anon public*. Masukkan ke `api/.env` sebagai `SUPABASE_URL` dan `SUPABASE_KEY`.
5. RLS sudah dinyalakan dan policy-nya ada di `schema.sql`, jadi tidak perlu langkah tambahan.

## Endpoint API

Base URL: `/api`. Respons JSON. Format error: `{ "error": "pesan" }`.

| Method | Path | Keterangan |
|---|---|---|
| GET | `/series` | Semua series, urut tahun, berisi `mobile_suit_count`. `?q=` untuk cari |
| GET | `/series/:id` | Detail series + daftar `mobile_suits` |
| POST | `/series` | Tambah series *(butuh `x-admin-key`)* |
| PUT | `/series/:id` | Ubah series *(admin)* |
| DELETE | `/series/:id` | Hapus series dan unitnya *(admin)* |
| GET | `/mobile-suits` | Semua unit + info `series`. `?q=` (nama, model, pilot, faksi), `?series_id=` |
| GET | `/mobile-suits/:id` | Detail unit + `series` + `related` |
| POST | `/mobile-suits` | Tambah unit *(admin)* |
| PUT | `/mobile-suits/:id` | Ubah unit *(admin)* |
| DELETE | `/mobile-suits/:id` | Hapus unit *(admin)* |

Contoh body `POST /api/mobile-suits`:

```json
{
  "name": "Gundam Barbatos Lupus",
  "model_number": "ASW-G-08",
  "series_id": 10,
  "pilot": "Mikazuki Augus",
  "faction": "Tekkadan",
  "height_m": 18.0,
  "armaments": ["Mace", "Lance"],
  "description": "..."
}
```

Endpoint tulis dilindungi header `x-admin-key` (nilai `ADMIN_KEY` di `.env`) agar API publik tidak bisa diubah sembarang orang. Di production tanpa `ADMIN_KEY`, endpoint tulis ditolak (403). Endpoint baca (GET) selalu terbuka, jadi aplikasi tidak perlu kunci apa pun.

Tes otomatis API (15 skenario, mode memori, termasuk cek konsistensi data seed): `cd api && npm test`.

## Deploy (Vercel)

Gunakan **dua project Vercel** dari repository yang sama.

**API**
1. Vercel -> Add New -> Project -> import repo ini. **Root Directory: `api`**.
2. Environment Variables: `SUPABASE_URL`, `SUPABASE_KEY`, `ADMIN_KEY`, dan (opsional) `CORS_ORIGIN` = URL frontend.
3. Deploy, lalu uji `https://<api>.vercel.app/api/series` di browser/Postman.

**Frontend**
1. Add New -> Project -> import repo yang sama. **Root Directory: `web`**, Framework Preset: Vite.
2. Environment Variable: `VITE_API_BASE_URL` = `https://<api>.vercel.app/api`.
3. Deploy. Rewrites SPA sudah diatur di `web/vercel.json`, jadi tautan langsung seperti `/suits/11` tetap bisa dibuka.

Setelah itu: buka di HP -> menu browser -> *Add to Home screen / Pasang aplikasi*.

## Catatan

- **Gambar**: 62 gambar unit dimuat (hotlink, tidak disimpan di repo) dari [Gundam Wiki](https://gundam.fandom.com); hak ciptanya milik Sotsu/Sunrise, dan sumbernya dicantumkan di halaman Profil. Server gambar wiki menolak permintaan yang membawa header Referer, jadi tag `<img>` memakai `referrerPolicy="no-referrer"`. Jika sebuah gambar gagal dimuat, komponen otomatis kembali ke ilustrasi buatan sendiri (gradien warna serial + V-fin + nomor model). Gambar series belum diisi (`image_url` kosong).
- **Data**: deskripsi ditulis sendiri. Angka tinggi/berat sebaiknya dicek ulang ke sumber resmi; nilai yang tidak pasti sengaja dikosongkan.
- **Profil**: ubah nama, NIM, dan link GitHub di `web/src/config/profile.js`.
- Gundam adalah merek dagang Sotsu/Sunrise/Bandai Namco. Proyek ini dibuat untuk keperluan belajar, bukan produk resmi.
