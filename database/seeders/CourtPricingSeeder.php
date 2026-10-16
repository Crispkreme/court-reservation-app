<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\CourtPricing;
use Illuminate\Database\Seeder;

class CourtPricingSeeder extends Seeder
{
    public function run(): void
    {
        $courts = Court::all();

        foreach ($courts as $court) {

            /*
             * Weekday pricing
             *
             * Monday = 1
             * Tuesday = 2
             * Wednesday = 3
             * Thursday = 4
             * Friday = 5
             */
            $weekdayPrice = $court->base_price;

            /*
             * Weekend pricing
             *
             * Saturday = 6
             * Sunday = 0
             */
            $weekendPrice = $court->base_price * 1.20;

            for ($day = 1; $day <= 5; $day++) {
                CourtPricing::updateOrCreate(
                    [
                        'court_id' => $court->id,
                        'pricing_type' => 'hourly',
                        'day_of_week' => $day,
                    ],
                    [
                        'price' => $weekdayPrice,
                        'start_time' => $court->opening_time,
                        'end_time' => $court->closing_time,
                        'effective_from' => now()->toDateString(),
                        'effective_until' => null,
                        'is_active' => true,
                    ]
                );
            }

            for ($day = 0; $day <= 6; $day += 6) {
                CourtPricing::updateOrCreate(
                    [
                        'court_id' => $court->id,
                        'pricing_type' => 'hourly',
                        'day_of_week' => $day,
                    ],
                    [
                        'price' => $weekendPrice,
                        'start_time' => $court->opening_time,
                        'end_time' => $court->closing_time,
                        'effective_from' => now()->toDateString(),
                        'effective_until' => null,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}