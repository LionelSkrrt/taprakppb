import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import { useSeriesList, useSuits } from '../hooks/useCatalog'
import SuitArt from '../components/SuitArt'
import { ErrorState } from '../components/StateView'

// "Unit hari ini": berganti tiap hari, tapi sama untuk semua pengguna.
function pickDaily(list) {
  if (!list?.length) return null
  const day = Math.floor(Date.now() / 86_400_000)
  return list[day % list.length]
}

export default function Home() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const suits = useSuits()
  const series = useSeriesList()

  const featured = pickDaily(suits.data)

  const submit = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/suits?q=${encodeURIComponent(q)}` : '/suits')
  }

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Ensiklopedia Gundam</p>
        <h1>
          Semua mobile suit,
          <br />
          dalam satu <span>nexus</span>.
        </h1>
        <form className="searchbox hero-search" onSubmit={submit} role="search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari unit, pilot, nomor model"
            aria-label="Cari mobile suit"
          />
          <button type="submit" className="btn btn-primary">
            Cari
          </button>
        </form>

        <dl className="stats">
          <div>
            <dt>Series</dt>
            <dd>{series.data ? series.data.length : '–'}</dd>
          </div>
          <div>
            <dt>Mobile suit</dt>
            <dd>{suits.data ? suits.data.length : '–'}</dd>
          </div>
        </dl>
      </section>

      {(suits.error || series.error) && (
        <ErrorState
          message={suits.error || series.error}
          onRetry={() => {
            suits.retry()
            series.retry()
          }}
        />
      )}

      {featured && (
        <section>
          <div className="section-head">
            <h2>Unit hari ini</h2>
          </div>
          <Link to={`/suits/${featured.id}`} className="card featured">
            <SuitArt
              image={featured.image_url}
              accent={featured.series?.color}
              label={featured.model_number}
              alt={`${featured.name} (${featured.model_number})`}
            />
            <div className="card-body">
              <span className="model">{featured.model_number}</span>
              <h3>{featured.name}</h3>
              <p className="muted">
                {featured.pilot} · {featured.series?.name}
              </p>
              <p className="clamp">{featured.description}</p>
            </div>
          </Link>
        </section>
      )}

      {series.data && (
        <section>
          <div className="section-head">
            <h2>Jelajahi series</h2>
            <Link to="/series" className="more">
              Semua <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="rail">
            {series.data.map((s) => (
              <Link key={s.id} to={`/series/${s.id}`} className="rail-item" style={{ '--accent': s.color }}>
                <strong>{s.year}</strong>
                <span>{s.name.replace(/^Mobile (Suit|Fighter) /, '')}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
