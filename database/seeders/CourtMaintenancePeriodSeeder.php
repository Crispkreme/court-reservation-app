<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\CourtMaintenancePeriod;
use Illuminate\Database\Seeder;

class CourtMaintenancePeriodSeeder extends Seeder
{
    public function run(): void
    {
        $court = Court::where('court_number', 'BD02')->first();

        if (!$court) {
            return;
        }

        CourtMaintenancePeriod::updateOrCreate(
            [
                'court_id' => $court->id,
                'maintenance_date' => now()->addDay()->toDateString(),
                'start_time' => '08:00:00',
            ],
            [
                'end_time' => '12:00:00',
                'reason' => 'Court floor maintenance',
                'notes' => 'Scheduled maintenance and inspection of the badminton court floor.',
                'is_active' => true,
            ]
        );
    }
}