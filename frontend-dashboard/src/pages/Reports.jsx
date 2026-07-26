import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { AttendanceBadge } from '../components/Badge'
import { fmtTime, fmtDate, initials } from '../lib/labels'

function toInputDate(d) { return d.toISOString().slice(0, 10) }

export default function Reports() {
  const toast = useToast()
  const now = new Date()
  const [from, setFrom] = useState(toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)))
  const [to, setTo] = useState(toInputDate(now))
  const [division, setDivision] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  function load() {
    setLoading(true)
    api.attendanceReport({ from, to, division })
      .then((r) => setRows(r.rows))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, []) // eslint-disable-line

  const totals = rows.reduce(
    (a, r) => {
      if (r.status === 'late') a.late++
      else if (r.status === 'absent') a.absent++
      else a.on_time++
      return a
    },
    { on_time: 0, late: 0, absent: 0 },
  )
  const max = Math.max(1, totals.on_time, totals.late, totals.absent)
  const bars = [
    { k: 'Tepat', v: totals.on_time, c: 'var(--forest)' },
    { k: 'Telat', v: totals.late, c: 'var(--amber)' },
    { k: 'Absen', v: totals.absent, c: 'var(--rose)' },
  ]

  const divisions = ['', 'Engineering', 'Marketing', 'Finance', 'Management']

  function exportCsv() {
    const header = ['Tanggal', 'Karyawan', 'Divisi', 'Masuk', 'Pulang', 'Status', 'Telat (mnt)']
    const lines = rows.map((r) => [
      r.work_date, r.user?.name, r.user?.division || '',
      fmtTime(r.check_in_at), fmtTime(r.check_out_at), r.status, r.late_minutes,
    ].join(','))
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rekap-absensi-${from}_sd_${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="topbar reveal d1">
        <div>
          <div className="page-kicker">Rekapitulasi</div>
          <h1 className="page-title">Laporan Absensi</h1>
        </div>
        <button className="btn" onClick={exportCsv} disabled={rows.length === 0}>Ekspor CSV</button>
      </div>

      <section className="section reveal d2">
        <div className="panel" style={{ padding: 22 }}>
          <div className="row gap-md" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 150px' }}>
              <label className="lbl">Dari</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label className="lbl">Sampai</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label className="lbl">Divisi</label>
              <select value={division} onChange={(e) => setDivision(e.target.value)}>
                {divisions.map((d) => <option key={d} value={d}>{d || 'Semua divisi'}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={load}>Terapkan</button>
          </div>
        </div>
      </section>

      <section className="section reveal d3">
        <div className="row gap-lg" style={{ alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div className="panel" style={{ padding: 28, flex: '1 1 280px' }}>
            <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: 28 }}>Komposisi</h3>
            <div className="bars">
              {bars.map((b) => (
                <div key={b.k} className="bar" style={{ height: `${(b.v / max) * 100}%`, background: b.c }}>
                  <span className="cap">{b.v}</span>
                  <span className="base">{b.k}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel" style={{ padding: 28, flex: '1 1 280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="row between"><span className="mute">Total catatan</span><strong className="t-num" style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>{rows.length}</strong></div>
            <div className="row between mt-md"><span className="mute">Tepat waktu</span><strong style={{ color: 'var(--forest)' }}>{totals.on_time}</strong></div>
            <div className="row between mt-sm"><span className="mute">Terlambat</span><strong style={{ color: 'var(--amber)' }}>{totals.late}</strong></div>
          </div>
        </div>
      </section>

      <section className="section reveal d4">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Tanggal</th><th>Karyawan</th><th>Divisi</th><th>Masuk</th><th>Pulang</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="6" className="empty"><span className="spinner" style={{ margin: '0 auto' }} /></td></tr>}
              {!loading && rows.map((r) => (
                <tr key={r.id}>
                  <td className="t-num">{fmtDate(r.work_date)}</td>
                  <td>
                    <div className="row gap-sm">
                      <span className="emp-ava" style={{ width: 30, height: 30, fontSize: '0.78rem' }}>{initials(r.user?.name)}</span>
                      <strong>{r.user?.name}</strong>
                    </div>
                  </td>
                  <td className="mute">{r.user?.division || '—'}</td>
                  <td className="t-num">{fmtTime(r.check_in_at)}</td>
                  <td className="t-num">{fmtTime(r.check_out_at)}</td>
                  <td><AttendanceBadge status={r.status} lateMinutes={r.late_minutes} /></td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan="6" className="empty"><div className="big">📋</div><p className="mt-sm">Tidak ada data pada rentang ini.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
