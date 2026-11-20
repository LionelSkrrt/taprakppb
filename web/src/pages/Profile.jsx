import axios from 'axios'
import { CircleAlert, CircleCheck, Download } from 'lucide-react'
import { API_BASE_URL, API_ROOT_URL } from '../config/api'
import { PROFILE } from '../config/profile'
import { useAsync } from '../hooks/useAsync'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

const ENDPOINTS = [
  ['GET', '/series', 'Daftar series (?q=)'],
  ['GET', '/series/:id', 'Detail series + unitnya'],
  ['GET', '/mobile-suits', 'Daftar unit (?q=, ?series_id=)'],
  ['GET', '/mobile-suits/:id', 'Detail unit + series'],
]

export default function Profile() {
  const { canInstall, install, standalone } = useInstallPrompt()
  const status = useAsync(
    () => axios.get(`${API_ROOT_URL}/`, { timeout: 8000 }).then((r) => r.data),
    'api-status',
  )

  return (
    <div className="page">
      <header className="page-head">
        <h1>Profil &amp; Tentang</h1>
      </header>

      <section className="panel about-card">
        <img src="/icon-192.png" alt="" width="72" height="72" />
        <div>
          <h2>{PROFILE.appName}</h2>
          <p className="muted">
            Versi {PROFILE.version} · {PROFILE.tagline}
          </p>
        </div>
      </section>

      {!standalone && canInstall && (
        <button type="button" className="btn btn-primary btn-block" onClick={install}>
          <Download size={16} aria-hidden="true" /> Pasang aplikasi di perangkat
        </button>
      )}

      <section>
        <h2>Tentang aplikasi</h2>
        <p>
          Gundam Nexus adalah wiki ringkas untuk penggemar Gundam: jelajahi mobile suit berikut pilot, faksi, dan
          persenjataannya, lalu telusuri serial tempat mereka muncul. Data diambil dari web service buatan sendiri
          (Express + Supabase), dan aplikasi ini berupa Progressive Web App yang bisa dipasang dan dibuka offline.
        </p>
      </section>

      <section className="panel">
        <h2>Pembuat</h2>
        <dl className="specs">
          <div>
            <dt>Nama</dt>
            <dd>{PROFILE.developer.name}</dd>
          </div>
          <div>
            <dt>NIM</dt>
            <dd>{PROFILE.developer.nim}</dd>
          </div>
          <div>
            <dt>Mata kuliah</dt>
            <dd>{PROFILE.developer.course}</dd>
          </div>
          <div>
            <dt>Source code</dt>
            <dd>
              <a href={PROFILE.githubUrl} target="_blank" rel="noreferrer">
                {PROFILE.githubUrl.replace('https://', '')}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2>Teknologi</h2>
        <ul className="rows plain">
          {PROFILE.stack.map((t) => (
            <li key={t.name}>
              <div>
                <strong>{t.name}</strong>
                <span className="muted">{t.note}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Status API</h2>
        {status.loading && <p className="muted">Memeriksa koneksi...</p>}
        {status.data && (
          <p className="ok">
            <CircleCheck size={18} aria-hidden="true" /> Terhubung · sumber data: <b>{status.data.dataSource}</b>
          </p>
        )}
        {status.error && (
          <p className="bad">
            <CircleAlert size={18} aria-hidden="true" /> Tidak terhubung. {status.error}
          </p>
        )}
        <p className="muted small">
          Base URL: <code>{API_BASE_URL}</code>
        </p>
        <ul className="endpoints">
          {ENDPOINTS.map(([method, path, note]) => (
            <li key={path}>
              <b>{method}</b>
              <code>{path}</code>
              <span className="muted">{note}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
