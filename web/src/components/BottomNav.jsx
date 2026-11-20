import { NavLink } from 'react-router-dom'
import { Bot, Heart, House, Layers, User } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

const ITEMS = [
  { to: '/', label: 'Beranda', icon: House, end: true },
  { to: '/suits', label: 'Unit', icon: Bot },
  { to: '/series', label: 'Series', icon: Layers },
  { to: '/favorites', label: 'Favorit', icon: Heart, badge: true },
  { to: '/profile', label: 'Profil', icon: User },
]

export default function BottomNav() {
  const { count } = useFavorites()

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      <ul>
        {ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="nav-icon">
                <Icon size={22} aria-hidden="true" />
                {badge && count > 0 && <b className="badge">{count}</b>}
              </span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
