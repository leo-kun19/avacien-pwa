// Koneksi real-time ke Laravel Reverb. Mengembalikan instance Echo,
// atau null bila gagal (caller akan fallback ke polling).
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echo = null

export function connectEcho() {
  if (echo) return echo
  const key = import.meta.env.VITE_REVERB_APP_KEY
  const host = import.meta.env.VITE_REVERB_HOST || 'localhost'
  const port = Number(import.meta.env.VITE_REVERB_PORT || 8080)
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http'

  if (!key) return null

  window.Pusher = Pusher
  try {
    echo = new Echo({
      broadcaster: 'reverb',
      key,
      wsHost: host,
      wsPort: port,
      wssPort: port,
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      cluster: '',
    })
    return echo
  } catch {
    return null
  }
}

export function getEcho() { return echo }
