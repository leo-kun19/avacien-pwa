<?php

namespace App\Http\Controllers\Api;

use App\Events\AttendanceRecorded;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Services\FaceService;
use App\Services\GeofenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly FaceService $faceService,
        private readonly GeofenceService $geofenceService,
    ) {
    }

    /**
     * Absen masuk: verifikasi wajah (on-device descriptor) + geofence GPS.
     */
    public function checkIn(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $user = $request->user();

        if (! $user->face_enrolled || ! $user->faceEmbedding) {
            return response()->json(['message' => 'Wajah belum didaftarkan.'], 422);
        }

        $today = Carbon::today();
        $existing = Attendance::where('user_id', $user->id)
            ->whereDate('work_date', $today)
            ->first();

        if ($existing && $existing->check_in_at) {
            return response()->json(['message' => 'Anda sudah absen masuk hari ini.'], 409);
        }

        $check = $this->runChecks($user, $data);
        if ($check instanceof JsonResponse) {
            return $check;
        }

        $now = Carbon::now();
        $status = $this->resolveLateStatus($now);

        $photoPath = $this->storePhoto($data['photo'] ?? null, $user->id, 'in');

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'work_date' => $today->toDateString(),
            'check_in_at' => $now,
            'check_in_lat' => $data['latitude'],
            'check_in_lng' => $data['longitude'],
            'check_in_face_score' => $check['score'],
            'check_in_photo_path' => $photoPath,
            'status' => $status['status'],
            'late_minutes' => $status['late_minutes'],
        ]);

        broadcast(new AttendanceRecorded($attendance, 'check_in'));

        return response()->json([
            'message' => 'Absen masuk berhasil.',
            'attendance' => $attendance,
            'face' => $check,
        ], 201);
    }

    /**
     * Absen pulang.
     */
    public function checkOut(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $user = $request->user();

        if (! $user->face_enrolled || ! $user->faceEmbedding) {
            return response()->json(['message' => 'Wajah belum didaftarkan.'], 422);
        }

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('work_date', Carbon::today())
            ->first();

        if (! $attendance || ! $attendance->check_in_at) {
            return response()->json(['message' => 'Anda belum absen masuk hari ini.'], 409);
        }

        if ($attendance->check_out_at) {
            return response()->json(['message' => 'Anda sudah absen pulang hari ini.'], 409);
        }

        $check = $this->runChecks($user, $data);
        if ($check instanceof JsonResponse) {
            return $check;
        }

        $photoPath = $this->storePhoto($data['photo'] ?? null, $user->id, 'out');

        $attendance->update([
            'check_out_at' => Carbon::now(),
            'check_out_lat' => $data['latitude'],
            'check_out_lng' => $data['longitude'],
            'check_out_face_score' => $check['score'],
            'check_out_photo_path' => $photoPath,
        ]);

        broadcast(new AttendanceRecorded($attendance, 'check_out'));

        return response()->json([
            'message' => 'Absen pulang berhasil.',
            'attendance' => $attendance,
            'face' => $check,
        ]);
    }

    /**
     * Status absensi hari ini untuk PWA.
     */
    public function today(Request $request): JsonResponse
    {
        $attendance = Attendance::where('user_id', $request->user()->id)
            ->whereDate('work_date', Carbon::today())
            ->first();

        return response()->json(['attendance' => $attendance]);
    }

    /**
     * Riwayat absensi karyawan.
     */
    public function history(Request $request): JsonResponse
    {
        $attendances = Attendance::where('user_id', $request->user()->id)
            ->orderByDesc('work_date')
            ->limit(60)
            ->get();

        return response()->json(['attendances' => $attendances]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'descriptor' => ['required', 'array', 'min:128', 'max:128'],
            'descriptor.*' => ['numeric'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'photo' => ['nullable', 'string'], // data URI base64 opsional sebagai bukti
        ]);
    }

    /**
     * Jalankan verifikasi wajah + geofence. Kembalikan hasil face match,
     * atau JsonResponse error bila gagal.
     *
     * @param  array<string, mixed>  $data
     * @return array{matched: bool, distance: float, score: float}|JsonResponse
     */
    private function runChecks($user, array $data): array|JsonResponse
    {
        // 1. Geofence (bisa dimatikan untuk testing via config)
        if (config('avacien.geofence_enforced')) {
            $location = $this->geofenceService->locateWithinOffice(
                (float) $data['latitude'],
                (float) $data['longitude'],
            );

            if (! $location) {
                return response()->json([
                    'message' => 'Anda berada di luar area kantor. Absensi ditolak.',
                ], 422);
            }
        }

        // 2. Verifikasi wajah
        $result = $this->faceService->verify(
            $user->faceEmbedding->descriptor,
            array_map('floatval', $data['descriptor']),
        );

        if (! $result['matched']) {
            return response()->json([
                'message' => 'Verifikasi wajah gagal. Pastikan wajah Anda terlihat jelas.',
                'face' => $result,
            ], 422);
        }

        return $result;
    }

    /**
     * @return array{status: string, late_minutes: int}
     */
    private function resolveLateStatus(Carbon $now): array
    {
        $start = Carbon::createFromTimeString(config('avacien.work_start'));
        $tolerance = (int) config('avacien.late_tolerance_minutes');
        $limit = $start->copy()->addMinutes($tolerance);

        if ($now->lessThanOrEqualTo($limit)) {
            return ['status' => 'on_time', 'late_minutes' => 0];
        }

        return [
            'status' => 'late',
            'late_minutes' => $start->diffInMinutes($now),
        ];
    }

    private function storePhoto(?string $dataUri, int $userId, string $kind): ?string
    {
        if (! $dataUri || ! str_starts_with($dataUri, 'data:image')) {
            return null;
        }

        [$meta, $content] = explode(',', $dataUri, 2);
        $binary = base64_decode($content, true);
        if ($binary === false) {
            return null;
        }

        $ext = str_contains($meta, 'png') ? 'png' : 'jpg';
        $path = "attendance/{$userId}/" . now()->format('Ymd_His') . "_{$kind}.{$ext}";
        Storage::disk('local')->put($path, $binary);

        return $path;
    }
}
