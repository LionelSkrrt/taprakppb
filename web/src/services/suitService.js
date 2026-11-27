import { cachedGet } from './queryCache'

// Salinan daftar unit lengkap di localStorage. Dipakai sebagai cadangan saat
// offline (mis. halaman Bandingkan dan detail unit), di luar cache service worker.
const SNAPSHOT_KEY = 'gundam_nexus_catalog_v1'
let lastSaved = null

function saveSnapshot(list) {
  if (!Array.isArray(list) || list === lastSaved) return
  lastSaved = list
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ savedAt: Date.now(), data: list }))
  } catch {
    /* penyimpanan penuh/diblokir: tetap jalan tanpa salinan offline */
  }
}

export function readSnapshot() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || 'null')
    return Array.isArray(parsed?.data) ? parsed : null
  } catch {
    return null
  }
}

const suitService = {
  // params: { q, series_id }
  getAll: (params = {}) => {
    const request = cachedGet('/mobile-suits', params)
    const isFullList = !params.q && !params.series_id
    if (!isFullList) return request
    return request
      .then((list) => {
        saveSnapshot(list)
        return list
      })
      .catch((err) => {
        const snapshot = readSnapshot()
        if (snapshot) return snapshot.data
        throw err
      })
  },

  getById: (id) =>
    cachedGet(`/mobile-suits/${id}`).catch((err) => {
      // Offline dan halaman ini belum pernah dibuka: susun dari salinan katalog.
      const list = readSnapshot()?.data
      const suit = list?.find((s) => s.id === Number(id))
      if (!suit) throw err
      const related = list
        .filter((s) => s.series_id === suit.series_id && s.id !== suit.id)
        .slice(0, 4)
        .map(({ id, name, model_number, image_url }) => ({ id, name, model_number, image_url }))
      return { ...suit, related }
    }),
}

export default suitService
