<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Court;
use App\Models\CourtSchedule;
use Carbon\CarbonImmutable;

class CourtScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $today = CarbonImmutable::now(Court::TIME_ZONE)
            ->startOfDay();

        $courts = Court::all();

        foreach ($courts as $court) {
            if (!$court->hasValidOperatingHours()) {
                continue;
            }

            for ($i = 0; $i < 14; $i++) {
                $date = $today->addDays($i)->toDateString();

                CourtSchedule::firstOrCreate(
                    [
                        'court_id' => $court->id,
                        'date' => $date,
                    ],
                    [
                        'opening_time' => null,
                        'closing_time' => null,
                        'status' => CourtSchedule::STATUS_OPEN,
                        'notes' => null,
                    ]
                );
            }
        }
    }
}