import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

// Bagikan tautan halaman ini: pakai Web Share API jika ada (HP),
// kalau tidak salin ke clipboard.
export default function ShareButton({ title, text }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* pengguna membatalkan dialog share, abaikan */
    }
  }

  return (
    <button type="button" className="btn" onClick={share}>
      {copied ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
      {copied ? 'Tautan disalin' : 'Bagikan'}
    </button>
  )
}
