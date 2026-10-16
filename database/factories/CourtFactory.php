<?php

namespace Database\Factories;

use App\Models\Court;
use App\Models\SportCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourtFactory extends Factory
{
    protected $model = Court::class;

    public function definition(): array
    {
        $courtNumber = fake()->unique()->numberBetween(1, 20);

        return [
            'sport_category_id' => SportCategory::factory(),

            'name' => 'Court ' . $courtNumber,

            'court_number' => (string) $courtNumber,

            'branch' => fake()->randomElement([
                'Main Branch',
                'Downtown Branch',
                'North Branch',
            ]),

            'location' => fake()->randomElement([
                'Ground Floor',
                'Second Floor',
                'Outdoor Area',
            ]),

            'min_players' => 1,

            'max_players' => 6,

            'status' => 'available',

            'capacity' => 6,

            'opening_time' => '08:00:00',

            'closing_time' => '22:00:00',

            'booking_interval' => 30,

            'minimum_booking_duration' => 30,

            'maximum_booking_duration' => 180,

            'base_price' => 500.00,

            'currency' => 'PHP',

            'description' => fake()->sentence(),

            'is_active' => true,
        ];
    }
}