<?php

namespace App\Http\Controllers\Api;

use App\Events\EmployeeStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ActivityController extends Controller
{
    /**
     * Ubah status keaktifan (active / on_break / inactive / offline).
     * Menutup log sebelumnya dan membuka log baru, lalu broadcast ke dashboard.
     */
    public function setStatus(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:active,on_break,inactive,offline'],
        ]);

        $user = $request->user();
        $now = Carbon::now();

        // Tutup log aktif terakhir
        $open = ActivityLog::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->latest('started_at')
            ->first();

        if ($open) {
            $open->update([
                'ended_at' => $now,
                'duration_seconds' => $open->started_at->diffInSeconds($now),
            ]);
        }

        // Buka log baru (kecuali offline tidak perlu dicatat sebagai sesi baru)
        if ($data['status'] !== 'offline') {
            ActivityLog::create([
                'user_id' => $user->id,
                'status' => $data['status'],
                'started_at' => $now,
            ]);
        }

        $user->update([
            'activity_status' => $data['status'],
            'last_seen_at' => $now,
        ]);

        broadcast(new EmployeeStatusUpdated($user->fresh()));

        return response()->json(['message' => 'Status diperbarui.', 'status' => $data['status']]);
    }

    /**
     * Heartbeat berkala dari PWA untuk menandakan karyawan masih online.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['last_seen_at' => Carbon::now()]);

        return response()->json(['ok' => true, 'server_time' => Carbon::now()->toIso8601String()]);
    }

    /**
     * Timeline aktivitas hari ini + ringkasan durasi per status.
     */
    public function timeline(Request $request): JsonResponse
    {
        $logs = ActivityLog::where('user_id', $request->user()->id)
            ->whereDate('started_at', Carbon::today())
            ->orderBy('started_at')
            ->get();

        $summary = $logs->groupBy('status')->map(
            fn ($group) => $group->sum('duration_seconds')
        );

        return response()->json([
            'logs' => $logs,
            'summary_seconds' => $summary,
        ]);
    }
}
