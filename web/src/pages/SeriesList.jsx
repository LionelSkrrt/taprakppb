import { useState } from 'react'
import { useSeriesList } from '../hooks/useCatalog'
import SearchBox from '../components/SearchBox'
import SeriesCard from '../components/SeriesCard'
import { EmptyState, ErrorState, Loading } from '../components/StateView'

export default function SeriesList() {
  const [q, setQ] = useState('')
  // Cari di sisi klien dari daftar penuh (hanya 11 baris): instan dan tanpa request tambahan.
  const { data, loading, error, retry } = useSeriesList()

  const needle = q.trim().toLowerCase()
  const shown = data?.filter(
    (s) =>
      !needle ||
      [s.name, s.timeline, s.format, String(s.year)].some((v) => v.toLowerCase().includes(needle)),
  )

  return (
    <div className="page">
      <header className="page-head">
        <h1>Series</h1>
        <p className="muted">Serial, film, dan OVA Gundam, diurutkan berdasarkan tahun rilis.</p>
      </header>

      <SearchBox value={q} onChange={setQ} placeholder="Cari series, tahun, atau timeline..." label="Cari series" />

      {loading && <Loading rows={4} />}
      {error && <ErrorState message={error} onRetry={retry} />}
      {shown?.length === 0 && <EmptyState title="Series tidak ditemukan">Coba kata kunci lain.</EmptyState>}
      {shown?.length > 0 && (
        <div className="stack">
          {shown.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      )}
    </div>
  )
}
