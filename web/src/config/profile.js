// Data halaman Profil/About. Ubah sesuai kebutuhan sebelum dikumpulkan.
export const PROFILE = {
  appName: 'Gundam Nexus',
  version: '1.0.0',
  tagline: 'Ensiklopedia mobile suit dan serial Gundam.',
  developer: {
    name: 'Lionel Jeremi Pinondang Siahaan',
    nim: '21120124130067',
    course: 'Praktikum Pemrograman Perangkat Bergerak (PPB) - Tugas Akhir',
  },
  // Isi dengan link repository GitHub kamu.
  githubUrl: 'https://github.com/',
  stack: [
    { name: 'React 19 + Vite', note: 'Antarmuka SPA berbasis komponen' },
    { name: 'React Router', note: 'Navigasi antar halaman & detail' },
    { name: 'Axios', note: 'Konsumsi REST API' },
    { name: 'vite-plugin-pwa (Workbox)', note: 'Service worker, manifest, offline' },
    { name: 'Express + Supabase', note: 'Web service sendiri (Modul 1)' },
  ],
}
