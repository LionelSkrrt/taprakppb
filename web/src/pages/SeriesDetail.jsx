import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useSeries } from '../hooks/useCatalog'
import BackLink from '../components/BackLink'
import ShareButton from '../components/ShareButton'
import { ErrorState, Loading } from '../components/StateView'

export default function SeriesDetail() {
  const { id } = useParams()
  const { data: series, loading, error, status, retry } = useSeries(id)

  return (
    <div className="page">
      <BackLink fallback="/series" label="Daftar series" />

      {loading && <Loading rows={2} />}
      {error && <ErrorState message={error} onRetry={status === 404 ? undefined : retry} />}

      {series && (
        <article className="detail" style={{ '--accent': series.color }}>
          <header className="series-hero">
            <span className="model">
              {series.year} · {series.format}
            </span>
            <h1>{series.name}</h1>
            <p className="muted">{series.timeline}</p>
            <div className="actions">
              <ShareButton title={`${series.name} - Gundam Nexus`} text={series.name} />
            </div>
          </header>

          <section>
            <h2>Sinopsis</h2>
            <p>{series.synopsis || 'Belum ada sinopsis.'}</p>
          </section>

          <section>
            <h2>Mobile suit ({series.mobile_suit_count})</h2>
            {series.mobile_suits.length === 0 ? (
              <p className="muted">Belum ada unit untuk series ini.</p>
            ) : (
              <ul className="rows">
                {series.mobile_suits.map((m) => (
                  <li key={m.id}>
                    <Link to={`/suits/${m.id}`}>
                      <div>
                        <span className="model">{m.model_number}</span>
                        <strong>{m.name}</strong>
                        <span className="muted">{m.pilot}</span>
                      </div>
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      )}
    </div>
  )
}
