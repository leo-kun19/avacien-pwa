// Ambil posisi GPS sekali. Mengembalikan {latitude, longitude, accuracy}.
export function getPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Perangkat tidak mendukung GPS.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Izin lokasi ditolak. Aktifkan GPS untuk absen.'
            : 'Gagal mendapatkan lokasi. Coba lagi.'
        reject(new Error(msg))
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0, ...options },
    )
  })
}
