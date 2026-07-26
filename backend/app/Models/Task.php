<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    protected $fillable = [
        'created_by', 'title', 'description', 'division',
        'bonus_percent', 'deadline', 'status',
    ];

    protected function casts(): array
    {
        return [
            'bonus_percent' => 'float',
            'deadline' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function claims(): HasMany
    {
        return $this->hasMany(TaskClaim::class);
    }
}
