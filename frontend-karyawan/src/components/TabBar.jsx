import { useNavigate, useLocation } from 'react-router-dom'
import { IconHome, IconClock, IconTasks, IconUser } from './Icons'

const TABS = [
  { path: '/', label: 'Beranda', Icon: IconHome },
  { path: '/riwayat', label: 'Aktivitas', Icon: IconClock },
  { path: '/tugas', label: 'Tugas', Icon: IconTasks },
  { path: '/profil', label: 'Profil', Icon: IconUser },
]

export default function TabBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="tabbar" aria-label="Navigasi utama">
      {TABS.map(({ path, label, Icon }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            className={`tab ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
