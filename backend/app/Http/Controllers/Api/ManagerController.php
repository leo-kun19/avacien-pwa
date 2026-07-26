<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\Task;
use App\Models\TaskClaim;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ManagerController extends Controller
{
    /**
     * Ringkasan dashboard: jumlah hadir, terlambat, dan status keaktifan saat ini.
     */
    public function overview(Request $request): JsonResponse
    {
        $today = Carbon::today();
        $timeout = (int) config('avacien.heartbeat_timeout_seconds');
        $staleBefore = Carbon::now()->subSeconds($timeout);

        $totalEmployees = User::where('role', 'employee')->count();

        $todayAttendances = Attendance::whereDate('work_date', $today)->get();
        $present = $todayAttendances->whereNotNull('check_in_at')->count();
        $late = $todayAttendances->where('status', 'late')->count();

        // Karyawan dianggap aktif bila status active dan heartbeat masih segar
        $activeNow = User::where('role', 'employee')
            ->where('activity_status', 'active')
            ->where('last_seen_at', '>=', $staleBefore)
            ->count();

        return response()->json([
            'total_employees' => $totalEmployees,
            'present_today' => $present,
            'late_today' => $late,
            'absent_today' => max(0, $totalEmployees - $present),
            'active_now' => $activeNow,
        ]);
    }

    /**
     * Status keaktifan seluruh karyawan untuk papan monitoring real-time.
     */
    public function monitoring(Request $request): JsonResponse
    {
        $timeout = (int) config('avacien.heartbeat_timeout_seconds');
        $staleBefore = Carbon::now()->subSeconds($timeout);

        $employees = User::where('role', 'employee')
            ->orderBy('division')
            ->orderBy('name')
            ->get()
            ->map(function (User $u) use ($staleBefore) {
                // Jika heartbeat basi, paksa tampil sebagai inactive/offline
                $status = $u->activity_status;
                if ($u->last_seen_at === null || $u->last_seen_at->lessThan($staleBefore)) {
                    if ($status === 'active') {
                        $status = 'inactive';
                    }
                }

                return [
                    'user_id' => $u->id,
                    'name' => $u->name,
                    'division' => $u->division,
                    'activity_status' => $status,
                    'last_seen_at' => optional($u->last_seen_at)->toIso8601String(),
                ];
            });

        return response()->json(['employees' => $employees]);
    }

    /**
     * Rekap absensi untuk rentang tanggal (default bulan berjalan).
     */
    public function attendanceReport(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'division' => ['nullable', 'string'],
        ]);

        $from = isset($data['from']) ? Carbon::parse($data['from']) : Carbon::now()->startOfMonth();
        $to = isset($data['to']) ? Carbon::parse($data['to']) : Carbon::now()->endOfMonth();

        $query = Attendance::with('user')
            ->whereBetween('work_date', [$from->toDateString(), $to->toDateString()]);

        if (! empty($data['division'])) {
            $query->whereHas('user', fn ($q) => $q->where('division', $data['division']));
        }

        $rows = $query->orderByDesc('work_date')->get();

        return response()->json([
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'rows' => $rows,
        ]);
    }

    /**
     * Detail timeline keaktifan seorang karyawan pada tanggal tertentu.
     */
    public function employeeActivity(Request $request, User $user): JsonResponse
    {
        $date = $request->query('date')
            ? Carbon::parse($request->query('date'))
            : Carbon::today();

        $logs = ActivityLog::where('user_id', $user->id)
            ->whereDate('started_at', $date)
            ->orderBy('started_at')
            ->get();

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name, 'division' => $user->division],
            'date' => $date->toDateString(),
            'logs' => $logs,
            'summary_seconds' => $logs->groupBy('status')->map(fn ($g) => $g->sum('duration_seconds')),
        ]);
    }

    /**
     * Manajer membuat tugas tambahan dengan bonus transparan.
     */
    public function storeTask(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'division' => ['nullable', 'string', 'max:255'],
            'bonus_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'deadline' => ['nullable', 'date'],
        ]);

        $task = Task::create([
            ...$data,
            'created_by' => $request->user()->id,
            'status' => 'open',
        ]);

        return response()->json(['message' => 'Tugas dibuat.', 'task' => $task], 201);
    }

    /**
     * Review submission tugas: approve / reject.
     */
    public function reviewClaim(Request $request, TaskClaim $claim): JsonResponse
    {
        $data = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
        ]);

        $claim->update([
            'status' => $data['decision'],
            'reviewed_at' => Carbon::now(),
        ]);

        return response()->json(['message' => 'Review tersimpan.', 'claim' => $claim]);
    }

    /**
     * List semua tugas beserta pengambil (claims) + nama karyawan.
     */
    public function listTasks(Request $request): JsonResponse
    {
        $tasks = Task::with(['claims.user:id,name,division,employee_id'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['tasks' => $tasks]);
    }

    /**
     * List semua karyawan (role=employee).
     */
    public function listEmployees(Request $request): JsonResponse
    {
        $employees = User::where('role', 'employee')
            ->orderBy('division')
            ->orderBy('name')
            ->get(['id', 'employee_id', 'name', 'email', 'division', 'position', 'activity_status', 'face_enrolled', 'created_at']);

        return response()->json(['employees' => $employees]);
    }

    /**
     * Buat karyawan baru.
     */
    public function storeEmployee(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['nullable', 'string', 'max:50', 'unique:users,employee_id'],
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'unique:users,email'],
            'password'    => ['required', 'string', 'min:6'],
            'division'    => ['nullable', 'string', 'max:255'],
            'position'    => ['nullable', 'string', 'max:255'],
        ]);

        $data['password'] = bcrypt($data['password']);
        $data['role'] = 'employee';
        $user = User::create($data);

        return response()->json(['message' => 'Karyawan ditambahkan.', 'user' => $user], 201);
    }

    /**
     * Update data karyawan.
     */
    public function updateEmployee(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'employee_id' => ['nullable', 'string', 'max:50', 'unique:users,employee_id,' . $user->id],
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'unique:users,email,' . $user->id],
            'division'    => ['nullable', 'string', 'max:255'],
            'position'    => ['nullable', 'string', 'max:255'],
            'password'    => ['nullable', 'string', 'min:6'],
        ]);

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json(['message' => 'Data karyawan diperbarui.', 'user' => $user->fresh()]);
    }
}
