import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { STATUS_LABEL, fmtTime, fmtDuration } from '../lib/labels'

const STATUS_COLOR = {
  active: 'var(--jade)',
  on_break: 'var(--amber)',
  inactive: 'var(--rose)',
  offline: 'var(--mist)',
}

export default function History() {
  const toast = useToast()
  const [timeline, setTimeline] = useState([])
  const [summary, setSummary] = useState({})
  const [history, setHistory] = useState([])

  useEffect(() => {
    api.timeline()
      .then((r) => { setTimeline(r.logs); setSummary(r.summary_seconds || {}) })
      .catch((e) => toast.error(e.message))
    api.attendanceHistory()
      .then((r) => setHistory(r.attendances))
      .catch(() => {})
  }, [])

  return (
    <div className="page-top">
      <header className="reveal d1">
        <span className="eyebrow">Hari Ini</span>
        <h1 className="sec-title mt-sm" style={{ fontSize: '1.9rem' }}>Timeline Aktivitas</h1>
      </header>

      {/* Ringkasan durasi */}
      <div className="tiles mt-md reveal d2">
        <div className="tile">
          <div className="k" style={{ color: 'var(--jade)' }}>{fmtDuration(summary.active)}</div>
          <div className="l">Aktif</div>
        </div>
        <div className="tile">
          <div className="k" style={{ color: 'var(--amber)' }}>{fmtDuration(summary.on_break)}</div>
          <div className="l">Istirahat</div>
        </div>
      </div>

      {/* Timeline */}
      <section className="card mt-lg reveal d3" style={{ padding: 22 }}>
        {timeline.length === 0 ? (
          <p className="muted center">Belum ada aktivitas tercatat hari ini.</p>
        ) : (
          timeline.map((log) => (
            <div key={log.id} className="tl-item">
              <span className="tl-dot" style={{ background: STATUS_COLOR[log.status] }} />
              <div className="full">
                <div className="row between">
                  <strong style={{ fontSize: '0.92rem' }}>{STATUS_LABEL[log.status]}</strong>
                  <span className="muted" style={{ fontSize: '0.8rem' }}>{fmtTime(log.started_at)}</span>
                </div>
                {log.duration_seconds != null && (
                  <span className="muted" style={{ fontSize: '0.78rem' }}>
                    Durasi {fmtDuration(log.duration_seconds)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Riwayat absensi */}
      <h2 className="sec-title mt-lg reveal d4" style={{ fontSize: '1.4rem' }}>Riwayat Absensi</h2>
      <section className="card mt-md reveal d4" style={{ padding: '6px 22px' }}>
        {history.length === 0 ? (
          <p className="muted center" style={{ padding: '18px 0' }}>Belum ada riwayat.</p>
        ) : (
          history.map((a) => (
            <div key={a.id} className="list-row">
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {new Date(a.work_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <span className={`pill ${a.status === 'late' ? 'status-inactive' : 'status-active'}`} style={{ marginTop: 4 }}>
                  {a.status === 'late' ? `Telat ${a.late_minutes}m` : 'Tepat Waktu'}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.84rem' }} className="haze">
                {fmtTime(a.check_in_at)} – {fmtTime(a.check_out_at)}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
