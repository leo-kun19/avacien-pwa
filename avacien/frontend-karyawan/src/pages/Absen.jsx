import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import FaceCamera from '../components/FaceCamera'
import { loadModels, getDescriptor } from '../lib/face'
import { getPosition } from '../lib/geo'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { IconFace, IconCheck } from '../components/Icons'

const STEPS = {
  loading: 'Menyiapkan kamera & model wajah…',
  ready: 'Posisikan wajah di dalam bingkai',
  locating: 'Memeriksa lokasi kamu…',
  scanning: 'Memindai wajah…',
  sending: 'Memverifikasi…',
}

export default function Absen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const toast = useToast()
  const camRef = useRef(null)
  const kind = location.state?.kind || 'in'
  const [step, setStep] = useState('loading')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user?.face_enrolled) {
      navigate('/daftar-wajah', { replace: true })
      return
    }
    loadModels()
      .then(() => setStep('ready'))
      .catch(() => toast.error('Gagal memuat model wajah.'))
  }, [])

  async function capture() {
    if (busy) return
    setBusy(true)
    try {
      // 1. Lokasi GPS dulu
      setStep('locating')
      const pos = await getPosition()

      // 2. Pindai wajah
      setStep('scanning')
      const video = camRef.current?.video()
      let descriptor = null
      for (let i = 0; i < 6 && !descriptor; i++) {
        descriptor = await getDescriptor(video)
        if (!descriptor) await new Promise((r) => setTimeout(r, 350))
      }
      if (!descriptor) {
        toast.error('Wajah tidak terdeteksi. Pastikan pencahayaan cukup.')
        setStep('ready')
        return
      }

      const photo = camRef.current?.snapshot()

      // 3. Kirim ke backend
      setStep('sending')
      const payload = {
        descriptor,
        latitude: pos.latitude,
        longitude: pos.longitude,
        photo,
      }
      const fn = kind === 'in' ? api.checkIn : api.checkOut
      const res = await fn(payload)
      toast.success(res.message || 'Absensi berhasil.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message)
      setStep('ready')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-top">
      <header className="reveal d1">
        <span className="eyebrow">{kind === 'in' ? 'Absen Masuk' : 'Absen Pulang'}</span>
        <h1 className="sec-title mt-sm" style={{ fontSize: '1.8rem' }}>Verifikasi Wajah</h1>
      </header>

      <div className="card mt-md reveal d2" style={{ padding: 14 }}>
        <FaceCamera ref={camRef} active />
      </div>

      <p className="center haze mt-md reveal d3" style={{ minHeight: 24 }}>
        {STEPS[step]}
      </p>

      <button
        className="btn btn-primary mt-md reveal d3"
        onClick={capture}
        disabled={step === 'loading' || busy}
      >
        {busy ? <span className="spinner" /> : <><IconFace style={{ width: 20, height: 20 }} /> Verifikasi &amp; Absen</>}
      </button>

      <button className="btn btn-ghost mt-sm reveal d4" onClick={() => navigate('/')} disabled={busy}>
        Batal
      </button>

      <div className="card mt-lg reveal d5" style={{ padding: 16 }}>
        <div className="row gap-md">
          <div className="pill status-active"><IconCheck style={{ width: 14, height: 14 }} /></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Privasi terjaga</div>
            <div className="muted" style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
              Pengenalan wajah diproses langsung di perangkatmu. Hanya hasil verifikasi yang dikirim.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
