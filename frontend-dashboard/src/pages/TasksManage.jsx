import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { IconPlus } from '../components/Icons'

/** Ubah URL di dalam teks jadi elemen <a> yang bisa diklik. */
function linkifyText(text) {
  if (!text) return null
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent, #3b82f6)', wordBreak: 'break-all' }}>
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}


const DIVISIONS = ['', 'Engineering', 'Marketing', 'Finance']

const CLAIM_LABEL = {
  claimed: 'Diambil',
  submitted: 'Menunggu Review',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}
const CLAIM_CLASS = {
  claimed: 'b-on_break',
  submitted: 'b-on_break',
  approved: 'b-active',
  rejected: 'b-inactive',
}

function initials(name) {
  return (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function TasksManage() {
  const toast = useToast()
  const [form, setForm] = useState({ title: '', description: '', division: '', bonus_percent: '5', deadline: '' })
  const [busy, setBusy] = useState(false)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function load() {
    api.tasks()
      .then((r) => setTasks(r.tasks))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, []) // eslint-disable-line

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        division: form.division || null,
        bonus_percent: Number(form.bonus_percent),
        deadline: form.deadline || null,
      }
      await api.createTask(payload)
      toast.success('Tugas dibuat & ditawarkan ke karyawan.')
      setForm({ title: '', description: '', division: '', bonus_percent: '5', deadline: '' })
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function review(claimId, decision) {
    try {
      await api.reviewClaim(claimId, decision)
      toast.success(decision === 'approved' ? 'Tugas disetujui.' : 'Tugas ditolak.')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <>
      <div className="topbar reveal d1">
        <div>
          <div className="page-kicker">Insentif Transparan</div>
          <h1 className="page-title">Tugas &amp; Bonus</h1>
        </div>
      </div>

      <section className="section reveal d2">
        <div className="row gap-lg" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Form buat tugas */}
          <form className="panel" style={{ padding: 28, flex: '1 1 340px' }} onSubmit={submit}>
            <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 20 }}>Buat Tugas Baru</h2>

            <div className="field">
              <label className="lbl">Judul Tugas</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="mis. Bantu migrasi data klien" required />
            </div>
            <div className="field">
              <label className="lbl">Deskripsi</label>
              <textarea rows="3" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Rincian pekerjaan…" />
            </div>
            <div className="row gap-md">
              <div className="field" style={{ flex: 1 }}>
                <label className="lbl">Divisi Sasaran</label>
                <select value={form.division} onChange={(e) => set('division', e.target.value)}>
                  {DIVISIONS.map((d) => <option key={d} value={d}>{d || 'Semua divisi'}</option>)}
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="lbl">Bonus (%)</label>
                <input type="number" min="0" max="100" step="0.5" value={form.bonus_percent} onChange={(e) => set('bonus_percent', e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <label className="lbl">Tenggat (opsional)</label>
              <input type="datetime-local" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
              {busy ? <span className="spinner" /> : <><IconPlus style={{ width: 18, height: 18 }} /> Terbitkan Tugas</>}
            </button>
          </form>

          {/* Daftar tugas + pengambil */}
          <div style={{ flex: '2 1 460px' }}>
            <div className="section-head">
              <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Daftar Tugas &amp; Pengambil</h2>
            </div>

            {loading && <div className="panel empty"><span className="spinner" style={{ margin: '0 auto' }} /></div>}

            {!loading && tasks.length === 0 && (
              <div className="panel empty">
                <div className="big">📋</div>
                <p className="mt-sm">Belum ada tugas. Buat tugas pertama di sebelah kiri.</p>
              </div>
            )}

            {!loading && tasks.map((t) => (
              <div key={t.id} className="panel" style={{ padding: 22, marginBottom: 16 }}>
                <div className="row between">
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{t.title}</h3>
                    <span className="mute" style={{ fontSize: '0.8rem' }}>
                      {t.division || 'Semua divisi'}
                      {t.deadline && ` · tenggat ${new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--vermillion)', fontSize: '1.4rem' }}>
                    +{Number(t.bonus_percent)}%
                  </span>
                </div>

                {/* Deskripsi tugas */}
                {t.description && (
                  <p className="mute mt-sm" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{linkifyText(t.description)}</p>
                )}

                {/* Pengambil */}
                <div className="mt-md" style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
                  <div className="lbl" style={{ marginBottom: 10 }}>
                    Diambil oleh {t.claims?.length || 0} karyawan
                  </div>

                  {(!t.claims || t.claims.length === 0) && (
                    <span className="mute" style={{ fontSize: '0.86rem' }}>Belum ada yang mengambil tugas ini.</span>
                  )}

                  {t.claims?.map((c) => (
                    <div key={c.id} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                      <div className="row gap-sm">
                        <span className="emp-ava" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{initials(c.user?.name)}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.user?.name || 'Karyawan'}</div>
                          <div className="mute" style={{ fontSize: '0.74rem' }}>{c.user?.division || '—'}</div>
                        </div>
                      </div>
                      <div className="row gap-sm">
                        <span className={`badge ${CLAIM_CLASS[c.status]}`}><span className="dot" /> {CLAIM_LABEL[c.status]}</span>
                        {c.status === 'submitted' && (
                          <>
                            <button className="btn btn-sm btn-primary" onClick={() => review(c.id, 'approved')}>Setujui</button>
                            <button className="btn btn-sm" onClick={() => review(c.id, 'rejected')}>Tolak</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
