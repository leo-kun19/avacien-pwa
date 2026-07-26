export const STATUS_LABEL = {
  active: 'Aktif',
  on_break: 'Istirahat',
  inactive: 'Tidak Aktif',
  offline: 'Offline',
}

export const ATT_LABEL = { on_time: 'Tepat Waktu', late: 'Terlambat', absent: 'Tidak Hadir' }

export function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}
export function fmtDur(seconds) {
  if (!seconds) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}j ${m}m` : `${m}m`
}
export function relTime(iso) {
  if (!iso) return 'belum pernah'
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return fmtDate(iso)
}

export function initials(name) {
  return (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
