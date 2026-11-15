<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\CourtMaintenancePeriod;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CourtMaintenancePeriodSeeder extends Seeder
{
    public function run(): void
    {
        $timezone = Court::TIME_ZONE;

        $maintenancePeriods = [
            [
                'court' => 'Basketball Outdoor Court',
                'start_at' => Carbon::today($timezone)->addDay()->setTime(8, 0),
                'end_at' => Carbon::today($timezone)->addDay()->setTime(12, 0),
                'reason' => 'Court surface cleaning and maintenance.',
            ],
            [
                'court' => 'Football Field 2',
                'start_at' => Carbon::today($timezone)->addDays(2)->setTime(9, 0),
                'end_at' => Carbon::today($timezone)->addDays(2)->setTime(17, 0),
                'reason' => 'Grass maintenance and field inspection.',
            ],
            [
                'court' => 'Basketball Court 1',
                'start_at' => Carbon::today($timezone)->addDays(3)->setTime(10, 0),
                'end_at' => Carbon::today($timezone)->addDays(3)->setTime(13, 0),
                'reason' => 'Basketball hoop and flooring inspection.',
            ],
            [
                'court' => 'Badminton Court 1',
                'start_at' => Carbon::today($timezone)->addDays(4)->setTime(8, 0),
                'end_at' => Carbon::today($timezone)->addDays(4)->setTime(11, 0),
                'reason' => 'Net replacement and lighting inspection.',
            ],
            [
                'court' => 'Tennis Court 1',
                'start_at' => Carbon::today($timezone)->addDays(5)->setTime(7, 0),
                'end_at' => Carbon::today($timezone)->addDays(5)->setTime(12, 0),
                'reason' => 'Court resurfacing and line maintenance.',
            ],
            [
                'court' => 'Volleyball Court 1',
                'start_at' => Carbon::today($timezone)->addDays(6)->setTime(9, 0),
                'end_at' => Carbon::today($timezone)->addDays(6)->setTime(11, 0),
                'reason' => 'Equipment inspection and net adjustment.',
            ],
        ];

        foreach ($maintenancePeriods as $data) {
            $court = Court::where('name', $data['court'])->first();

            if (! $court) {
                $this->command?->warn(
                    "Skipping maintenance: {$data['court']} not found."
                );

                continue;
            }

            CourtMaintenancePeriod::updateOrCreate(
                [
                    'court_id' => $court->id,
                    'start_at' => $data['start_at']->copy()->utc(),
                ],
                [
                    'end_at' => $data['end_at']->copy()->utc(),
                    'reason' => $data['reason'],
                ]
            );
        }

        $this->command?->info(
            'Court maintenance periods seeded successfully.'
        );
    }
}