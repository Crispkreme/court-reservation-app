<?php

namespace Database\Factories;

use App\Models\Court;
use App\Models\CourtSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourtScheduleFactory extends Factory
{
    protected $model = CourtSchedule::class;

    public function definition(): array
    {
        return [
            'court_id' => Court::factory(),

            'day_of_week' => fake()->numberBetween(0, 6),

            'start_time' => '08:00',

            'end_time' => '22:00',

            'status' => 'available',

            'start_date' => null,

            'end_date' => null,

            'is_active' => true,

            'notes' => null,
        ];
    }
}