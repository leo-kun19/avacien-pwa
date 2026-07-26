<?php

namespace App\Services;

use App\Models\OfficeLocation;

class GeofenceService
{
    /**
     * Hitung jarak antara dua titik koordinat (meter) dengan formula Haversine.
     */
    public function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000; // meter

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Cari kantor aktif yang mencakup koordinat tersebut dalam radius geofence.
     * Mengembalikan office + jarak, atau null jika di luar semua geofence.
     *
     * @return array{office: OfficeLocation, distance: float}|null
     */
    public function locateWithinOffice(float $lat, float $lng): ?array
    {
        $offices = OfficeLocation::where('is_active', true)->get();

        foreach ($offices as $office) {
            $distance = $this->distanceMeters($lat, $lng, $office->latitude, $office->longitude);
            if ($distance <= $office->radius_meters) {
                return ['office' => $office, 'distance' => $distance];
            }
        }

        return null;
    }
}
