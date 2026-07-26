<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Tanggal kerja (WIB) untuk memudahkan rekap harian
            $table->date('work_date');

            // Check-in
            $table->timestamp('check_in_at')->nullable();
            $table->decimal('check_in_lat', 10, 7)->nullable();
            $table->decimal('check_in_lng', 10, 7)->nullable();
            $table->float('check_in_face_score')->nullable();
            $table->string('check_in_photo_path')->nullable();

            // Check-out
            $table->timestamp('check_out_at')->nullable();
            $table->decimal('check_out_lat', 10, 7)->nullable();
            $table->decimal('check_out_lng', 10, 7)->nullable();
            $table->float('check_out_face_score')->nullable();
            $table->string('check_out_photo_path')->nullable();

            // Status kehadiran: on_time, late, absent
            $table->enum('status', ['on_time', 'late', 'absent'])->default('on_time');
            $table->unsignedInteger('late_minutes')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'work_date']);
            $table->index('work_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
