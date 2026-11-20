import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import seriesRoutes from "./routes/seriesRoutes.js";
import mobileSuitRoutes from "./routes/mobileSuitRoutes.js";
import { dataSource } from "./config/repository.js";

dotenv.config({ quiet: true });

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Gundam Nexus API",
    version: "1.0.0",
    dataSource,
    endpoints: ["/api/series", "/api/mobile-suits"],
  });
});

app.use("/api/series", seriesRoutes);
app.use("/api/mobile-suits", mobileSuitRoutes);

// 404 untuk route yang tidak dikenal
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan." });
});

// Error handler terakhir (mis. JSON body rusak)
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  res.status(status).json({ error: status === 400 ? "Body JSON tidak valid." : err.message });
});

const port = process.env.PORT || 3000;

// Di Vercel, app diekspor sebagai handler; listen hanya untuk lokal.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Gundam Nexus API berjalan di port ${port} (data: ${dataSource})`);
  });
}

export default app;
