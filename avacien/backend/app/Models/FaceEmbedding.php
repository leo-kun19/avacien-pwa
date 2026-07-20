<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FaceEmbedding extends Model
{
    protected $fillable = ['user_id', 'descriptor'];

    protected function casts(): array
    {
        return [
            // Vektor wajah disimpan terenkripsi sebagai array float
            'descriptor' => 'encrypted:array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
