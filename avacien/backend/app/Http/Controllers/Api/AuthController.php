<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login dan terbitkan token Sanctum.
     * Parameter device menentukan abilities token (employee vs manager app).
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device' => ['nullable', 'in:pwa,dashboard'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial tidak valid.'],
            ]);
        }

        $device = $data['device'] ?? 'pwa';

        // Dashboard hanya untuk manajer.
        if ($device === 'dashboard' && ! $user->isManager()) {
            throw ValidationException::withMessages([
                'email' => ['Akun ini tidak memiliki akses dashboard manajer.'],
            ]);
        }

        $abilities = $user->isManager() ? ['manager', 'employee'] : ['employee'];
        $token = $user->createToken($device, $abilities)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->userPayload($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'employee_id' => $user->employee_id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'division' => $user->division,
            'position' => $user->position,
            'activity_status' => $user->activity_status,
            'face_enrolled' => $user->face_enrolled,
        ];
    }
}
