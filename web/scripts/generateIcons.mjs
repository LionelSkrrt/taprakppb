// Membuat ikon PWA (PNG) tanpa library: node scripts/generateIcons.mjs
// Desain: latar navy, cincin cyan, V-fin emas, "mata" cyan.
import { deflateSync, crc32 } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const BG = hex("#0b1020");
const CYAN = hex("#35d4ff");
const GOLD = hex("#f2b705");
const WHITE = hex("#e8ecf8");

// jarak titik ke segmen (kapsul)
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Mengembalikan warna di titik (x,y) dalam koordinat 0..1
function shade(x, y) {
  // V-fin (dua kapsul)
  if (distSeg(x, y, 0.5, 0.68, 0.27, 0.27) < 0.038) return GOLD;
  if (distSeg(x, y, 0.5, 0.68, 0.73, 0.27) < 0.038) return GOLD;
  // "mata"
  if (Math.hypot(x - 0.5, y - 0.5) < 0.045) return CYAN;
  // dagu
  if (x > 0.42 && x < 0.58 && y > 0.74 && y < 0.79) return WHITE;
  // cincin
  const r = Math.hypot(x - 0.5, y - 0.5);
  if (r > 0.38 && r < 0.405) return CYAN;
  return BG;
}

function renderPng(size) {
  const SS = 3; // supersampling 3x3
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let py = 0; py < size; py++) {
    raw[py * (size * 4 + 1)] = 0; // filter none
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = shade((px + (sx + 0.5) / SS) / size, (py + (sy + 0.5) / SS) / size);
          r += c[0]; g += c[1]; b += c[2];
        }
      }
      const n = SS * SS;
      const o = py * (size * 4 + 1) + 1 + px * 4;
      raw[o] = Math.round(r / n);
      raw[o + 1] = Math.round(g / n);
      raw[o + 2] = Math.round(b / n);
      raw[o + 3] = 255;
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), "../public");
mkdirSync(publicDir, { recursive: true });
for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  writeFileSync(resolve(publicDir, name), renderPng(size));
  console.log("dibuat", name);
}
