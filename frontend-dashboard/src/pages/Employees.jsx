import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { IconPlus } from '../components/Icons'

const DIVISIONS = ['Engineering', 'Marketing', 'Finance', 'Management', 'Lainnya']

const EMPTY_FORM = {
  employee_id: '',
  name: '',
  email: '',
  password: '',
  division: '',
  position: '',
}

function EmployeeForm({ initial = EMPTY_FORM, isEdit = false, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial)

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form className="panel" onSubmit={handleSubmit} style={{ marginTop: 20, padding: 24 }}>
      <h3 style={{ margin: '0 0 18px', fontSize: '1rem', fontWeight: 700 }}>
        {isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}
      </h3>
      <div className="fields-grid">
        <label className="field">
          <span>ID Karyawan</span>
          <input
            className="input"
            type="text"
            value={form.employee_id}
            onChange={(e) => set('employee_id', e.target.value)}
            maxLength={50}
            placeholder="Opsional"
          />
        </label>
        <label className="field">
          <span>Nama <span style={{ color: 'var(--accent)' }}>*</span></span>
          <input
            className="input"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            maxLength={255}
            required
          />
        </label>
        <label className="field">
          <span>Email <span style={{ color: 'var(--accent)' }}>*</span></span>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            maxLength={255}
            required
          />
        </label>
        <label className="field">
          <span>{isEdit ? 'Password (kosongkan jika tidak diubah)' : 'Password *'}</span>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            minLength={isEdit && form.password ? 6 : undefined}
            required={!isEdit}
            placeholder={isEdit ? 'Biarkan kosong jika tidak diubah' : ''}
          />
        </label>
        <label className="field">
          <span>Divisi</span>
          <select
            className="input"
            value={form.division}
            onChange={(e) => set('division', e.target.value)}
          >
            <option value="">— Pilih divisi —</option>
            {DIVISIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Jabatan</span>
          <input
            className="input"
            type="text"
            value={form.position}
            onChange={(e) => set('position', e.target.value)}
            maxLength={255}
            placeholder="Opsional"
          />
        </label>
      </div>
      <div className="row gap-md" style={{ marginTop: 20 }}>
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambahkan'}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={saving}>
          Batal
        </button>
      </div>
    </form>
  )
}

export default function Employees() {
  const toast = useToast()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [panel, setPanel] = useState(null) // null | 'add' | { id, ...editData }
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await api.employees()
      setEmployees(res.employees)
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar karyawan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setPanel('add')
  }

  function openEdit(emp) {
    setPanel({
      id: emp.id,
      employee_id: emp.employee_id || '',
      name: emp.name || '',
      email: emp.email || '',
      password: '',
      division: emp.division || '',
      position: emp.position || '',
    })
  }

  function closePanel() {
    setPanel(null)
  }

  async function handleAdd(form) {
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        employee_id: form.employee_id.trim() || undefined,
        division: form.division || undefined,
        position: form.position.trim() || undefined,
      }
      await api.addEmployee(payload)
      toast.success('Karyawan berhasil ditambahkan.')
      setPanel(null)
      await load()
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan karyawan.')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(form) {
    if (!panel?.id) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        employee_id: form.employee_id.trim() || undefined,
        division: form.division || undefined,
        position: form.position.trim() || undefined,
      }
      if (form.password) payload.password = form.password
      await api.updateEmployee(panel.id, payload)
      toast.success('Data karyawan diperbarui.')
      setPanel(null)
      await load()
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui karyawan.')
    } finally {
      setSaving(false)
    }
  }

  const isAdd = panel === 'add'
  const isEdit = panel && panel !== 'add'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Karyawan</h1>
          <p className="page-sub">Kelola akun dan data karyawan</p>
        </div>
        <button className="btn" onClick={openAdd}>
          <IconPlus style={{ width: 16, height: 16 }} /> Tambah Karyawan
        </button>
      </div>

      {isAdd && (
        <EmployeeForm
          initial={EMPTY_FORM}
          isEdit={false}
          onSave={handleAdd}
          onCancel={closePanel}
          saving={saving}
        />
      )}

      {isEdit && (
        <EmployeeForm
          initial={panel}
          isEdit={true}
          onSave={handleEdit}
          onCancel={closePanel}
          saving={saving}
        />
      )}

      <div className="table-wrap" style={{ marginTop: 20 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><span className="spinner" /></div>
        ) : employees.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>Belum ada karyawan.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Divisi</th>
                <th>Jabatan</th>
                <th>Wajah</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{emp.employee_id || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td style={{ fontSize: '0.85rem' }}>{emp.email}</td>
                  <td>{emp.division || '—'}</td>
                  <td>{emp.position || '—'}</td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: emp.face_enrolled ? 'var(--green)' : 'var(--muted)',
                      }}
                    >
                      {emp.face_enrolled ? '✓ Ada' : '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '4px 12px', fontSize: '0.82rem' }}
                      onClick={() => openEdit(emp)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
