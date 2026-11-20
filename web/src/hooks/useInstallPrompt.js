import { useEffect, useState } from 'react'

// Event beforeinstallprompt bisa muncul sebelum halaman Profil dibuka,
// jadi disimpan di level modul.
let deferred = null
const listeners = new Set()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e
    listeners.forEach((l) => l(true))
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    listeners.forEach((l) => l(false))
  })
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(Boolean(deferred))

  useEffect(() => {
    listeners.add(setCanInstall)
    return () => listeners.delete(setCanInstall)
  }, [])

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    deferred = null
    setCanInstall(false)
  }

  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

  return { canInstall, install, standalone }
}
