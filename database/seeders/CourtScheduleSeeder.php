<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\CourtSchedule;
use Illuminate\Database\Seeder;

class CourtScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $courts = Court::query()
            ->orderBy('id')
            ->get();

        if ($courts->isEmpty()) {
            $this->command->warn(
                'No courts found. Please seed courts first.'
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Default weekly schedule
        |--------------------------------------------------------------------------
        |
        | Monday - Friday:
        | 08:00 AM - 10:00 PM
        |
        | Saturday - Sunday:
        | 07:00 AM - 10:00 PM
        |
        */

        foreach ($courts as $court) {

            // Monday - Friday
            for ($day = 1; $day <= 5; $day++) {
                CourtSchedule::updateOrCreate(
                    [
                        'court_id' => $court->id,
                        'day_of_week' => $day,
                        'start_time' => '08:00:00',
                        'end_time' => '22:00:00',
                    ],
                    [
                        'status' => 'available',
                        'start_date' => null,
                        'end_date' => null,
                        'is_active' => true,
                        'notes' => 'Regular weekday operating hours.',
                    ]
                );
            }

            // Saturday
            CourtSchedule::updateOrCreate(
                [
                    'court_id' => $court->id,
                    'day_of_week' => 6,
                    'start_time' => '07:00:00',
                    'end_time' => '22:00:00',
                ],
                [
                    'status' => 'available',
                    'start_date' => null,
                    'end_date' => null,
                    'is_active' => true,
                    'notes' => 'Regular Saturday operating hours.',
                ]
            );

            // Sunday
            CourtSchedule::updateOrCreate(
                [
                    'court_id' => $court->id,
                    'day_of_week' => 0,
                    'start_time' => '07:00:00',
                    'end_time' => '20:00:00',
                ],
                [
                    'status' => 'available',
                    'start_date' => null,
                    'end_date' => null,
                    'is_active' => true,
                    'notes' => 'Regular Sunday operating hours.',
                ]
            );
        }

        $this->command->info(
            'Court schedules seeded successfully.'
        );
    }
}