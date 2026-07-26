<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskClaim;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TaskController extends Controller
{
    /**
     * Daftar tugas tambahan yang relevan untuk karyawan (divisi cocok / global).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $tasks = Task::where('status', 'open')
            ->where(function ($q) use ($user) {
                $q->whereNull('division')->orWhere('division', $user->division);
            })
            ->with(['claims' => fn ($q) => $q->where('user_id', $user->id)])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['tasks' => $tasks]);
    }

    /**
     * Karyawan mengambil (claim) sebuah tugas.
     */
    public function claim(Request $request, Task $task): JsonResponse
    {
        if ($task->status !== 'open') {
            return response()->json(['message' => 'Tugas sudah ditutup.'], 409);
        }

        $claim = TaskClaim::firstOrCreate(
            ['task_id' => $task->id, 'user_id' => $request->user()->id],
            ['status' => 'claimed'],
        );

        return response()->json(['message' => 'Tugas diambil.', 'claim' => $claim], 201);
    }

    /**
     * Karyawan submit hasil tugas.
     */
    public function submit(Request $request, Task $task): JsonResponse
    {
        $data = $request->validate([
            'submission_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $claim = TaskClaim::where('task_id', $task->id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $claim->update([
            'status' => 'submitted',
            'submission_note' => $data['submission_note'] ?? null,
            'submitted_at' => Carbon::now(),
        ]);

        return response()->json(['message' => 'Hasil tugas dikirim.', 'claim' => $claim]);
    }
}
