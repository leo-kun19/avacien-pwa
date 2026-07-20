<?php

namespace App\Services;

class FaceService
{
    /**
     * Ambang batas jarak euclidean untuk dianggap wajah yang sama.
     * face-api.js merekomendasikan 0.6 (semakin kecil semakin mirip).
     */
    public const MATCH_THRESHOLD = 0.6;

    /**
     * Hitung jarak euclidean antara dua descriptor wajah.
     *
     * @param  array<int, float>  $a
     * @param  array<int, float>  $b
     */
    public function euclideanDistance(array $a, array $b): float
    {
        if (count($a) !== count($b) || count($a) === 0) {
            return PHP_FLOAT_MAX;
        }

        $sum = 0.0;
        foreach ($a as $i => $value) {
            $diff = $value - $b[$i];
            $sum += $diff * $diff;
        }

        return sqrt($sum);
    }

    /**
     * Verifikasi descriptor kandidat terhadap descriptor tersimpan.
     * Mengembalikan ['matched' => bool, 'distance' => float, 'score' => float].
     *
     * @param  array<int, float>  $stored
     * @param  array<int, float>  $candidate
     * @return array{matched: bool, distance: float, score: float}
     */
    public function verify(array $stored, array $candidate): array
    {
        $distance = $this->euclideanDistance($stored, $candidate);
        // Skor kemiripan 0..1 (1 = identik)
        $score = max(0.0, 1.0 - $distance);

        return [
            'matched' => $distance <= self::MATCH_THRESHOLD,
            'distance' => round($distance, 4),
            'score' => round($score, 4),
        ];
    }
}
