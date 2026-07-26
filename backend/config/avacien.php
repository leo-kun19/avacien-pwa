<?php

return [
    // Jam masuk standar (WIB). Lewat dari ini + toleransi dianggap terlambat.
    'work_start' => env('AVACIEN_WORK_START', '09:00'),

    // Toleransi keterlambatan dalam menit sebelum status "late".
    'late_tolerance_minutes' => (int) env('AVACIEN_LATE_TOLERANCE', 5),

    // Karyawan dianggap "inactive" otomatis jika tidak ada heartbeat sekian detik.
    'heartbeat_timeout_seconds' => (int) env('AVACIEN_HEARTBEAT_TIMEOUT', 120),

    // Penegakan geofence. Set false untuk testing agar semua lokasi diterima
    // (absensi tidak ditolak walau GPS jauh dari kantor). Produksi: true.
    'geofence_enforced' => filter_var(env('AVACIEN_GEOFENCE_ENFORCED', true), FILTER_VALIDATE_BOOL),
];
