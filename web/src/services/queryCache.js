import { apiClient } from '../config/api'

// Query caching sederhana untuk request GET.
// - Hasil disimpan di memori selama TTL, jadi pindah halaman bolak-balik
//   tidak memanggil API lagi.
// - Yang disimpan adalah promise-nya, jadi dua komponen yang meminta data
//   sama dalam waktu bersamaan hanya memicu satu request.
// - Request yang gagal tidak disimpan.
const TTL_MS = 5 * 60 * 1000
const cache = new Map()

export function cachedGet(path, params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null),
  )
  const key = `${path}?${new URLSearchParams(clean).toString()}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise

  const promise = apiClient.get(path, { params: clean })
  cache.set(key, { at: Date.now(), promise })
  promise.catch(() => {
    if (cache.get(key)?.promise === promise) cache.delete(key)
  })
  return promise
}

export function clearQueryCache() {
  cache.clear()
}
