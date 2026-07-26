import { STATUS_LABEL, ATT_LABEL } from '../lib/labels'

export function StatusBadge({ status }) {
  return (
    <span className={`badge b-${status}`}>
      <span className="dot" /> {STATUS_LABEL[status] || status}
    </span>
  )
}

export function AttendanceBadge({ status, lateMinutes }) {
  const cls = status === 'late' ? 'b-inactive' : status === 'absent' ? 'b-offline' : 'b-active'
  const label = status === 'late' ? `Telat ${lateMinutes ?? ''}m` : ATT_LABEL[status] || status
  return <span className={`badge ${cls}`}><span className="dot" /> {label}</span>
}
