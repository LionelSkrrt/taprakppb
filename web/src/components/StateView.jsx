import { CircleAlert, RefreshCw, SearchX } from 'lucide-react'

// Tampilan standar untuk status loading / error / kosong.
export function Loading({ rows = 6 }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Memuat data">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <CircleAlert size={32} aria-hidden="true" />
      <h3>Data gagal dimuat</h3>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" /> Coba lagi
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title = 'Tidak ada hasil', children }) {
  return (
    <div className="state">
      <SearchX size={32} aria-hidden="true" />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  )
}
