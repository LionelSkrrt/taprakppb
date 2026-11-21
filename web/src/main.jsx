import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Bersihkan cache gambar lama (v1) yang bisa berisi gambar pengganti 404 yang tercemar.
if ('caches' in window) {
  caches.delete('gundam-images').catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
