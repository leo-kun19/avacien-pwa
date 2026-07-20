import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'

/** Ubah URL di dalam teks jadi elemen <a> yang bisa diklik. */
function linkifyText(text) {
  if (!text) return null
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #2563eb)', wordBreak: 'break-all' }}>
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

const CLAIM_LABEL = {
  claimed: 'Diambil',
  submitted: 'Menunggu Review',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

export default function Tasks() {
  const toast = useToast()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    api.tasks()
      .then((r) => setTasks(r.tasks))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function claimTask(id) {
    try {
      await api.claimTask(id)
      toast.success('Tugas diambil.')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  async function submitTask(id) {
    const note = prompt('Catatan penyelesaian (opsional):')
    if (note === null) return // user klik Cancel
    try {
      await api.submitTask(id, note)
      toast.success('Hasil dikirim untuk direview.')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="page-top">
      <header className="reveal d1">
        <span className="eyebrow">Penghasilan Tambahan</span>
        <h1 className="sec-title mt-sm" style={{ fontSize: '1.9rem' }}>Tugas &amp; Bonus</h1>
        <p className="muted mt-sm" style={{ fontSize: '0.88rem' }}>
          Ambil tugas tambahan dengan insentif transparan.
        </p>
      </header>

      <div className="mt-lg">
        {loading && <p className="muted center">Memuat…</p>}

        {!loading && tasks.length === 0 && (
          <div className="card center" style={{ padding: 36 }}>
            <div style={{ fontSize: '2rem' }}>📭</div>
            <p className="muted mt-sm">Belum ada tugas tambahan untuk divisimu.</p>
          </div>
        )}

        {tasks.map((t, i) => {
          const claim = t.claims?.[0]
          return (
            <article key={t.id} className="task reveal" style={{ animationDelay: `${0.06 * i}s` }}>
              <div className="row between">
                <span className="bonus">+{Number(t.bonus_percent)}%</span>
                {claim && (
                  <span
                    className={`pill ${
                      claim.status === 'approved'
                        ? 'status-active'
                        : claim.status === 'rejected'
                          ? 'status-inactive'
                          : 'status-on_break'
                    }`}
                  >
                    {CLAIM_LABEL[claim.status]}
                  </span>
                )}
              </div>

              <h3 className="display mt-sm" style={{ fontSize: '1.25rem' }}>{t.title}</h3>
              {t.description && (
                <p className="muted mt-sm" style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>{linkifyText(t.description)}</p>
              )}

              <div className="row between mt-md">
                <span className="muted" style={{ fontSize: '0.76rem' }}>
                  {t.division || 'Semua divisi'}
                  {t.deadline &&
                    ` · s/d ${new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                </span>
              </div>

              {!claim && (
                <button className="btn btn-primary mt-md" onClick={() => claimTask(t.id)}>
                  Ambil Tugas
                </button>
              )}
              {claim?.status === 'claimed' && (
                <button className="btn btn-ghost mt-md" onClick={() => submitTask(t.id)}>
                  Kirim Hasil
                </button>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
