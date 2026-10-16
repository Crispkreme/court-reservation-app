<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'court_id' => Court::factory(),

            'booking_reference' => 'BK-' . strtoupper(fake()->unique()->bothify('####??##')),

            'booking_date' => fake()
                ->dateTimeBetween('+1 day', '+30 days')
                ->format('Y-m-d'),

            'start_time' => '10:00',
            'end_time' => '11:00',

            'duration_minutes' => 60,
            'players_count' => 1,

            'status' => 'pending',

            'notes' => null,
        ];
    }
}