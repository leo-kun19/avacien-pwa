# Avacien — PWA Karyawan

Antarmuka mobile-first untuk karyawan: absensi wajah (face-api.js, on-device) + geofencing GPS, status keaktifan, tugas & bonus, timeline aktivitas.

## Desain
"Dusk Ledger" — indigo malam + aksen apricot/amber. Tipografi: Fraunces (display) + Spline Sans (body).

## Menjalankan
```bash
npm install
npm run dev      # http://localhost:5173
```
Backend harus jalan di `http://localhost:8000` (lihat ../backend). Atur lewat `.env` → `VITE_API_URL`.

## Login demo
- Karyawan: `karyawan1@avacien.test` / `password`

## Alur
1. Login → bila wajah belum terdaftar, diarahkan ke **Daftar Wajah**.
2. Beranda → tombol **Absen Masuk/Pulang** → verifikasi wajah + GPS.
3. Set status keaktifan (Aktif/Istirahat/Tidak Aktif); heartbeat otomatis tiap 45 detik.
4. Tugas → ambil & kirim hasil. Aktivitas → timeline + riwayat absensi.

## Catatan teknis
- Model face-api.js ada di `public/models` (tiny detector, landmark68, recognition).
- Pengenalan wajah berjalan di perangkat; hanya descriptor 128-d + hasil verifikasi yang dikirim ke server.
- Kamera & GPS butuh konteks aman: `localhost` atau HTTPS.
```
