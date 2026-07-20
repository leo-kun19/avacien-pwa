<?php

return [
    /*
    | Konfigurasi CORS untuk dua frontend Avacien:
    | - PWA Karyawan
    | - Web Dashboard Manajer
    | Karena memakai token Bearer (Sanctum), tidak perlu credentials/cookie.
    */

    'paths' => ['api/*', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:5174'))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
