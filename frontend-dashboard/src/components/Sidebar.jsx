    import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconGrid, IconPulse, IconReport, IconTask, IconLogout, IconUser } from './Icons'

const NAV = [
  { path: '/', label: 'Ikhtisar', Icon: IconGrid },
  { path: '/monitoring', label: 'Monitoring', Icon: IconPulse },
  { path: '/laporan', label: 'Laporan', Icon: IconReport },
  { path: '/tugas', label: 'Tugas & Bonus', Icon: IconTask },
  { path: '/karyawan', label: 'Karyawan', Icon: IconUser },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      <div className="brand-row">
        <img src="/logo.png" alt="Avacien" className="brand-logo-chip" />
        <div>
          <div className="brand">Ava<span className="accent">cien</span></div>
          <div className="brand-sub">Konsol Manajer</div>
        </div>
      </div>

      <nav className="nav" aria-label="Navigasi">
        {NAV.map(({ path, label, Icon }) => (
          <button
            key={path}
            className={`nav-item ${pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={pathname === path ? 'page' : undefined}
          >
            <Icon /> <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div style={{ color: 'var(--paper)', fontWeight: 600, marginBottom: 2 }}>{user?.name}</div>
        <div>{user?.position || 'Manajer'}</div>
        <button className="nav-item" style={{ marginTop: 14, paddingLeft: 0 }} onClick={logout}>
          <IconLogout /> <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
