# Avacien — Konsol Manajer

Dashboard desktop untuk manajer/HRD: ikhtisar harian, monitoring keaktifan real-time (Laravel Reverb WebSocket), laporan absensi + ekspor CSV, dan pembuatan tugas dengan bonus transparan.

## Desain
"Atelier Report" — editorial broadsheet. Kertas bone/cream, tinta charcoal, aksen vermillion + forest green. Tipografi: Bricolage Grotesque (display) + Hanken Grotesk (body).

## Menjalankan
```bash
npm install
npm run dev      # http://localhost:5174
```

### Prasyarat backend (di ../backend)
```bash
php artisan serve --port=8000        # REST API
php artisan reverb:start --port=8080 # WebSocket real-time
```

## Login demo
- Manajer: `manajer@avacien.test` / `password`

## Halaman
- **Ikhtisar** — kartu statistik (hadir, telat, belum hadir, aktif), tingkat kehadiran, sekilas tim.
- **Monitoring** — papan keaktifan real-time. Live via Reverb; otomatis fallback ke polling 8 detik bila WS putus. Kartu berkedip saat status berubah.
- **Laporan** — rekap absensi per rentang & divisi, mini-chart komposisi, ekspor CSV.
- **Tugas & Bonus** — buat tugas (divisi sasaran + bonus %), pratinjau langsung.

## Real-time
Event `EmployeeStatusUpdated` & `AttendanceRecorded` (ShouldBroadcastNow) disiarkan ke channel publik `monitoring`. Konfigurasi Reverb di `.env` (VITE_REVERB_*) harus cocok dengan backend.
