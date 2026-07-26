import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { connectEcho } from '../lib/echo'
import { useToast } from '../context/ToastContext'
import { StatusBadge } from '../components/Badge'
import { relTime, initials, STATUS_LABEL } from '../lib/labels'
import { IconRefresh } from '../components/Icons'

const FILTERS = ['all', 'active', 'on_break', 'inactive', 'offline']
const FILTER_LABEL = { all: 'Semua', ...STATUS_LABEL }

export default function Monitoring() {
  const toast = useToast()
  const [employees, setEmployees] = useState([])
  const [live, setLive] = useState(false)
  const [filter, setFilter] = useState('all')
  const [flashIds, setFlashIds] = useState({})
  const pollRef = useRef(null)

  function load() {
    return api.monitoring().then((r) => setEmployees(r.employees)).catch((e) => toast.error(e.message))
  }

  function flash(userId) {
    setFlashIds((m) => ({ ...m, [userId]: Date.now() }))
    setTimeout(() => setFlashIds((m) => { const n = { ...m }; delete n[userId]; return n }), 1200)
  }

  useEffect(() => {
    load()
    const echo = connectEcho()
    let usedEcho = false

    if (echo) {
      try {
        const channel = echo.channel('monitoring')
        channel.listen('.employee.status', (e) => {
          usedEcho = true
          setLive(true)
          flash(e.user_id)
          setEmployees((list) =>
            list.map((emp) =>
              emp.user_id === e.user_id
                ? { ...emp, activity_status: e.activity_status, last_seen_at: e.last_seen_at }
                : emp,
            ),
          )
        })
        channel.listen('.attendance.recorded', () => { setLive(true); load() })

        // Tandai live jika koneksi pusher terbuka
        const pusher = echo.connector?.pusher
        if (pusher) {
          pusher.connection.bind('connected', () => setLive(true))
          pusher.connection.bind('unavailable', () => setLive(false))
          pusher.connection.bind('failed', () => setLive(false))
        }
      } catch {
        setLive(false)
      }
    }

    // Polling fallback (juga sebagai jaring pengaman bila WS belum konek)
    pollRef.current = setInterval(() => { if (!usedEcho || !live) load() }, 8000)

    return () => {
      clearInterval(pollRef.current)
      if (echo) { try { echo.leave('monitoring') } catch { /* noop */ } }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const shown = employees.filter((e) => filter === 'all' || e.activity_status === filter)
  const counts = employees.reduce((acc, e) => { acc[e.activity_status] = (acc[e.activity_status] || 0) + 1; return acc }, {})

  return (
    <>
      <div className="topbar reveal d1">
        <div>
          <div className="page-kicker">Real-time</div>
          <h1 className="page-title">Monitoring</h1>
        </div>
        <div className="row gap-md">
          <span className={`live ${live ? 'on' : 'off'}`}>
            <span className="beacon" /> {live ? 'Langsung' : 'Polling'}
          </span>
          <button className="btn btn-sm" onClick={load}><IconRefresh style={{ width: 16, height: 16 }} /> Segarkan</button>
        </div>
      </div>

      <div className="row gap-sm mt-md reveal d2" style={{ flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABEL[f]}
            {f !== 'all' && counts[f] ? ` · ${counts[f]}` : ''}
          </button>
        ))}
      </div>

      <section className="section reveal d3">
        <div className="board">
          {shown.map((e) => (
            <article key={e.user_id} className={`emp-card ${flashIds[e.user_id] ? 'flash' : ''}`}>
              <div className="emp-top">
                <span className="emp-ava">{initials(e.name)}</span>
                <div>
                  <div className="emp-name">{e.name}</div>
                  <div className="emp-div">{e.division || 'Tanpa divisi'}</div>
                </div>
              </div>
              <div className="row between mt-md">
                <StatusBadge status={e.activity_status} />
                <span className="mute" style={{ fontSize: '0.76rem' }}>{relTime(e.last_seen_at)}</span>
              </div>
            </article>
          ))}
          {shown.length === 0 && (
            <div className="empty" style={{ gridColumn: '1 / -1' }}>
              <div className="big">🗂️</div>
              <p className="mt-sm">Tidak ada karyawan pada filter ini.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
