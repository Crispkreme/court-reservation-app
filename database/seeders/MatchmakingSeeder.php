<?php

namespace Database\Seeders;

use App\Models\MatchmakingRequest;
use App\Models\Booking;
use App\Models\SportCategory;
use App\Models\User;
use Illuminate\Database\Seeder;

class MatchmakingSeeder extends Seeder
{
    public function run(): void
    {
        $booking = Booking::query()
            ->with('sportCategory')
            ->first();

        if (!$booking) {
            return;
        }

        $user = User::query()->first();

        if (
            MatchmakingRequest::query()
                ->where('booking_id', $booking->id)
                ->exists()
        ) {
            return;
        }

        MatchmakingRequest::create([
            'booking_id' => $booking->id,
            'requested_by' => $user?->id,
            'sport_category_id' =>
                $booking->sport_category_id,
            'preferred_date' =>
                $booking->booking_date,
            'preferred_start_time' =>
                substr($booking->start_time, 0, 5),
            'preferred_end_time' =>
                substr($booking->end_time, 0, 5),
            'required_players' => 1,
            'skill_level' => 'any',
            'location' => null,
            'availability' => null,
            'status' => 'OPEN',
            'notes' =>
                'Looking for an additional player.',
        ]);
    }
}