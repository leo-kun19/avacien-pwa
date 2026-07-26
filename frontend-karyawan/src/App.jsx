import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { api } from './lib/api'
import TabBar from './components/TabBar'
import InstallPrompt from './components/InstallPrompt'
import Login from './pages/Login'
import Home from './pages/Home'
import Absen from './pages/Absen'
import FaceEnroll from './pages/FaceEnroll'
import Tasks from './pages/Tasks'
import History from './pages/History'
import Profile from './pages/Profile'

// Heartbeat berkala selama user login (tiap 45 detik).
function Heartbeat() {
  const { user } = useAuth()
  useEffect(() => {
    if (!user) return
    api.heartbeat().catch(() => {})
    const t = setInterval(() => api.heartbeat().catch(() => {}), 45000)
    const onVisible = () => { if (document.visibilityState === 'visible') api.heartbeat().catch(() => {}) }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVisible) }
  }, [user])
  return null
}

function Shell({ children }) {
  const { pathname } = useLocation()
  // Sembunyikan tabbar di layar absen/enroll (mode fokus)
  const hideTab = ['/absen', '/daftar-wajah'].includes(pathname)
  return (
    <div className="app">
      {children}
      {!hideTab && <TabBar />}
    </div>
  )
}

function Protected() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="app" style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
        <span className="spinner spinner-ghost" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return (
    <>
      <Heartbeat />
      <InstallPrompt />
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/absen" element={<Absen />} />
          <Route path="/daftar-wajah" element={<FaceEnroll />} />
          <Route path="/tugas" element={<Tasks />} />
          <Route path="/riwayat" element={<History />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </>
  )
}

function Root() {
  const { user, loading } = useAuth()
  return (
    <Routes>
      <Route
        path="/login"
        element={loading ? null : user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route path="/*" element={<Protected />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="bg-atmosphere" />
          <div className="bg-grain" />
          <Root />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
