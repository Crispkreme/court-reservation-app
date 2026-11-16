<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $courts = Court::query()
            ->where('status', Court::STATUS_AVAILABLE)
            ->get();

        $members = User::query()
            ->members()
            ->active()
            ->get();

        if ($courts->isEmpty() || $members->isEmpty()) {
            $this->command?->warn(
                'BookingSeeder requires available courts and active members.'
            );

            return;
        }

        $today = Carbon::today(Court::TIME_ZONE);
        $created = 0;

        foreach ($courts as $court) {
            if (
                ! $court->hasValidOperatingHours()
                || ! $court->hasValidBookingConfiguration()
            ) {
                continue;
            }

            $durations = $court->getAllowedBookingDurations();
            $duration = $durations[0] ?? null;

            if ($duration === null) {
                continue;
            }

            for ($dayOffset = -7; $dayOffset <= 7; $dayOffset++) {
                $date = $today->copy()->addDays($dayOffset);
                $schedule = $court->getEffectiveSchedule($date);

                if ($schedule['status'] !== Court::OPERATING_OPEN) {
                    continue;
                }

                $opening = Carbon::parse(
                    $date->toDateString() . ' ' . $schedule['opening_time'],
                    Court::TIME_ZONE
                );

                $closing = Carbon::parse(
                    $date->toDateString() . ' ' . $schedule['closing_time'],
                    Court::TIME_ZONE
                );

                $interval = (int) $court->booking_interval_minutes;

                $slots = [
                    0,
                    2,
                    4,
                ];

                foreach ($slots as $slotIndex) {
                    $start = $opening->copy()->addMinutes(
                        $slotIndex * $interval
                    );

                    $end = $start->copy()->addMinutes($duration);

                    if ($end->gt($closing)) {
                        continue;
                    }

                    $overlap = Booking::query()
                        ->forCourt($court->id)
                        ->active()
                        ->betweenDates($start, $end)
                        ->exists();

                    if ($overlap) {
                        continue;
                    }

                    $member = $members->random();

                    $status = match (true) {
                        $end->lte(Carbon::now(Court::TIME_ZONE)) =>
                            Booking::STATUS_COMPLETED,

                        default => [
                            Booking::STATUS_PENDING,
                            Booking::STATUS_CONFIRMED,
                        ][($dayOffset + $slotIndex + 21) % 2],
                    };

                    Booking::create([
                        'court_id' => $court->id,
                        'user_id' => $member->id,
                        'start_at' => $start,
                        'end_at' => $end,
                        'duration_minutes' => $duration,
                        'total_price' => $court->calculateBookingPrice(
                            $duration
                        ),
                        'status' => $status,
                    ]);

                    $created++;
                }
            }
        }

        $this->command?->info(
            "BookingSeeder created {$created} sample bookings."
        );
    }
}
