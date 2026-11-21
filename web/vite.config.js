import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gundam Nexus',
        short_name: 'Gundam Nexus',
        description: 'Ensiklopedia mobile suit dan serial Gundam.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0b1020',
        theme_color: '#0b1020',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Data API (series & mobile-suits): ambil dari jaringan, cadangkan ke cache agar tetap terbaca offline.
            urlPattern: ({ url }) => /\/api\/(series|mobile-suits)/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gundam-api',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Gambar unit/serial dari sumber eksternal.
            // Hanya respons 200 yang disimpan. Gambar dimuat dengan crossOrigin="anonymous"
            // (lihat SuitArt) sehingga respons bukan "opaque" dan statusnya terbaca; dengan
            // begitu gambar pengganti 404 dari server gambar tidak ikut tersimpan.
            // Nama cache diberi -v2 agar entri lama yang sudah tercemar tidak dipakai lagi.
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'gundam-images-v2',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
})
