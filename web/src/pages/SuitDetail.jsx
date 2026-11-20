import { Link, useParams } from 'react-router-dom'
import { useSuit } from '../hooks/useCatalog'
import BackLink from '../components/BackLink'
import SuitArt from '../components/SuitArt'
import FavoriteButton from '../components/FavoriteButton'
import ShareButton from '../components/ShareButton'
import { ErrorState, Loading } from '../components/StateView'

const dash = (v, unit) => (v === null || v === undefined || v === '' ? '—' : `${v}${unit ? ` ${unit}` : ''}`)

export default function SuitDetail() {
  const { id } = useParams()
  const { data: suit, loading, error, status, retry } = useSuit(id)

  return (
    <div className="page">
      <BackLink fallback="/suits" label="Daftar unit" />

      {loading && <Loading rows={2} />}
      {error && <ErrorState message={error} onRetry={status === 404 ? undefined : retry} />}

      {suit && (
        <article className="detail" style={{ '--accent': suit.series?.color }}>
          <SuitArt
            image={suit.image_url}
            accent={suit.series?.color}
            label={suit.model_number}
            alt={`${suit.name} (${suit.model_number})`}
            className="art-hero"
          />

          <header>
            <span className="model">{suit.model_number}</span>
            <h1>{suit.name}</h1>
            {suit.series && (
              <p>
                <Link to={`/series/${suit.series.id}`} className="series-link">
                  {suit.series.name} ({suit.series.year})
                </Link>
              </p>
            )}
            <div className="actions">
              <FavoriteButton id={suit.id} name={suit.name} />
              <ShareButton title={`${suit.name} - Gundam Nexus`} text={`${suit.name} (${suit.model_number})`} />
            </div>
          </header>

          <section>
            <h2>Deskripsi</h2>
            <p>{suit.description || 'Belum ada deskripsi.'}</p>
          </section>

          <section>
            <h2>Spesifikasi</h2>
            <dl className="specs">
              <div>
                <dt>Pilot</dt>
                <dd>{dash(suit.pilot)}</dd>
              </div>
              <div>
                <dt>Faksi</dt>
                <dd>{dash(suit.faction)}</dd>
              </div>
              <div>
                <dt>Tipe</dt>
                <dd>{dash(suit.unit_type)}</dd>
              </div>
              <div>
                <dt>Tinggi</dt>
                <dd>{dash(suit.height_m, 'm')}</dd>
              </div>
              <div>
                <dt>Berat</dt>
                <dd>{dash(suit.weight_t, 'ton')}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>Persenjataan</h2>
            {suit.armaments?.length ? (
              <ul className="tags">
                {suit.armaments.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Data persenjataan belum tersedia.</p>
            )}
          </section>

          {suit.related?.length > 0 && (
            <section>
              <h2>Unit lain di serial ini</h2>
              <ul className="related">
                {suit.related.map((r) => (
                  <li key={r.id}>
                    <Link to={`/suits/${r.id}`}>
                      <span className="model">{r.model_number}</span>
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}
    </div>
  )
}
