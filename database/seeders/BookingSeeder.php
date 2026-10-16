<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Court;
use App\Models\SportCategory;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $sport = SportCategory::query()->first();

        if (!$sport) {
            $this->command->warn(
                'No sport categories found. Skipping BookingSeeder.'
            );

            return;
        }

        $court = Court::query()
            ->where(
                'sport_category_id',
                $sport->id
            )
            ->first();

        if (!$court) {
            $this->command->warn(
                'No courts found. Skipping BookingSeeder.'
            );

            return;
        }

        $date = Carbon::tomorrow();

        Booking::updateOrCreate(
            [
                'booking_reference' => 'BK-DEMO-0001',
            ],
            [
                'user_id' => null,

                'sport_category_id' =>
                    $sport->id,

                'court_id' =>
                    $court->id,

                'booking_date' =>
                    $date->format('Y-m-d'),

                'start_time' =>
                    '10:00:00',

                'end_time' =>
                    '11:00:00',

                'duration_minutes' =>
                    60,

                'players_count' =>
                    2,

                'unit_price' =>
                    $court->price_per_hour ?? 0,

                'total_amount' =>
                    $court->price_per_hour ?? 0,

                'booking_source' =>
                    'PUBLIC',

                'status' =>
                    'CONFIRMED',

                'membership_type' =>
                    null,

                'membership_required' =>
                    false,

                'customer_name' =>
                    'Demo Customer',

                'customer_email' =>
                    'demo@example.com',

                'customer_phone' =>
                    '09171234567',

                'notes' =>
                    'Demo booking',

                'confirmed_at' =>
                    now(),
            ]
        );
    }
}