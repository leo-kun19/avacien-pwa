// Set ikon garis minimal, stroke konsisten.
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IconHome = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...base} d="M3 10.5 12 3l9 7.5" /><path {...base} d="M5 9.5V21h14V9.5" /></svg>
)
export const IconClock = (p) => (
  <svg viewBox="0 0 24 24" {...p}><circle {...base} cx="12" cy="12" r="9" /><path {...base} d="M12 7v5l3 2" /></svg>
)
export const IconTasks = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...base} d="M4 6h16M4 12h16M4 18h10" /><circle cx="19" cy="18" r="1.6" fill="currentColor" /></svg>
)
export const IconUser = (p) => (
  <svg viewBox="0 0 24 24" {...p}><circle {...base} cx="12" cy="8" r="4" /><path {...base} d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" /></svg>
)
export const IconFace = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...base} d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><circle {...base} cx="9.5" cy="11" r="0.6" /><circle {...base} cx="14.5" cy="11" r="0.6" /><path {...base} d="M9.5 15c1.5 1.2 3.5 1.2 5 0" /></svg>
)
export const IconPin = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...base} d="M12 21c4-4.5 7-7.8 7-11a7 7 0 1 0-14 0c0 3.2 3 6.5 7 11Z" /><circle {...base} cx="12" cy="10" r="2.5" /></svg>
)
export const IconLogout = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...base} d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 8l-4 4 4 4M6 12h11" /></svg>
)
export const IconBell = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...base} d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path {...base} d="M10 19a2 2 0 0 0 4 0" /></svg>
)
export const IconArrow = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...base} d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" {...p}><path {...base} d="M5 13l4 4L19 7" /></svg>
)
