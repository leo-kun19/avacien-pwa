// Klien API ringan untuk backend Avacien (Laravel + Sanctum token).
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const TOKEN_KEY = 'avacien_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (auth) {
    const t = getToken()
    if (t) headers['Authorization'] = `Bearer ${t}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  const text = await res.text()
  if (text) {
    try { data = JSON.parse(text) } catch { data = { message: text } }
  }

  if (!res.ok) {
    const message = data?.message || `Terjadi kesalahan (${res.status})`
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  login: (email, password) =>
    request('/login', { method: 'POST', auth: false, body: { email, password, device: 'pwa' } }),
  me: () => request('/me'),
  logout: () => request('/logout', { method: 'POST' }),

  faceStatus: () => request('/face/status'),
  enrollFace: (descriptor) => request('/face/enroll', { method: 'POST', body: { descriptor } }),

  todayAttendance: () => request('/attendance/today'),
  attendanceHistory: () => request('/attendance/history'),
  checkIn: (payload) => request('/attendance/check-in', { method: 'POST', body: payload }),
  checkOut: (payload) => request('/attendance/check-out', { method: 'POST', body: payload }),

  setStatus: (status) => request('/activity/status', { method: 'POST', body: { status } }),
  heartbeat: () => request('/activity/heartbeat', { method: 'POST' }),
  timeline: () => request('/activity/timeline'),

  tasks: () => request('/tasks'),
  claimTask: (id) => request(`/tasks/${id}/claim`, { method: 'POST' }),
  submitTask: (id, note) => request(`/tasks/${id}/submit`, { method: 'POST', body: { submission_note: note } }),

  notifications: () => request('/notifications'),

  updateProfile: (data) => request('/profile', { method: 'PUT', body: data }),
}
