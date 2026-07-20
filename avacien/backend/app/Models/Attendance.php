<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'user_id', 'work_date',
        'check_in_at', 'check_in_lat', 'check_in_lng', 'check_in_face_score', 'check_in_photo_path',
        'check_out_at', 'check_out_lat', 'check_out_lng', 'check_out_face_score', 'check_out_photo_path',
        'status', 'late_minutes',
    ];

    protected function casts(): array
    {
        return [
            'work_date' => 'date',
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
            'check_in_lat' => 'float',
            'check_in_lng' => 'float',
            'check_out_lat' => 'float',
            'check_out_lng' => 'float',
            'check_in_face_score' => 'float',
            'check_out_face_score' => 'float',
            'late_minutes' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
