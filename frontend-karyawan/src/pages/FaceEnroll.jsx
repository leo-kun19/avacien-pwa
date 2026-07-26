import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FaceCamera from '../components/FaceCamera'
import { loadModels, getDescriptor } from '../lib/face'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { IconFace } from '../components/Icons'

export default function FaceEnroll() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const toast = useToast()
  const camRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    loadModels().then(() => setReady(true)).catch(() => toast.error('Gagal memuat model wajah.'))
  }, [])

  async function enroll() {
    if (busy) return
    setBusy(true)
    try {
      const video = camRef.current?.video()
      // Ambil beberapa sampel, pakai yang terakhir valid (lebih stabil)
      const samples = []
      for (let i = 0; i < 5; i++) {
        const d = await getDescriptor(video)
        if (d) samples.push(d)
        setProgress(Math.round(((i + 1) / 5) * 100))
        await new Promise((r) => setTimeout(r, 400))
      }
      if (samples.length === 0) {
        toast.error('Wajah tidak terdeteksi. Coba lagi dengan pencahayaan lebih baik.')
        setProgress(0)
        return
      }
      // Rata-ratakan descriptor agar representatif
      const avg = samples[0].map((_, idx) =>
        samples.reduce((sum, s) => sum + s[idx], 0) / samples.length
      )
      await api.enrollFace(avg)
      await refresh()
      toast.success('Wajah berhasil didaftarkan.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  return (
    <div className="page-top">
      <header className="reveal d1">
        <span className="eyebrow">Pendaftaran</span>
        <h1 className="sec-title mt-sm" style={{ fontSize: '1.8rem' }}>Daftarkan Wajahmu</h1>
        <p className="muted mt-sm" style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
          Sekali saja. Wajahmu jadi kunci untuk absensi harian. Pastikan wajah terlihat jelas dan terang.
        </p>
      </header>

      <div className="card mt-md reveal d2" style={{ padding: 14 }}>
        <FaceCamera ref={camRef} active />
      </div>

      {busy && (
        <div className="mt-md reveal d3">
          <div style={{ height: 6, borderRadius: 99, background: 'var(--ink-600)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--apricot), var(--amber))', transition: 'width 0.3s' }} />
          </div>
          <p className="center muted mt-sm" style={{ fontSize: '0.82rem' }}>Mengambil sampel wajah… {progress}%</p>
        </div>
      )}

      <button className="btn btn-primary mt-md reveal d3" onClick={enroll} disabled={!ready || busy}>
        {busy ? <span className="spinner" /> : <><IconFace style={{ width: 20, height: 20 }} /> Daftarkan Sekarang</>}
      </button>
    </div>
  )
}
