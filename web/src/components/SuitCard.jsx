import { Link } from 'react-router-dom'
import SuitArt from './SuitArt'
import FavoriteButton from './FavoriteButton'

export default function SuitCard({ suit }) {
  return (
    <article className="card suit-card">
      <Link to={`/suits/${suit.id}`} className="card-link" aria-label={`${suit.name}, ${suit.model_number}`}>
        <SuitArt
          image={suit.image_url}
          accent={suit.series?.color}
          label={suit.model_number}
          alt={`${suit.name} (${suit.model_number})`}
        />
        <div className="card-body">
          <span className="model">{suit.model_number}</span>
          <h3>{suit.name}</h3>
          <p className="muted">{suit.series?.name}</p>
        </div>
      </Link>
      <FavoriteButton id={suit.id} name={suit.name} compact />
    </article>
  )
}
