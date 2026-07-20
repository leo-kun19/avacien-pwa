import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { STATUS_LABEL, STATUS_EMOJI, fmtTime, fmtDate } from '../lib/labels'
import { IconFace, IconArrow, IconPin } from '../components/Icons'

const STATUSES = ['active', 'on_break', 'inactive']

export default function Home() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())
  const [attendance, setAttendance] = useState(null)
  const [status, setStatus] = useState(user?.activity_status || 'offline')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    api.todayAttendance()
      .then((r) => setAttendance(r.attendance))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function changeStatus(s) {
    setStatus(s)
    try {
      await api.setStatus(s)
      setUser((u) => ({ ...u, activity_status: s }))
      toast.success(`Status: ${STATUS_LABEL[s]}`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const checkedIn = attendance?.check_in_at
  const checkedOut = attendance?.check_out_at
  const nextAction = !checkedIn ? 'in' : !checkedOut ? 'out' : 'done'

  return (
    <div className="page-top">
      <header className="row between reveal d1">
        <div>
          <span className="eyebrow">{fmtDate(now)}</span>
          <p className="haze mt-sm" style={{ fontSize: '1.05rem' }}>
            Halo, <strong style={{ color: 'var(--paper)' }}>{user?.name?.split(' ')[0]}</strong>
          </p>
        </div>
        <div className={`pill status-${status}`}>
          <span className="dot" /> {STATUS_LABEL[status]}
        </div>
      </header>

      <div className="mt-md reveal d2">
        <div className="hero-time">
          {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="hero-date row gap-sm">
          <IconPin style={{ width: 15, height: 15 }} />
          {user?.division || 'Tanpa divisi'} · {user?.position || 'Staf'}
        </div>
      </div>

      {/* Kartu absensi utama */}
      <section className="card mt-lg reveal d3" style={{ padding: 22 }}>
        <div className="row between">
          <span className="eyebrow">Absensi Hari Ini</span>
          {attendance?.status && (
            <span className={`pill ${attendance.status === 'late' ? 'status-inactive' : 'status-active'}`}>
              {attendance.status === 'late' ? `Telat ${attendance.late_minutes}m` : 'Tepat Waktu'}
            </span>
          )}
        </div>

        <div className="row between mt-md">
          <div>
            <div className="muted" style={{ fontSize: '0.74rem' }}>Masuk</div>
            <div className="display" style={{ fontSize: '1.7rem', marginTop: 2 }}>{fmtTime(checkedIn)}</div>
          </div>
          <div style={{ width: 1, height: 38, background: 'var(--line-strong)' }} />
          <div style={{ textAlign: 'right' }}>
            <div className="muted" style={{ fontSize: '0.74rem' }}>Pulang</div>
            <div className="display" style={{ fontSize: '1.7rem', marginTop: 2 }}>{fmtTime(checkedOut)}</div>
          </div>
        </div>

        {nextAction !== 'done' ? (
          <button
            className="btn btn-primary mt-md"
            disabled={loading}
            onClick={() => navigate('/absen', { state: { kind: nextAction } })}
          >
            <IconFace style={{ width: 20, height: 20 }} />
            {nextAction === 'in' ? 'Absen Masuk' : 'Absen Pulang'}
          </button>
        ) : (
          <div className="center muted mt-md" style={{ fontSize: '0.9rem' }}>
            Kehadiran lengkap. Sampai jumpa besok 🌙
          </div>
        )}
      </section>

      {/* Status keaktifan */}
      <section className="mt-lg reveal d4">
        <h2 className="sec-title">Keaktifan</h2>
        <p className="muted mt-sm" style={{ fontSize: '0.86rem' }}>Perbarui status kerjamu agar terlihat manajer.</p>
        <div className="status-grid mt-md">
          {STATUSES.map((s) => (
            <button
              key={s}
              className="status-opt"
              data-on={status === s}
              onClick={() => changeStatus(s)}
            >
              <span className="em">{STATUS_EMOJI[s]}</span>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </section>

      <button className="btn btn-ghost mt-lg reveal d5" onClick={() => navigate('/riwayat')}>
        Lihat timeline aktivitas <IconArrow style={{ width: 18, height: 18 }} />
      </button>
    </div>
  )
}
