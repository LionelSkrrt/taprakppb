import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function SeriesCard({ series }) {
  return (
    <Link
      to={`/series/${series.id}`}
      className="card series-card"
      style={{ '--accent': series.color }}
    >
      <div className="series-year">
        <strong>{series.year}</strong>
        <span>{series.format}</span>
      </div>
      <div className="series-info">
        <h3>{series.name}</h3>
        <p className="muted">{series.timeline}</p>
        <p className="clamp">{series.synopsis}</p>
        <span className="pill">{series.mobile_suit_count} unit</span>
      </div>
      <ChevronRight className="chevron" aria-hidden="true" />
    </Link>
  )
}
