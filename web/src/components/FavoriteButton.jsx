import { Heart } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

export default function FavoriteButton({ id, name, compact = false }) {
  const { isFavorite, toggle } = useFavorites()
  const active = isFavorite(id)
  const label = active ? `Hapus ${name} dari favorit` : `Tambahkan ${name} ke favorit`

  return (
    <button
      type="button"
      className={`fav ${compact ? 'fav-compact' : 'btn'} ${active ? 'is-active' : ''}`}
      onClick={() => toggle(id)}
      aria-pressed={active}
      aria-label={label}
      title={label}
    >
      <Heart size={compact ? 18 : 16} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
      {!compact && (active ? 'Favorit' : 'Tambah favorit')}
    </button>
  )
}
