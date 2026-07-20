<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FaceEmbedding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaceController extends Controller
{
    /**
     * Enroll / perbarui descriptor wajah karyawan.
     * Descriptor dihasilkan di sisi klien (face-api.js), 128 dimensi.
     */
    public function enroll(Request $request): JsonResponse
    {
        $data = $request->validate([
            'descriptor' => ['required', 'array', 'min:128', 'max:128'],
            'descriptor.*' => ['numeric'],
        ]);

        $user = $request->user();

        FaceEmbedding::updateOrCreate(
            ['user_id' => $user->id],
            ['descriptor' => array_map('floatval', $data['descriptor'])],
        );

        $user->update(['face_enrolled' => true]);

        return response()->json(['message' => 'Wajah berhasil didaftarkan.']);
    }

    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'face_enrolled' => (bool) $request->user()->face_enrolled,
        ]);
    }
}
