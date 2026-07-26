<?php

namespace Database\Seeders;

use App\Models\OfficeLocation;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Kantor demo (6°11'38.4"S 106°52'40.4"E) dengan radius 200m
        OfficeLocation::create([
            'name' => 'Kantor Pusat Avacien',
            'latitude' => -6.1940000,
            'longitude' => 106.8778889,
            'radius_meters' => 200,
            'is_active' => true,
        ]);

        // Manajer
        $manager = User::create([
            'employee_id' => 'MGR-001',
            'name' => 'Budi Manajer',
            'email' => 'manajer@avacien.test',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'division' => 'Management',
            'position' => 'HR Manager',
        ]);

        // Karyawan demo
        $divisions = ['Engineering', 'Marketing', 'Finance'];
        foreach (range(1, 6) as $i) {
            User::create([
                'employee_id' => sprintf('EMP-%03d', $i),
                'name' => "Karyawan $i",
                'email' => "karyawan$i@avacien.test",
                'password' => Hash::make('password'),
                'role' => 'employee',
                'division' => $divisions[($i - 1) % count($divisions)],
                'position' => 'Staff',
            ]);
        }

        // Tugas tambahan contoh
        Task::create([
            'created_by' => $manager->id,
            'title' => 'Bantu Migrasi Data Klien',
            'description' => 'Pindahkan data klien lama ke sistem baru sebelum akhir minggu.',
            'division' => 'Engineering',
            'bonus_percent' => 10.00,
            'deadline' => now()->addDays(5),
            'status' => 'open',
        ]);

        Task::create([
            'created_by' => $manager->id,
            'title' => 'Kampanye Media Sosial',
            'description' => 'Susun konten promosi untuk produk baru.',
            'division' => null, // semua divisi
            'bonus_percent' => 7.50,
            'deadline' => now()->addDays(10),
            'status' => 'open',
        ]);
    }
}
