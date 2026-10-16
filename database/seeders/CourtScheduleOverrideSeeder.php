<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\CourtScheduleOverride;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CourtScheduleOverrideSeeder extends Seeder
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
        | Use future dates so the overrides can be tested
        | immediately in the calendar.
        |--------------------------------------------------------------------------
        */

        $baseDate = Carbon::today();

        /*
        |--------------------------------------------------------------------------
        | Court 1 - Maintenance
        |--------------------------------------------------------------------------
        */

        if ($courts->has(0)) {
            $court = $courts->get(0);

            CourtScheduleOverride::updateOrCreate(
                [
                    'court_id' => $court->id,
                    'date' => $baseDate
                        ->copy()
                        ->addDays(2)
                        ->toDateString(),
                    'start_time' => '08:00:00',
                    'end_time' => '12:00:00',
                ],
                [
                    'status' => 'maintenance',
                    'title' => 'Court Maintenance',
                    'reason' => 'Scheduled court maintenance.',
                    'is_active' => true,
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Court 1 - Blocked
        |--------------------------------------------------------------------------
        */

        if ($courts->has(0)) {
            $court = $courts->get(0);

            CourtScheduleOverride::updateOrCreate(
                [
                    'court_id' => $court->id,
                    'date' => $baseDate
                        ->copy()
                        ->addDays(5)
                        ->toDateString(),
                    'start_time' => '14:00:00',
                    'end_time' => '17:00:00',
                ],
                [
                    'status' => 'blocked',
                    'title' => 'Private Event',
                    'reason' => 'Court reserved for a private event.',
                    'is_active' => true,
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Court 2 - Closed
        |--------------------------------------------------------------------------
        */

        if ($courts->has(1)) {
            $court = $courts->get(1);

            CourtScheduleOverride::updateOrCreate(
                [
                    'court_id' => $court->id,
                    'date' => $baseDate
                        ->copy()
                        ->addDays(7)
                        ->toDateString(),
                    'start_time' => null,
                    'end_time' => null,
                ],
                [
                    'status' => 'closed',
                    'title' => 'Court Closed',
                    'reason' => 'Court closed for facility maintenance.',
                    'is_active' => true,
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Court 2 - Holiday
        |--------------------------------------------------------------------------
        */

        if ($courts->has(1)) {
            $court = $courts->get(1);

            CourtScheduleOverride::updateOrCreate(
                [
                    'court_id' => $court->id,
                    'date' => $baseDate
                        ->copy()
                        ->addDays(10)
                        ->toDateString(),
                    'start_time' => null,
                    'end_time' => null,
                ],
                [
                    'status' => 'holiday',
                    'title' => 'Special Holiday',
                    'reason' => 'Court closed for a special holiday.',
                    'is_active' => true,
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Court 3 - Special Available Hours
        |--------------------------------------------------------------------------
        */

        if ($courts->has(2)) {
            $court = $courts->get(2);

            CourtScheduleOverride::updateOrCreate(
                [
                    'court_id' => $court->id,
                    'date' => $baseDate
                        ->copy()
                        ->addDays(3)
                        ->toDateString(),
                    'start_time' => '10:00:00',
                    'end_time' => '18:00:00',
                ],
                [
                    'status' => 'available',
                    'title' => 'Special Operating Hours',
                    'reason' => 'Special schedule for this date.',
                    'is_active' => true,
                ]
            );
        }

        $this->command->info(
            'Court schedule overrides seeded successfully.'
        );
    }
}