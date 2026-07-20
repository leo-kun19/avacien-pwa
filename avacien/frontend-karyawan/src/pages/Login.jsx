import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useInstall } from '../hooks/useInstall'
import { IconArrow } from '../components/Icons'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const { canInstall, installed, install } = useInstall()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await login(email, password)
      toast.success('Selamat datang kembali.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="reveal d1">
        <span className="eyebrow">Available &amp; Efficient</span>
        <img src="/logo.png" alt="Avacien" className="brand-logo mt-sm" />
        <p className="muted mt-sm" style={{ maxWidth: 300, lineHeight: 1.5 }}>
          Masuk untuk mencatat kehadiran dan memantau keaktifan kerjamu hari ini.
        </p>
      </div>

      {/* Tombol Install PWA */}
      {canInstall && (
        <button className="install-login-btn reveal d2" onClick={install}>
          <span className="install-login-icon">📲</span>
          <span>
            <strong>Pasang Aplikasi</strong>
            <small>Tambahkan ke layar utama untuk akses cepat</small>
          </span>
        </button>
      )}
      {installed && (
        <div className="install-login-done reveal d2">
          <span>✅</span> Aplikasi sudah terpasang
        </div>
      )}

      <form onSubmit={submit} className="mt-lg reveal d2">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="nama@avacien.test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Kata Sandi</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary mt-sm" disabled={busy}>
          {busy ? <span className="spinner" /> : <>Masuk <IconArrow style={{ width: 18, height: 18 }} /></>}
        </button>
      </form>

      <p className="muted center mt-lg reveal d3" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
        Demo: karyawan1@avacien.test · password
      </p>
    </div>
  )
}
