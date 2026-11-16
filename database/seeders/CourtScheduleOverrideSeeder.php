<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\CourtSchedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class CourtScheduleOverrideSeeder extends Seeder
{
    public function run(): void
    {
        $courts = Court::query()->get();

        if ($courts->isEmpty()) {
            $this->command?->warn('No courts found. Please seed courts first.');
            return;
        }

        $today = Carbon::now('Asia/Dubai')->startOfDay();

        $overrides = [
            [
                'days' => 2,
                'status' => CourtSchedule::STATUS_CLOSED,
                'opening_time' => null,
                'closing_time' => null,
                'notes' => 'Scheduled court maintenance.',
            ],
            [
                'days' => 5,
                'status' => CourtSchedule::STATUS_OPEN,
                'opening_time' => '10:00',
                'closing_time' => '18:00',
                'notes' => 'Special event operating hours.',
            ],
            [
                'days' => 10,
                'status' => CourtSchedule::STATUS_OPEN,
                'opening_time' => '07:00',
                'closing_time' => '23:00',
                'notes' => 'Extended operating hours.',
            ],
            [
                'days' => 15,
                'status' => CourtSchedule::STATUS_CLOSED,
                'opening_time' => null,
                'closing_time' => null,
                'notes' => 'Facility inspection and maintenance.',
            ],
            [
                'days' => 20,
                'status' => CourtSchedule::STATUS_OPEN,
                'opening_time' => '09:00',
                'closing_time' => '20:00',
                'notes' => 'Temporary operating hours adjustment.',
            ],
        ];

        $created = 0;

        foreach ($courts as $court) {
            foreach ($overrides as $override) {
                $date = $today->copy()
                    ->addDays($override['days'])
                    ->toDateString();

                $schedule = CourtSchedule::firstOrCreate(
                    [
                        'court_id' => $court->id,
                        'date' => $date,
                    ],
                    [
                        'status' => $override['status'],
                        'opening_time' => $override['opening_time'],
                        'closing_time' => $override['closing_time'],
                        'notes' => $override['notes'],
                    ]
                );

                if ($schedule->wasRecentlyCreated) {
                    $created++;
                }
            }
        }

        $this->command?->info(
            "Court schedule overrides seeded successfully. {$created} new records created."
        );
    }
}
