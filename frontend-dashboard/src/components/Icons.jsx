const b = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IconGrid = (p) => (
  <svg viewBox="0 0 24 24" {...p}><rect {...b} x="3" y="3" width="7" height="7" rx="1" /><rect {...b} x="14" y="3" width="7" height="7" rx="1" /><rect {...b} x="3" y="14" width="7" height="7" rx="1" /><rect {...b} x="14" y="14" width="7" height="7" rx="1" /></svg>
)
export const IconPulse = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...b} d="M3 12h4l2-6 4 12 2-6h6" /></svg>
)
export const IconReport = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...b} d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path {...b} d="M14 3v6h6M9 14h6M9 17h4" /></svg>
)
export const IconTask = (p) => (
  <svg viewBox="0 0 24 24" {...p}><rect {...b} x="4" y="4" width="16" height="16" rx="2" /><path {...b} d="m8 12 3 3 5-6" /></svg>
)
export const IconLogout = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...b} d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 8l-4 4 4 4M6 12h11" /></svg>
)
export const IconPlus = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...b} d="M12 5v14M5 12h14" /></svg>
)
export const IconArrow = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...b} d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const IconRefresh = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...b} d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2" /><path {...b} d="M20 4v5h-5M4 20v-5h5" /></svg>
)
export const IconUser = (p) => (
  <svg viewBox="0 0 24 24" {...p}><circle fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" cx="12" cy="8" r="4" /><path fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" /></svg>
)
