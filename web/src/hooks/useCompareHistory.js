import { useSyncExternalStore } from 'react'

// Riwayat perbandingan disimpan di localStorage. Setiap entri menyimpan SALINAN
// data unit (bukan hanya id), sehingga riwayat tetap bisa dibuka saat offline
// walaupun data dari API belum pernah dimuat di perangkat ini.
const KEY = 'gundam_nexus_compare_history'
const MAX_ENTRIES = 30
const listeners = new Set()

const isValidEntry = (e) =>
  e && typeof e.id === 'number' && Array.isArray(e.suits) && e.suits.length >= 2 && e.suits.every((s) => Number.isInteger(s?.id))

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(isValidEntry) : []
  } catch {
    return []
  }
}

let snapshot = read()

function write(entries) {
  snapshot = entries
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    /* penyimpanan penuh/diblokir: riwayat tetap ada selama sesi ini */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  const onStorage = (e) => {
    if (e.key === KEY) {
      snapshot = read()
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

// Hanya field yang dibutuhkan halaman Bandingkan.
export const toSnapshot = (s) => ({
  id: s.id,
  name: s.name,
  model_number: s.model_number,
  pilot: s.pilot ?? null,
  faction: s.faction ?? null,
  unit_type: s.unit_type ?? null,
  height_m: s.height_m ?? null,
  weight_t: s.weight_t ?? null,
  armaments: Array.isArray(s.armaments) ? s.armaments : [],
  image_url: s.image_url ?? null,
  series: s.series ? { id: s.series.id, name: s.series.name, color: s.series.color, year: s.series.year } : null,
})

const setKey = (ids) => [...ids].sort((a, b) => a - b).join(',')

export function useCompareHistory() {
  const entries = useSyncExternalStore(subscribe, () => snapshot)

  // Menyimpan perbandingan. Kombinasi unit yang sama tidak diduplikasi:
  // entri lama dihapus dan versi terbaru diletakkan paling atas.
  const save = (suits) => {
    const key = setKey(suits.map((s) => s.id))
    const others = snapshot.filter((e) => setKey(e.suits.map((s) => s.id)) !== key)
    const entry = { id: Date.now(), createdAt: new Date().toISOString(), suits: suits.map(toSnapshot) }
    write([entry, ...others].slice(0, MAX_ENTRIES))
    return entry
  }

  const remove = (id) => write(snapshot.filter((e) => e.id !== id))
  const clear = () => write([])

  return { entries, save, remove, clear }
}
