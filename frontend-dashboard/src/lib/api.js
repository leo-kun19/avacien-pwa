// Klien API untuk Konsol Manajer Avacien (Laravel + Sanctum).
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKEN_KEY = 'avacien_mgr_token'

export function getToken() { return localStorage.getItem(TOKEN_KEY) }
export function setToken(t) { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) }

function qs(params) {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString()
  return s ? `?${s}` : ''
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (auth) {
    const t = getToken()
    if (t) headers['Authorization'] = `Bearer ${t}`
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  let data = null
  const text = await res.text()
  if (text) { try { data = JSON.parse(text) } catch { data = { message: text } } }
  if (!res.ok) {
    const err = new Error(data?.message || `Kesalahan (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  login: (email, password) =>
    request('/login', { method: 'POST', auth: false, body: { email, password, device: 'dashboard' } }),
  me: () => request('/me'),
  logout: () => request('/logout', { method: 'POST' }),

  overview: () => request('/manager/overview'),
  monitoring: () => request('/manager/monitoring'),
  attendanceReport: (params = {}) => request(`/manager/reports/attendance${qs(params)}`),
  employeeActivity: (userId, date) => request(`/manager/employees/${userId}/activity${qs({ date })}`),
  createTask: (payload) => request('/manager/tasks', { method: 'POST', body: payload }),
  tasks: () => request('/manager/tasks'),
  reviewClaim: (claimId, decision) =>
    request(`/manager/claims/${claimId}/review`, { method: 'POST', body: { decision } }),

  employees: () => request('/manager/employees'),
  addEmployee: (data) => request('/manager/employees', { method: 'POST', body: data }),
  updateEmployee: (id, data) => request(`/manager/employees/${id}`, { method: 'PUT', body: data }),
}
