import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="page">
      <div className="state">
        <Compass size={32} aria-hidden="true" />
        <h3>Halaman tidak ditemukan</h3>
        <p>Alamat yang kamu buka tidak ada di Gundam Nexus.</p>
        <Link to="/" className="btn btn-primary">
          Ke beranda
        </Link>
      </div>
    </div>
  )
}
