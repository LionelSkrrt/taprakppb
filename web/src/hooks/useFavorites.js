import { useSyncExternalStore } from 'react'

// Favorit disimpan di localStorage (tetap ada setelah aplikasi ditutup dan
// bisa dibuka saat offline). Store kecil ini membuat semua komponen yang
// memakai useFavorites ikut ter-update begitu ada perubahan.
const KEY = 'gundam_nexus_favorites'
const listeners = new Set()

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : []
  } catch {
    return []
  }
}

let snapshot = read()

function write(ids) {
  snapshot = ids
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    /* penyimpanan penuh/diblokir: favorit tetap bekerja selama sesi ini */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  // sinkron antar tab
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

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, () => snapshot)
  const isFavorite = (id) => ids.includes(Number(id))
  const toggle = (id) => {
    const n = Number(id)
    write(ids.includes(n) ? ids.filter((x) => x !== n) : [...ids, n])
  }
  return { ids, isFavorite, toggle, count: ids.length }
}
