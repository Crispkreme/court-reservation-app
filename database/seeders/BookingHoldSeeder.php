<?php

namespace Database\Seeders;

use App\Models\BookingHold;
use App\Models\Court;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookingHoldSeeder extends Seeder
{
    public function run(): void
    {
        $courts = Court::query()
            ->where('is_active', true)
            ->get();

        if ($courts->isEmpty()) {
            $this->command->warn(
                'No active court found. Booking hold seeder skipped.'
            );

            return;
        }

        $statuses = [
            BookingHold::STATUS_ACTIVE,
            BookingHold::STATUS_EXPIRED,
            BookingHold::STATUS_CONVERTED,
            BookingHold::STATUS_FAILED,
        ];

        foreach ($statuses as $index => $status) {

            $court = $courts[$index % $courts->count()];

            // Give every hold a unique schedule.
            $start = now()
                ->addDay()
                ->setTime(14 + $index, 0, 0);
            $end = $start->copy()->addMinutes(60);
            $heldAt = now();
            $expiresAt = now()->addMinutes(10);

            // Adjust timestamps depending on status.
            if ($status === BookingHold::STATUS_EXPIRED) {
                $heldAt = now()->subMinutes(20);
                $expiresAt = now()->subMinutes(10);
            }

            if ($status === BookingHold::STATUS_CONVERTED) {
                $heldAt = now()->subMinutes(15);
                $expiresAt = now()->subMinutes(5);
            }

            if ($status === BookingHold::STATUS_FAILED) {
                $heldAt = now()->subMinutes(10);
                $expiresAt = now()->subMinutes(5);
            }

            BookingHold::create([
                'user_id' => null,
                'sport_category_id' => $court->sport_category_id,
                'court_id' => $court->id,
                'booking_id' => null,
                'hold_token' => (string) Str::uuid(),
                'active_slot_key' => $status === BookingHold::STATUS_ACTIVE
                    ? $court->id
                        . '|'
                        . $start->format('Y-m-d')
                        . '|'
                        . $start->format('H:i:s')
                        . '|'
                        . $end->format('H:i:s')
                    : null,
                'booking_date' => $start->format('Y-m-d'),
                'start_time' => $start->format('H:i:s'),
                'end_time' => $end->format('H:i:s'),
                'duration_minutes' => 60,
                'players_count' => max(1, (int) $court->min_players),
                'status' => $status,
                'hold_duration_minutes' => 10,
                'held_at' => $heldAt,
                'expires_at' => $expiresAt,
                'customer_name' => match ($status) {
                    BookingHold::STATUS_ACTIVE => 'Active Test Customer',
                    BookingHold::STATUS_EXPIRED => 'Expired Test Customer',
                    BookingHold::STATUS_CONVERTED => 'Converted Test Customer',
                    BookingHold::STATUS_FAILED => 'Failed Test Customer',
                    default => 'Test Customer',
                },
                'customer_email' => match ($status) {
                    BookingHold::STATUS_ACTIVE => 'active@example.com',
                    BookingHold::STATUS_EXPIRED => 'expired@example.com',
                    BookingHold::STATUS_CONVERTED => 'converted@example.com',
                    BookingHold::STATUS_FAILED => 'failed@example.com',
                    default => 'test@example.com',
                },
                'customer_phone' => '09123456789',
                'notes' => "Test booking hold for status: {$status}",
                'metadata' => [
                    'source' => 'SEEDER',
                    'test' => true,
                    'status' => $status,
                ],
            ]);

            $this->command->info(
                "Created {$status} booking hold successfully."
            );
        }

        $this->command->info(
            'All four booking hold statuses have been seeded!'
        );
    }
}
