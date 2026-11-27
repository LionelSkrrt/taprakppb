import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Suits from './pages/Suits'
import SuitDetail from './pages/SuitDetail'
import SeriesList from './pages/SeriesList'
import SeriesDetail from './pages/SeriesDetail'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import Compare from './pages/Compare'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="suits" element={<Suits />} />
        <Route path="suits/:id" element={<SuitDetail />} />
        <Route path="series" element={<SeriesList />} />
        <Route path="series/:id" element={<SeriesDetail />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="profile" element={<Profile />} />
        <Route path="compare" element={<Compare />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
