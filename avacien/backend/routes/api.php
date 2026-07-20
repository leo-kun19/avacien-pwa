<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FaceController;
use App\Http\Controllers\Api\ManagerController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// --- Publik ---
Route::post('/login', [AuthController::class, 'login']);

// --- Terautentikasi (Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Edit profil sendiri
    Route::put('/profile', [ProfileController::class, 'update']);

    // Enrollment & status wajah
    Route::post('/face/enroll', [FaceController::class, 'enroll']);
    Route::get('/face/status', [FaceController::class, 'status']);

    // Absensi (face + geofence)
    Route::prefix('attendance')->group(function () {
        Route::get('/today', [AttendanceController::class, 'today']);
        Route::get('/history', [AttendanceController::class, 'history']);
        Route::post('/check-in', [AttendanceController::class, 'checkIn']);
        Route::post('/check-out', [AttendanceController::class, 'checkOut']);
    });

    // Keaktifan / heartbeat
    Route::prefix('activity')->group(function () {
        Route::post('/status', [ActivityController::class, 'setStatus']);
        Route::post('/heartbeat', [ActivityController::class, 'heartbeat']);
        Route::get('/timeline', [ActivityController::class, 'timeline']);
    });

    // Tugas tambahan (karyawan)
    Route::prefix('tasks')->group(function () {
        Route::get('/', [TaskController::class, 'index']);
        Route::post('/{task}/claim', [TaskController::class, 'claim']);
        Route::post('/{task}/submit', [TaskController::class, 'submit']);
    });

    // Notifikasi
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/{notification}/read', [NotificationController::class, 'markRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllRead']);
    });

    // --- Khusus manajer (dashboard) ---
    Route::middleware('manager')->prefix('manager')->group(function () {
        Route::get('/overview', [ManagerController::class, 'overview']);
        Route::get('/monitoring', [ManagerController::class, 'monitoring']);
        Route::get('/reports/attendance', [ManagerController::class, 'attendanceReport']);
        Route::get('/employees/{user}/activity', [ManagerController::class, 'employeeActivity']);
        Route::post('/tasks', [ManagerController::class, 'storeTask']);
        Route::get('/tasks', [ManagerController::class, 'listTasks']);
        Route::post('/claims/{claim}/review', [ManagerController::class, 'reviewClaim']);

        // Manajemen karyawan
        Route::get('/employees', [ManagerController::class, 'listEmployees']);
        Route::post('/employees', [ManagerController::class, 'storeEmployee']);
        Route::put('/employees/{user}', [ManagerController::class, 'updateEmployee']);
    });
});
