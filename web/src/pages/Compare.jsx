import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Save, Trash2, X } from 'lucide-react'
import { useSuits } from '../hooks/useCatalog'
import { useCompareHistory } from '../hooks/useCompareHistory'
import SuitArt from '../components/SuitArt'
import { ErrorState, Loading } from '../components/StateView'

const MAX_SLOTS = 3

// "?ids=1,11,60" -> [1, 11, 60] (unik, maksimal 3)
function parseIds(raw) {
  const ids = (raw || '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0)
  return [...new Set(ids)].slice(0, MAX_SLOTS)
}

const norm = (v) => String(v).trim().toLowerCase()
const withUnit = (v, unit) => (v === null || v === undefined ? '—' : `${v} ${unit}`)
const sameSet = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join()

// Indeks kolom dengan nilai terbesar. Hanya disorot bila minimal dua nilai
// terisi dan nilainya tidak semuanya sama.
function bestIndexes(values) {
  const filled = values.map((v, i) => [v, i]).filter(([v]) => typeof v === 'number' && Number.isFinite(v))
  if (filled.length < 2) return []
  const nums = filled.map(([v]) => v)
  const max = Math.max(...nums)
  if (max === Math.min(...nums)) return []
  return filled.filter(([v]) => v === max).map(([, i]) => i)
}

function commonArmaments(suits) {
  if (suits.some((s) => !s.armaments?.length)) return []
  const [first, ...rest] = suits
  return first.armaments.filter((a) => rest.every((s) => s.armaments.some((b) => norm(b) === norm(a))))
}

function similarities(suits) {
  const same = (get) => {
    const values = suits.map(get)
    return values.every((v) => v && norm(v) === norm(values[0])) ? values[0] : null
  }
  return [
    ['Series yang sama', same((s) => s.series?.name)],
    ['Pilot yang sama', same((s) => s.pilot)],
    ['Faksi yang sama', same((s) => s.faction)],
    ['Tipe yang sama', same((s) => s.unit_type)],
  ].filter(([, v]) => v)
}

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function CompareTable({ suits }) {
  const heightBest = bestIndexes(suits.map((s) => s.height_m))
  const weightBest = bestIndexes(suits.map((s) => s.weight_t))
  const armBest = bestIndexes(suits.map((s) => s.armaments?.length ?? 0))
  const common = commonArmaments(suits)
  const commonKeys = new Set(common.map(norm))
  const same = similarities(suits)

  const textRows = [
    ['Series', (s) => (s.series ? `${s.series.name} (${s.series.year})` : '—')],
    ['Pilot', (s) => s.pilot || '—'],
    ['Faksi', (s) => s.faction || '—'],
    ['Tipe', (s) => s.unit_type || '—'],
  ]

  return (
    <section aria-label="Hasil perbandingan">
      <div className="compare-scroll">
        <table className="compare-table" style={{ '--cols': suits.length }}>
          <thead>
            <tr>
              <th scope="col" className="label-col">
                <span className="sr-only">Atribut</span>
              </th>
              {suits.map((s) => (
                <th key={s.id} scope="col">
                  <Link to={`/suits/${s.id}`} className="compare-head">
                    <SuitArt
                      image={s.image_url}
                      accent={s.series?.color}
                      label={s.model_number}
                      alt={`${s.name} (${s.model_number})`}
                    />
                    <span className="model">{s.model_number}</span>
                    <strong>{s.name}</strong>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {textRows.map(([label, get]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {suits.map((s) => (
                  <td key={s.id}>{get(s)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row">Tinggi</th>
              {suits.map((s, i) => (
                <td key={s.id} className={heightBest.includes(i) ? 'best' : ''}>
                  {withUnit(s.height_m, 'm')}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Berat</th>
              {suits.map((s, i) => (
                <td key={s.id} className={weightBest.includes(i) ? 'best' : ''}>
                  {withUnit(s.weight_t, 'ton')}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Jumlah senjata</th>
              {suits.map((s, i) => (
                <td key={s.id} className={armBest.includes(i) ? 'best' : ''}>
                  {s.armaments?.length ?? 0}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Persenjataan</th>
              {suits.map((s) => (
                <td key={s.id}>
                  {s.armaments?.length ? (
                    <ul className="arm-list">
                      {s.armaments.map((a) => (
                        <li key={a} className={commonKeys.has(norm(a)) ? 'shared' : ''}>
                          {a}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    '—'
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="legend">
        <span className="legend-best">Hijau = nilai tertinggi</span>
        <span className="legend-shared">Emas = senjata yang sama</span>
      </p>

      <div className="panel similarities">
        <h2>Persamaan</h2>
        {same.length === 0 && common.length === 0 ? (
          <p className="muted">Tidak ada kesamaan series, pilot, faksi, tipe, atau senjata.</p>
        ) : (
          <ul>
            {same.map(([label, value]) => (
              <li key={label}>
                {label}: <b>{value}</b>
              </li>
            ))}
            {common.length > 0 && (
              <li>
                Senjata yang sama: <b>{common.join(', ')}</b>
              </li>
            )}
          </ul>
        )}
      </div>
    </section>
  )
}

export default function Compare() {
  const [params, setParams] = useSearchParams()
  const ids = parseIds(params.get('ids'))
  const { data: suits, loading, error, retry } = useSuits()
  const { entries, save, remove, clear } = useCompareHistory()
  const [justSaved, setJustSaved] = useState(false)

  // Gabungan data live + salinan di riwayat: riwayat tetap bisa dibuka
  // walau daftar unit dari API belum tersedia (mis. offline).
  const byId = useMemo(() => {
    const map = new Map()
    entries.forEach((e) => e.suits.forEach((s) => map.has(s.id) || map.set(s.id, s)))
    suits?.forEach((s) => map.set(s.id, s))
    return map
  }, [suits, entries])

  const validIds = ids.filter((id) => byId.has(id))
  const selected = validIds.map((id) => byId.get(id))

  // Pilihan unit dikelompokkan per series, urut tahun.
  const groups = useMemo(() => {
    const map = new Map()
    for (const s of suits ?? byId.values()) {
      const key = s.series ? `${s.series.year} · ${s.series.name}` : 'Lainnya'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(s)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [suits, byId])

  const setIds = (next) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (next.length) p.set('ids', next.join(','))
        else p.delete('ids')
        return p
      },
      { replace: true },
    )

  const setSlot = (index, value) => {
    const next = [...validIds]
    if (value) next[index] = Number(value)
    else next.splice(index, 1)
    setIds([...new Set(next.filter(Boolean))])
    setJustSaved(false)
  }

  const onSave = () => {
    save(selected)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }

  const openEntry = (entry) => {
    setIds(entry.suits.map((s) => s.id))
    setJustSaved(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearAll = () => {
    if (window.confirm('Hapus semua riwayat perbandingan? Tindakan ini tidak bisa dibatalkan.')) clear()
  }

  const hasData = Boolean(suits) || byId.size > 0
  const slotCount = Math.min(validIds.length + 1, MAX_SLOTS)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Bandingkan</h1>
        <p className="muted">
          Pilih 2 sampai 3 mobile suit untuk dibandingkan berdampingan. Perbandingan yang disimpan masuk ke riwayat
          dan tetap bisa dibuka saat offline.
        </p>
      </header>

      {!hasData && loading && <Loading rows={2} />}
      {!hasData && error && <ErrorState message={error} onRetry={retry} />}

      {hasData && (
        <section className="panel compare-picker" aria-label="Pilih unit">
          {Array.from({ length: slotCount }, (_, i) => (
            <div className="slot" key={i}>
              <label htmlFor={`slot-${i}`}>Unit {i + 1}</label>
              <div className="slot-row">
                <select id={`slot-${i}`} value={validIds[i] ?? ''} onChange={(e) => setSlot(i, e.target.value)}>
                  <option value="">Pilih mobile suit...</option>
                  {groups.map(([label, list]) => (
                    <optgroup key={label} label={label}>
                      {list.map((s) => (
                        <option
                          key={s.id}
                          value={s.id}
                          disabled={validIds.includes(s.id) && validIds[i] !== s.id}
                        >
                          {s.name} ({s.model_number})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {validIds[i] && (
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setSlot(i, '')}
                    aria-label={`Hapus unit ${i + 1} dari perbandingan`}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={onSave} disabled={selected.length < 2}>
              {justSaved ? <Check size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
              {justSaved ? 'Tersimpan di riwayat' : 'Simpan perbandingan'}
            </button>
            {validIds.length > 0 && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setIds([])
                  setJustSaved(false)
                }}
              >
                Kosongkan
              </button>
            )}
          </div>
        </section>
      )}

      {selected.length === 1 && <p className="muted">Pilih satu unit lagi untuk mulai membandingkan.</p>}
      {selected.length >= 2 && <CompareTable suits={selected} />}

      <section aria-labelledby="history-title">
        <div className="section-head">
          <h2 id="history-title">Riwayat perbandingan</h2>
          {entries.length > 0 && (
            <button type="button" className="link-btn" onClick={clearAll}>
              Hapus semua
            </button>
          )}
        </div>
        {entries.length === 0 ? (
          <p className="muted">
            Belum ada riwayat. Tekan <b>Simpan perbandingan</b> agar bisa dibuka lagi nanti, termasuk saat offline.
          </p>
        ) : (
          <ul className="history">
            {entries.map((entry) => {
              const names = entry.suits.map((s) => s.name).join(' vs ')
              const isCurrent = sameSet(entry.suits.map((s) => s.id), validIds)
              return (
                <li key={entry.id} className={isCurrent ? 'current' : ''}>
                  <button type="button" className="history-open" onClick={() => openEntry(entry)}>
                    <span className="history-thumbs" aria-hidden="true">
                      {entry.suits.map((s) => (
                        <SuitArt
                          key={s.id}
                          image={s.image_url}
                          accent={s.series?.color}
                          label={s.model_number}
                          className="thumb"
                        />
                      ))}
                    </span>
                    <span className="history-text">
                      <strong>{names}</strong>
                      <span className="muted small">{formatDate(entry.createdAt)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => remove(entry.id)}
                    aria-label={`Hapus riwayat ${names}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
