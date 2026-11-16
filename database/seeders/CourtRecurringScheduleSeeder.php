<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\CourtRecurringSchedule;
use Illuminate\Database\Seeder;

class CourtRecurringScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $courts = Court::all();

        foreach ($courts as $court) {
            $schedules = [
                [
                    'day_of_week' => 0,
                    'opening_time' => '08:00',
                    'closing_time' => '23:00',
                    'status' => 'open',
                    'notes' => 'Sunday operating hours',
                ],
                [
                    'day_of_week' => 1,
                    'opening_time' => '08:00',
                    'closing_time' => '22:00',
                    'status' => 'open',
                    'notes' => 'Monday operating hours',
                ],
                [
                    'day_of_week' => 2,
                    'opening_time' => '08:00',
                    'closing_time' => '22:00',
                    'status' => 'open',
                    'notes' => 'Tuesday operating hours',
                ],
                [
                    'day_of_week' => 3,
                    'opening_time' => '08:00',
                    'closing_time' => '22:00',
                    'status' => 'open',
                    'notes' => 'Wednesday operating hours',
                ],
                [
                    'day_of_week' => 4,
                    'opening_time' => '08:00',
                    'closing_time' => '22:00',
                    'status' => 'open',
                    'notes' => 'Thursday operating hours',
                ],
                [
                    'day_of_week' => 5,
                    'opening_time' => '08:00',
                    'closing_time' => '23:00',
                    'status' => 'open',
                    'notes' => 'Friday operating hours',
                ],
                [
                    'day_of_week' => 6,
                    'opening_time' => '08:00',
                    'closing_time' => '23:00',
                    'status' => 'open',
                    'notes' => 'Saturday operating hours',
                ],
            ];

            foreach ($schedules as $schedule) {
                CourtRecurringSchedule::updateOrCreate(
                    [
                        'court_id' => $court->id,
                        'day_of_week' => $schedule['day_of_week'],
                        'effective_from' => '2026-11-01',
                    ],
                    [
                        'opening_time' => $schedule['opening_time'],
                        'closing_time' => $schedule['closing_time'],
                        'status' => $schedule['status'],
                        'effective_until' => null,
                        'is_active' => true,
                        'notes' => $schedule['notes'],
                    ]
                );
            }
        }
    }
}
