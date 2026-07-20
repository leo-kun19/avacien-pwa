export const STATUS_LABEL = {
  active: 'Aktif',
  on_break: 'Istirahat',
  inactive: 'Tidak Aktif',
  offline: 'Offline',
}

export const STATUS_EMOJI = {
  active: '🟢',
  on_break: '☕',
  inactive: '🌙',
  offline: '⚪',
}

export const ATT_STATUS_LABEL = {
  on_time: 'Tepat Waktu',
  late: 'Terlambat',
  absent: 'Tidak Hadir',
}

export function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDate(d = new Date()) {
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function fmtDuration(seconds) {
  if (!seconds) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}j ${m}m`
  return `${m}m`
}
