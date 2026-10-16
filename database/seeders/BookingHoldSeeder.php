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
        $court = Court::query()
            ->where('is_active', true)
            ->first();

        if (!$court) {
            $this->command->warn(
                'No active court found. Booking hold seeder skipped.'
            );

            return;
        }

        $sportCategoryId = $court->sport_category_id;

        $start = now()
            ->addDay()
            ->setTime(14, 0, 0);

        $end = $start
            ->copy()
            ->addMinutes(60);

        BookingHold::create([
            'user_id' => null,

            'sport_category_id' =>
                $sportCategoryId,

            'court_id' =>
                $court->id,

            'booking_id' =>
                null,

            'hold_token' =>
                (string) Str::uuid(),

            'active_slot_key' =>
                $court->id
                . '|'
                . $start->format('Y-m-d')
                . '|'
                . $start->format('H:i:s')
                . '|'
                . $end->format('H:i:s'),

            'booking_date' =>
                $start->format('Y-m-d'),

            'start_time' =>
                $start->format('H:i:s'),

            'end_time' =>
                $end->format('H:i:s'),

            'duration_minutes' =>
                60,

            'players_count' =>
                max(1, (int) $court->min_players),

            'status' =>
                BookingHold::STATUS_ACTIVE,

            'hold_duration_minutes' =>
                10,

            'held_at' =>
                now(),

            'expires_at' =>
                now()->addMinutes(10),

            'customer_name' =>
                'Test Customer',

            'customer_email' =>
                'test@example.com',

            'customer_phone' =>
                '09123456789',

            'notes' =>
                'Test booking hold created by BookingHoldSeeder.',

            'metadata' => [
                'source' => 'SEEDER',
                'test' => true,
            ],
        ]);

        $this->command->info(
            'Test booking hold created successfully.'
        );
    }
}