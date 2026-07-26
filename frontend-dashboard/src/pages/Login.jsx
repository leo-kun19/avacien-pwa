import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { IconArrow } from '../components/Icons'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await login(email, password)
      toast.success('Selamat datang, Manajer.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-screen">
      <aside className="login-art">
        <div className="brand-row">
          <img src="/logo.png" alt="Avacien" className="brand-logo-chip" />
          <div>
            <div className="brand" style={{ fontSize: '2rem' }}>Ava<span className="accent">cien</span></div>
            <div className="brand-sub">Konsol Manajer</div>
          </div>
        </div>
        <div>
          <h1 className="huge">Pantau<br />tim.<br />Secara<br /><span style={{ color: 'var(--vermillion)' }}>langsung.</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', marginTop: 22, maxWidth: 320, lineHeight: 1.6 }}>
            Kehadiran, keaktifan, dan produktivitas seluruh karyawan dalam satu papan.
          </p>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>AVACIEN · KELOMPOK 8</div>
      </aside>

      <div className="login-form-wrap">
        <form className="login-form reveal d1" onSubmit={submit}>
          <span className="page-kicker">Masuk</span>
          <h2 className="page-title" style={{ fontSize: '2.4rem' }}>Konsol Manajer</h2>
          <div className="field mt-lg">
            <label className="lbl" htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="username" placeholder="manajer@avacien.test"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="lbl" htmlFor="password">Kata Sandi</label>
            <input id="password" type="password" autoComplete="current-password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary mt-sm" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
            {busy ? <span className="spinner" /> : <>Masuk Konsol <IconArrow style={{ width: 18, height: 18 }} /></>}
          </button>
          <p className="mute center mt-lg" style={{ fontSize: '0.8rem' }}>Demo: manajer@avacien.test · password</p>
        </form>
      </div>
    </div>
  )
}
