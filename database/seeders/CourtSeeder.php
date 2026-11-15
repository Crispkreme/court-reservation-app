<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\SportCategory;
use Illuminate\Database\Seeder;

class CourtSeeder extends Seeder
{
    public function run(): void
    {
        $courts = [
            [
                'name' => 'Basketball Court 1',
                'sport' => 'Basketball',
                'location' => 'Building A - Ground Floor',
                'court_type' => 'indoor',
                'min_players' => 2,
                'max_players' => 10,
                'price_per_hour' => 150.00,
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'status' => Court::STATUS_AVAILABLE,
            ],
            [
                'name' => 'Basketball Court 2',
                'sport' => 'Basketball',
                'location' => 'Building A - Ground Floor',
                'court_type' => 'indoor',
                'min_players' => 2,
                'max_players' => 10,
                'price_per_hour' => 150.00,
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'status' => Court::STATUS_AVAILABLE,
            ],
            [
                'name' => 'Basketball Outdoor Court',
                'sport' => 'Basketball',
                'location' => 'Outdoor Zone A',
                'court_type' => 'outdoor',
                'min_players' => 2,
                'max_players' => 10,
                'price_per_hour' => 100.00,
                'opening_time' => '06:00',
                'closing_time' => '21:00',
                'status' => Court::STATUS_MAINTENANCE,
            ],
            [
                'name' => 'Badminton Court 1',
                'sport' => 'Badminton',
                'location' => 'Building B - Sports Hall',
                'court_type' => 'indoor',
                'min_players' => 2,
                'max_players' => 4,
                'price_per_hour' => 60.00,
                'opening_time' => '07:00',
                'closing_time' => '23:00',
                'status' => Court::STATUS_AVAILABLE,
            ],
            [
                'name' => 'Badminton Court 2',
                'sport' => 'Badminton',
                'location' => 'Building B - Sports Hall',
                'court_type' => 'indoor',
                'min_players' => 2,
                'max_players' => 4,
                'price_per_hour' => 60.00,
                'opening_time' => '07:00',
                'closing_time' => '23:00',
                'status' => Court::STATUS_AVAILABLE,
            ],
            [
                'name' => 'Badminton Court 3',
                'sport' => 'Badminton',
                'location' => 'Building B - Sports Hall',
                'court_type' => 'indoor',
                'min_players' => 2,
                'max_players' => 4,
                'price_per_hour' => 65.00,
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'status' => Court::STATUS_CLOSED,
            ],
            [
                'name' => 'Tennis Court 1',
                'sport' => 'Tennis',
                'location' => 'Outdoor Zone B',
                'court_type' => 'outdoor',
                'min_players' => 2,
                'max_players' => 4,
                'price_per_hour' => 120.00,
                'opening_time' => '06:00',
                'closing_time' => '22:00',
                'status' => Court::STATUS_AVAILABLE,
            ],
            [
                'name' => 'Tennis Court 2',
                'sport' => 'Tennis',
                'location' => 'Outdoor Zone B',
                'court_type' => 'outdoor',
                'min_players' => 2,
                'max_players' => 4,
                'price_per_hour' => 120.00,
                'opening_time' => '06:00',
                'closing_time' => '22:00',
                'status' => Court::STATUS_AVAILABLE,
            ],
            [
                'name' => 'Football Field 1',
                'sport' => 'Football',
                'location' => 'Outdoor Zone C',
                'court_type' => 'outdoor',
                'min_players' => 10,
                'max_players' => 22,
                'price_per_hour' => 300.00,
                'opening_time' => '06:00',
                'closing_time' => '23:00',
                'status' => Court::STATUS_AVAILABLE,
            ],
            [
                'name' => 'Football Field 2',
                'sport' => 'Football',
                'location' => 'Outdoor Zone C',
                'court_type' => 'outdoor',
                'min_players' => 6,
                'max_players' => 14,
                'price_per_hour' => 250.00,
                'opening_time' => '07:00',
                'closing_time' => '22:00',
                'status' => Court::STATUS_MAINTENANCE,
            ],
            [
                'name' => 'Volleyball Court 1',
                'sport' => 'Volleyball',
                'location' => 'Building C - Sports Hall',
                'court_type' => 'indoor',
                'min_players' => 6,
                'max_players' => 12,
                'price_per_hour' => 100.00,
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'status' => Court::STATUS_AVAILABLE,
            ],
            [
                'name' => 'Volleyball Court 2',
                'sport' => 'Volleyball',
                'location' => 'Outdoor Zone D',
                'court_type' => 'outdoor',
                'min_players' => 6,
                'max_players' => 12,
                'price_per_hour' => 80.00,
                'opening_time' => '06:00',
                'closing_time' => '20:00',
                'status' => Court::STATUS_TEMPORARILY_BLOCKED,
            ],
        ];

        foreach ($courts as $data) {
            $sport = SportCategory::where('name', $data['sport'])
                ->where('status', 'active')
                ->first();

            if (!$sport) {
                $this->command?->warn(
                    "Skipping {$data['name']}: active sport category '{$data['sport']}' not found."
                );

                continue;
            }

            Court::updateOrCreate(
                [
                    'name' => $data['name'],
                ],
                [
                    'sport_category_id' => $sport->id,
                    'description' => "CourtBook {$data['sport']} facility.",
                    'location' => $data['location'],
                    'court_type' => $data['court_type'],
                    'min_players' => $data['min_players'],
                    'max_players' => $data['max_players'],
                    'price_per_hour' => $data['price_per_hour'],
                    'opening_time' => $data['opening_time'],
                    'closing_time' => $data['closing_time'],
                    'status' => $data['status'],
                ]
            );
        }

        $this->command?->info(
            'Court seeding completed successfully.'
        );
    }
}
