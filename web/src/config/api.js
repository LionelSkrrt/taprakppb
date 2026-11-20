import axios from 'axios'

// URL API (Express). Atur lewat VITE_API_BASE_URL, contoh: https://api-kamu.vercel.app/api
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
).replace(/\/$/, '')

// Root API (tanpa /api) dipakai untuk cek status di halaman Profil.
export const API_ROOT_URL = API_BASE_URL.replace(/\/api$/, '')

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: { Accept: 'application/json' },
})

// Response interceptor: langsung kembalikan body, dan ubah semua error
// menjadi { message, status } yang ramah dibaca UI.
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Terjadi kesalahan tak terduga.'
    let status = null
    if (error.response) {
      status = error.response.status
      message = error.response.data?.error || `Server error (${status})`
    } else if (error.code === 'ECONNABORTED') {
      message = 'Server terlalu lama merespons. Coba lagi.'
    } else if (error.request) {
      message = 'Tidak bisa terhubung ke server. Periksa koneksi internet kamu.'
    }
    return Promise.reject({ message, status })
  },
)
