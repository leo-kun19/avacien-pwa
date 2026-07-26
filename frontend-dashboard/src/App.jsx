import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Monitoring from './pages/Monitoring'
import Reports from './pages/Reports'
import TasksManage from './pages/TasksManage'
import Employees from './pages/Employees'

function Console() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/laporan" element={<Reports />} />
          <Route path="/tugas" element={<TasksManage />} />
          <Route path="/karyawan" element={<Employees />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function Root() {
  const { user, loading } = useAuth()
  if (loading) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}><span className="spinner" /></div>
  }
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={user ? <Console /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Root />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
