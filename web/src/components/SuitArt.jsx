import { useState } from 'react'

// Gambar unit/serial. Jika image_url kosong atau gagal dimuat, tampilkan
// ilustrasi buatan sendiri (gradien warna serial + V-fin + nomor model),
// sehingga tidak bergantung pada gambar berhak cipta.
export default function SuitArt({ image, accent = '#35d4ff', label = '', alt = '', className = '' }) {
  const [failed, setFailed] = useState(false)
  const showImage = image && !failed

  return (
    <div className={`art ${showImage ? 'art-photo' : ''} ${className}`} style={{ '--accent': accent }}>
      {showImage ? (
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setFailed(true)}
        />
      ) : (
        <svg viewBox="0 0 200 140" role="img" aria-label={alt || label} preserveAspectRatio="xMidYMid slice">
          <g className="art-grid">
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`v${i}`} x1={i * 25} y1="0" x2={i * 25} y2="140" />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 28} x2="200" y2={i * 28} />
            ))}
          </g>
          <circle cx="100" cy="62" r="40" className="art-ring" />
          <path d="M100 82 L78 38 M100 82 L122 38" className="art-fin" />
          <circle cx="100" cy="62" r="4" className="art-eye" />
          <text x="100" y="124" textAnchor="middle" className="art-label">
            {label}
          </text>
        </svg>
      )}
    </div>
  )
}
