import { useEffect, useState } from 'react'

/**
 * Tombol Install PWA — muncul saat browser mendukung & app belum di-install.
 * Menangkap event beforeinstallprompt dan memicunya saat user klik.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Cek apakah sudah di-install (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    function handler(e) {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  if (!deferredPrompt || dismissed) return null

  return (
    <div className="install-banner reveal d1">
      <div className="install-content">
        <div className="install-icon">📲</div>
        <div>
          <div className="install-title">Pasang Avacien</div>
          <div className="install-desc">Akses cepat dari layar utama HP-mu</div>
        </div>
      </div>
      <div className="install-actions">
        <button className="btn btn-primary btn-install" onClick={install}>
          Install
        </button>
        <button className="btn-dismiss" onClick={() => setDismissed(true)} aria-label="Tutup">
          ✕
        </button>
      </div>
    </div>
  )
}
