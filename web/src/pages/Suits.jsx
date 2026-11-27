import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GitCompareArrows } from 'lucide-react'
import { useSeriesList, useSuits } from '../hooks/useCatalog'
import SearchBox from '../components/SearchBox'
import SuitCard from '../components/SuitCard'
import { EmptyState, ErrorState, Loading } from '../components/StateView'

export default function Suits() {
  const [params, setParams] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const seriesId = params.get('series') ?? ''

  // Teks di kotak cari langsung berubah; URL (dan request ke API) menyusul
  // setelah pengguna berhenti mengetik 300 ms.
  const [text, setText] = useState(urlQuery)
  const pushed = useRef(urlQuery)

  useEffect(() => {
    if (urlQuery !== pushed.current) {
      pushed.current = urlQuery
      setText(urlQuery)
    }
  }, [urlQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim() === urlQuery) return
      pushed.current = text.trim()
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (text.trim()) next.set('q', text.trim())
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    }, 300)
    return () => clearTimeout(timer)
  }, [text, urlQuery, setParams])

  const setSeries = (id) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (id) next.set('series', id)
        else next.delete('series')
        return next
      },
      { replace: true },
    )

  const series = useSeriesList()
  const { data, loading, error, retry } = useSuits({ q: urlQuery, seriesId })

  return (
    <div className="page">
      <header className="page-head page-head-row">
        <div>
          <h1>Mobile Suit</h1>
          <p className="muted">Telusuri seluruh unit dan buka detail spesifikasinya.</p>
        </div>
        <Link to="/compare" className="btn">
          <GitCompareArrows size={16} aria-hidden="true" /> Bandingkan
        </Link>
      </header>

      <SearchBox
        value={text}
        onChange={setText}
        placeholder="Cari nama, nomor model, pilot, faksi..."
        label="Cari mobile suit"
      />

      <div className="chips" role="group" aria-label="Filter series">
        <button type="button" className={`chip ${!seriesId ? 'on' : ''}`} onClick={() => setSeries('')}>
          Semua
        </button>
        {series.data?.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${String(s.id) === seriesId ? 'on' : ''}`}
            style={{ '--accent': s.color }}
            onClick={() => setSeries(String(s.id))}
          >
            {s.year} · {s.name.replace(/^Mobile (Suit|Fighter) (Gundam )?/, '') || s.name}
          </button>
        ))}
      </div>

      {loading && <Loading />}
      {error && <ErrorState message={error} onRetry={retry} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState title="Unit tidak ditemukan">Coba kata kunci lain atau ganti filter series.</EmptyState>
      )}
      {data?.length > 0 && (
        <>
          <p className="count" aria-live="polite">
            {data.length} unit
          </p>
          <div className="grid">
            {data.map((suit) => (
              <SuitCard key={suit.id} suit={suit} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
