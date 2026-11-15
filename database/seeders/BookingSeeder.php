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
        $users = User::query()
            ->where('role', 'member')
            ->pluck('id');

        if ($users->isEmpty()) {
            return;
        }

        $courts = Court::query()
            ->where('status', Court::STATUS_AVAILABLE)
            ->with('maintenancePeriods')
            ->get();

        foreach ($courts as $court) {
            if (
                ! $court->hasValidOperatingHours() ||
                ! $court->hasValidBookingConfiguration()
            ) {
                continue;
            }

            $durations = $court->getAllowedBookingDurations();

            $openingTime = $court->opening_time;
            $closingTime = $court->closing_time;

            for ($day = -20; $day <= 10; $day++) {
                $date = Carbon::now(Court::TIME_ZONE)
                    ->startOfDay()
                    ->addDays($day);

                $opening = Carbon::parse(
                    $date->toDateString() . ' ' . $openingTime,
                    Court::TIME_ZONE
                );

                $closing = Carbon::parse(
                    $date->toDateString() . ' ' . $closingTime,
                    Court::TIME_ZONE
                );

                $cursor = $opening->copy();

                while ($cursor->lt($closing)) {
                    $duration = $durations[array_rand($durations)];

                    $end = $cursor->copy()->addMinutes($duration);

                    if ($end->gt($closing)) {
                        break;
                    }

                    $startUtc = $cursor->copy()->utc();
                    $endUtc = $end->copy()->utc();

                    $maintenanceOverlap = $court->maintenancePeriods
                        ->contains(function ($period) use (
                            $startUtc,
                            $endUtc
                        ) {
                            return $period->start_at->lt($endUtc)
                                && $period->end_at->gt($startUtc);
                        });

                    if ($maintenanceOverlap) {
                        $cursor->addMinutes(
                            $court->booking_interval_minutes
                        );

                        continue;
                    }

                    $bookingOverlap = Booking::query()
                        ->where('court_id', $court->id)
                        ->whereIn('status', [
                            Booking::STATUS_PENDING,
                            Booking::STATUS_CONFIRMED,
                            Booking::STATUS_COMPLETED,
                        ])
                        ->where('start_at', '<', $endUtc)
                        ->where('end_at', '>', $startUtc)
                        ->exists();

                    if ($bookingOverlap) {
                        $cursor->addMinutes(
                            $court->booking_interval_minutes
                        );

                        continue;
                    }

                    if (random_int(1, 100) <= 55) {
                        $status = $endUtc->isPast()
                            ? Booking::STATUS_COMPLETED
                            : Booking::STATUS_CONFIRMED;

                        Booking::firstOrCreate(
                            [
                                'court_id' => $court->id,
                                'start_at' => $startUtc->format('Y-m-d H:i:s'),
                                'end_at' => $endUtc->format('Y-m-d H:i:s'),
                            ],
                            [
                                'user_id' => $users->random(),
                                'duration_minutes' => $duration,
                                'total_price' => $court->calculateBookingPrice(
                                    $duration
                                ),
                                'status' => $status,
                            ]
                        );
                    }

                    $cursor->addMinutes(
                        $court->booking_interval_minutes
                    );
                }
            }
        }
    }
}
