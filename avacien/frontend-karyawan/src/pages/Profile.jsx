import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { IconLogout, IconFace, IconCheck } from '../components/Icons'
import { api } from '../lib/api'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', position: '' })
  const [saving, setSaving] = useState(false)

  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('') || '?'

  function openEdit() {
    setForm({ name: user?.name || '', position: user?.position || '' })
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  async function saveEdit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Nama tidak boleh kosong.')
      return
    }
    setSaving(true)
    try {
      const res = await api.updateProfile({ name: form.name.trim(), position: form.position.trim() || null })
      setUser(res.user)
      toast.success('Profil diperbarui.')
      setEditing(false)
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-top">
      <header className="reveal d1">
        <span className="eyebrow">Akun</span>
        <h1 className="sec-title mt-sm" style={{ fontSize: '1.9rem' }}>Profil</h1>
      </header>

      <section className="card mt-md reveal d2" style={{ padding: 22 }}>
        <div className="row gap-md">
          <div className="avatar">{initials}</div>
          <div>
            <div className="display" style={{ fontSize: '1.4rem' }}>{user?.name}</div>
            <div className="muted" style={{ fontSize: '0.84rem' }}>{user?.email}</div>
          </div>
        </div>
        <div className="row between mt-md" style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <span className="muted" style={{ fontSize: '0.8rem' }}>ID Karyawan</span>
          <strong style={{ fontSize: '0.9rem' }}>{user?.employee_id || '—'}</strong>
        </div>
        <div className="row between mt-sm">
          <span className="muted" style={{ fontSize: '0.8rem' }}>Divisi</span>
          <strong style={{ fontSize: '0.9rem' }}>{user?.division || '—'}</strong>
        </div>
        <div className="row between mt-sm">
          <span className="muted" style={{ fontSize: '0.8rem' }}>Jabatan</span>
          <strong style={{ fontSize: '0.9rem' }}>{user?.position || '—'}</strong>
        </div>

        {!editing ? (
          <button className="btn btn-ghost mt-md" onClick={openEdit}>
            Edit Profil
          </button>
        ) : (
          <form onSubmit={saveEdit} style={{ marginTop: 18 }}>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
              <label className="field">
                <span className="muted" style={{ fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>Nama</span>
                <input
                  className="input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  maxLength={255}
                  required
                />
              </label>
              <label className="field mt-sm">
                <span className="muted" style={{ fontSize: '0.8rem', marginBottom: 4, display: 'block' }}>Jabatan</span>
                <input
                  className="input"
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  maxLength={255}
                  placeholder="Opsional"
                />
              </label>
              <div className="row gap-md mt-md">
                <button className="btn" type="submit" disabled={saving}>
                  {saving ? 'Menyimpan…' : 'Simpan'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={cancelEdit} disabled={saving}>
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      <section className="card mt-md reveal d3" style={{ padding: 18 }}>
        <div className="row between">
          <div className="row gap-md">
            <div className={`pill ${user?.face_enrolled ? 'status-active' : 'status-inactive'}`}>
              {user?.face_enrolled ? <IconCheck style={{ width: 14, height: 14 }} /> : <IconFace style={{ width: 14, height: 14 }} />}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Wajah Terdaftar</div>
              <div className="muted" style={{ fontSize: '0.8rem' }}>
                {user?.face_enrolled ? 'Siap untuk absensi' : 'Belum didaftarkan'}
              </div>
            </div>
          </div>
        </div>
        <button className="btn btn-ghost mt-md" onClick={() => navigate('/daftar-wajah')}>
          {user?.face_enrolled ? 'Perbarui Wajah' : 'Daftarkan Wajah'}
        </button>
      </section>

      <button
        className="btn btn-ghost mt-lg reveal d4"
        onClick={async () => { await logout(); toast.info('Kamu telah keluar.') }}
      >
        <IconLogout style={{ width: 18, height: 18 }} /> Keluar
      </button>

      <p className="center muted mt-lg reveal d5" style={{ fontSize: '0.72rem', letterSpacing: '0.1em' }}>
        AVACIEN · KELOMPOK 8
      </p>
    </div>
  )
}
