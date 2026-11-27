import { Link } from 'react-router-dom'
import { GitCompareArrows, Heart } from 'lucide-react'
import { useSuits } from '../hooks/useCatalog'
import { useFavorites } from '../hooks/useFavorites'
import SuitCard from '../components/SuitCard'
import { ErrorState, Loading } from '../components/StateView'

export default function Favorites() {
  const { ids } = useFavorites()
  // Memakai daftar penuh yang sama dengan halaman Unit, jadi hasilnya dari cache.
  const { data, loading, error, retry } = useSuits()

  const favorites = data?.filter((s) => ids.includes(s.id)) ?? []

  return (
    <div className="page">
      <header className="page-head">
        <h1>Favorit</h1>
        <p className="muted">Unit yang kamu tandai. Tersimpan di perangkat ini.</p>
      </header>

      {ids.length === 0 && (
        <div className="state">
          <Heart size={32} aria-hidden="true" />
          <h3>Belum ada favorit</h3>
          <p>Ketuk ikon hati pada sebuah unit untuk menyimpannya di sini.</p>
          <Link to="/suits" className="btn btn-primary">
            Jelajahi unit
          </Link>
        </div>
      )}

      {ids.length > 0 && loading && <Loading rows={Math.min(ids.length, 4)} />}
      {ids.length > 0 && error && <ErrorState message={error} onRetry={retry} />}
      {favorites.length > 0 && (
        <>
          <div className="row-between">
            <p className="count">{favorites.length} unit</p>
            {favorites.length >= 2 && (
              <Link
                to={`/compare?ids=${favorites
                  .slice(0, 3)
                  .map((s) => s.id)
                  .join(',')}`}
                className="btn"
              >
                <GitCompareArrows size={16} aria-hidden="true" /> Bandingkan favorit
              </Link>
            )}
          </div>
          <div className="grid">
            {favorites.map((s) => (
              <SuitCard key={s.id} suit={s} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
