import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// Tombol kembali. Jika halaman dibuka langsung dari tautan yang dibagikan
// (tidak ada riwayat di aplikasi), arahkan ke daftar `fallback`.
export default function BackLink({ fallback, label = 'Kembali' }) {
  const navigate = useNavigate()
  const { key } = useLocation()

  const goBack = () => (key === 'default' ? navigate(fallback) : navigate(-1))

  return (
    <button type="button" className="back" onClick={goBack}>
      <ArrowLeft size={18} aria-hidden="true" /> {label}
    </button>
  )
}
