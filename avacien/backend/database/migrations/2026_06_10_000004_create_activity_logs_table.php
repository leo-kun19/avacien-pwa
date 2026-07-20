<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Perubahan status keaktifan dari PWA
            $table->enum('status', ['active', 'on_break', 'inactive', 'offline']);
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            // Durasi dalam detik (diisi saat status berikutnya masuk)
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'started_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
