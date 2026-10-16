<?php

namespace Database\Factories;

use App\Models\Court;
use App\Models\CourtScheduleOverride;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourtScheduleOverride>
 */
class CourtScheduleOverrideFactory extends Factory
{
    protected $model = CourtScheduleOverride::class;

    public function definition(): array
    {
        return [
            'court_id' => Court::factory(),
            'date' => fake()->dateTimeBetween('+1 day', '+30 days')->format('Y-m-d'),
            'start_time' => '08:00',
            'end_time' => '22:00',
            'status' => fake()->randomElement([
                'available',
                'blocked',
                'maintenance',
                'closed',
            ]),
            'title' => fake()->sentence(3),
            'reason' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}