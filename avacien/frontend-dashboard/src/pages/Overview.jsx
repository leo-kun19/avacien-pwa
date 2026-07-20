import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { StatusBadge } from '../components/Badge'
import { relTime, initials } from '../lib/labels'
import { IconArrow } from '../components/Icons'

export default function Overview() {
  const navigate = useNavigate()
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    api.overview().then(setStats).catch((e) => toast.error(e.message))
    api.monitoring().then((r) => setEmployees(r.employees)).catch(() => {})
  }, [])

  const cards = [
    { num: stats?.present_today ?? '—', lbl: 'Hadir Hari Ini', sub: `dari ${stats?.total_employees ?? 0} karyawan`, accent: 'var(--forest)' },
    { num: stats?.late_today ?? '—', lbl: 'Terlambat', sub: 'masuk lewat toleransi', accent: 'var(--amber)' },
    { num: stats?.absent_today ?? '—', lbl: 'Belum Hadir', sub: 'belum absen masuk', accent: 'var(--rose)' },
    { num: stats?.active_now ?? '—', lbl: 'Aktif Sekarang', sub: 'sedang bekerja', accent: 'var(--vermillion)' },
  ]

  const attendanceRate = stats?.total_employees
    ? Math.round((stats.present_today / stats.total_employees) * 100)
    : 0

  return (
    <>
      <div className="topbar reveal d1">
        <div>
          <div className="page-kicker">Ringkasan Harian</div>
          <h1 className="page-title">Ikhtisar</h1>
        </div>
        <div className="mute" style={{ fontSize: '0.86rem' }}>
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <section className="stat-grid">
        {cards.map((c, i) => (
          <div key={c.lbl} className="stat reveal" style={{ '--accent': c.accent, animationDelay: `${0.05 * (i + 1)}s` }}>
            <div className="num">{c.num}</div>
            <div className="lbl">{c.lbl}</div>
            <div className="sub">{c.sub}</div>
          </div>
        ))}
      </section>

      <section className="section reveal d3">
        <div className="section-head">
          <h2 className="section-title">Tingkat Kehadiran</h2>
        </div>
        <div className="panel" style={{ padding: 28 }}>
          <div className="row between">
            <div className="num" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2.4rem' }}>{attendanceRate}%</div>
            <span className="mute" style={{ fontSize: '0.86rem' }}>{stats?.present_today ?? 0} dari {stats?.total_employees ?? 0} hadir</span>
          </div>
          <div style={{ height: 12, background: 'var(--paper-2)', borderRadius: 99, marginTop: 16, overflow: 'hidden' }}>
            <div style={{ width: `${attendanceRate}%`, height: '100%', background: 'var(--forest)', transition: 'width 0.6s var(--ease)' }} />
          </div>
        </div>
      </section>

      <section className="section reveal d4">
        <div className="section-head">
          <h2 className="section-title">Sekilas Tim</h2>
          <div className="rule" />
          <button className="btn btn-sm" onClick={() => navigate('/monitoring')}>
            Papan Monitoring <IconArrow style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Karyawan</th><th>Divisi</th><th>Status</th><th>Terakhir Aktif</th></tr>
            </thead>
            <tbody>
              {employees.slice(0, 6).map((e) => (
                <tr key={e.user_id}>
                  <td>
                    <div className="row gap-sm">
                      <span className="emp-ava" style={{ width: 32, height: 32, fontSize: '0.82rem' }}>{initials(e.name)}</span>
                      <strong>{e.name}</strong>
                    </div>
                  </td>
                  <td className="mute">{e.division || '—'}</td>
                  <td><StatusBadge status={e.activity_status} /></td>
                  <td className="mute t-num">{relTime(e.last_seen_at)}</td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan="4" className="empty">Belum ada data karyawan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
