<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $user->update($data);

        return response()->json([
            'message' => 'Profil diperbarui.',
            'user'    => [
                'id'              => $user->id,
                'name'            => $user->name,
                'email'           => $user->email,
                'role'            => $user->role,
                'division'        => $user->division,
                'position'        => $user->position,
                'employee_id'     => $user->employee_id,
                'face_enrolled'   => $user->face_enrolled,
                'activity_status' => $user->activity_status,
            ],
        ]);
    }
}
