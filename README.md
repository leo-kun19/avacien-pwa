# Avacien — Available & Efficient

Avacien adalah aplikasi manajemen SDM (HR) berbasis web dengan arsitektur **multi-frontend**: satu PWA untuk karyawan dan satu dashboard untuk manajer, keduanya terhubung ke satu backend API bersama. Fokus aplikasi ini pada **efisiensi, transparansi, dan akurasi** proses kerja: absensi, monitoring keaktifan, dan pengelolaan tugas.

## ✨ Fitur Utama

### 📱 PWA Karyawan
- **Absensi wajah** — verifikasi wajah on-device (face-api.js), hanya descriptor & skor yang dikirim ke server (privasi terjaga)
- **Geofencing GPS** — validasi lokasi terhadap titik kantor + radius
- **Status keaktifan** — Aktif / Istirahat / Tidak Aktif dengan heartbeat otomatis
- **Tugas & bonus** — klaim jobdesc tambahan dengan insentif transparan
- **Riwayat** — timeline aktivitas harian & riwayat absensi
- Installable sebagai PWA (manifest + service worker)

### 🖥️ Dashboard Manajer
- Monitoring keaktifan karyawan secara **real-time** (WebSocket)
- Rekapitulasi & laporan kehadiran
- Manajemen karyawan, tugas, dan review

## 🏗️ Arsitektur

```
avacien-pwa/
├── backend/              # Laravel — REST API + Sanctum (token auth) + Reverb (WebSocket)
├── frontend-karyawan/    # React (Vite) PWA — face-api.js + GPS, mobile-first
└── frontend-dashboard/   # React (Vite) — dashboard manajer, real-time monitoring
```

Ketiga bagian berkomunikasi melalui REST API; monitoring real-time memakai WebSocket (Laravel Reverb).

## 🛠️ Tech Stack

- **Backend:** PHP, Laravel, Sanctum (auth token), Reverb (WebSocket)
- **Frontend:** React, Vite, face-api.js
- **Database:** SQLite (default dev) / MySQL
- **Auth:** JWT-style bearer token (Laravel Sanctum)

## 🚀 Menjalankan Secara Lokal

### Prasyarat
- PHP 8.2+ & Composer
- Node.js 18+ & npm

### 1. Backend
```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 2. Frontend Karyawan (PWA)
```bash
cd frontend-karyawan
npm install
npm run dev
```

### 3. Frontend Dashboard Manajer
```bash
cd frontend-dashboard
npm install
npm run dev
```

> Kamera & GPS hanya aktif pada secure context (`localhost` atau HTTPS).

## 🔒 Catatan Keamanan & Privasi

- Data wajah disimpan sebagai **embedding** (vektor), bukan foto mentah.
- Kredensial dan secret disimpan di `.env` (tidak di-commit).
- Untuk testing, geofence dapat dinonaktifkan via `AVACIEN_GEOFENCE_ENFORCED=false`; aktifkan (`true`) untuk produksi.

## 📄 Lisensi

Proyek ini dibuat untuk keperluan pembelajaran.
