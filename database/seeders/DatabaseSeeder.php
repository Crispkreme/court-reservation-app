<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->call([
                UserSeeder::class,
                SportCategorySeeder::class,
                CourtSeeder::class,
                CourtMaintenancePeriodSeeder::class,
                BookingSeeder::class,
                CourtScheduleSeeder::class,
                CourtRecurringScheduleSeeder::class,
            ]);
        });
    }
}
