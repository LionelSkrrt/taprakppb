import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { WifiOff } from 'lucide-react'
import BottomNav from './BottomNav'

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export default function Layout() {
  const online = useOnline()
  const { pathname } = useLocation()

  // Kembali ke atas setiap pindah halaman.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Gundam Nexus - ke beranda">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span>
            GUNDAM <b>NEXUS</b>
          </span>
        </Link>
        {!online && (
          <span className="offline" role="status">
            <WifiOff size={14} aria-hidden="true" /> Offline
          </span>
        )}
      </header>
      <main className="main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
