<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\SportCategory;
use Illuminate\Database\Seeder;

class CourtSeeder extends Seeder
{
    public function run(): void
    {
        $basketball = SportCategory::where('slug', 'basketball')->firstOrFail();
        $badminton = SportCategory::where('slug', 'badminton')->firstOrFail();
        $tennis = SportCategory::where('slug', 'tennis')->firstOrFail();
        $volleyball = SportCategory::where('slug', 'volleyball')->firstOrFail();
        $pickleball = SportCategory::where('slug', 'pickleball')->firstOrFail();

        $courts = [
            [
                'name' => 'Basketball Court 1',
                'court_number' => 'B01',
                'sport_category_id' => $basketball->id,
                'branch' => 'Main Branch',
                'location' => 'Indoor Sports Hall',
                'min_players' => 2,
                'max_players' => 10,
                'status' => 'available',
                'opening_time' => '08:00:00',
                'closing_time' => '22:00:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 120,
                'base_price' => 500.00,
                'currency' => 'PHP',
                'description' => 'Full-size indoor basketball court suitable for recreational and competitive games.',
                'is_active' => true,
            ],

            [
                'name' => 'Basketball Court 2',
                'court_number' => 'B02',
                'sport_category_id' => $basketball->id,
                'branch' => 'Main Branch',
                'location' => 'Indoor Sports Hall',
                'min_players' => 2,
                'max_players' => 10,
                'status' => 'available',
                'opening_time' => '08:00:00',
                'closing_time' => '22:00:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 120,
                'base_price' => 500.00,
                'currency' => 'PHP',
                'description' => 'Full-size indoor basketball court.',
                'is_active' => true,
            ],

            [
                'name' => 'Badminton Court 1',
                'court_number' => 'BD01',
                'sport_category_id' => $badminton->id,
                'branch' => 'Main Branch',
                'location' => 'Badminton Hall',
                'min_players' => 2,
                'max_players' => 4,
                'status' => 'available',
                'opening_time' => '08:00:00',
                'closing_time' => '21:00:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 120,
                'base_price' => 200.00,
                'currency' => 'PHP',
                'description' => 'Indoor badminton court with professional flooring.',
                'is_active' => true,
            ],

            [
                'name' => 'Badminton Court 2',
                'court_number' => 'BD02',
                'sport_category_id' => $badminton->id,
                'branch' => 'Main Branch',
                'location' => 'Badminton Hall',
                'min_players' => 2,
                'max_players' => 4,
                'status' => 'maintenance',
                'opening_time' => '08:00:00',
                'closing_time' => '21:00:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 120,
                'base_price' => 200.00,
                'currency' => 'PHP',
                'description' => 'Badminton court currently undergoing maintenance.',
                'is_active' => true,
            ],

            [
                'name' => 'Tennis Court 1',
                'court_number' => 'T01',
                'sport_category_id' => $tennis->id,
                'branch' => 'Sports Complex',
                'location' => 'Outdoor Tennis Area',
                'min_players' => 2,
                'max_players' => 4,
                'status' => 'available',
                'opening_time' => '07:00:00',
                'closing_time' => '22:00:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 60,
                'maximum_booking_duration' => 180,
                'base_price' => 400.00,
                'currency' => 'PHP',
                'description' => 'Outdoor tennis court for singles and doubles matches.',
                'is_active' => true,
            ],

            [
                'name' => 'Volleyball Court 1',
                'court_number' => 'V01',
                'sport_category_id' => $volleyball->id,
                'branch' => 'Sports Complex',
                'location' => 'Volleyball Hall',
                'min_players' => 4,
                'max_players' => 12,
                'status' => 'available',
                'opening_time' => '08:00:00',
                'closing_time' => '22:00:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 60,
                'maximum_booking_duration' => 120,
                'base_price' => 400.00,
                'currency' => 'PHP',
                'description' => 'Volleyball court suitable for recreational and competitive games.',
                'is_active' => true,
            ],

            [
                'name' => 'Pickleball Court 1',
                'court_number' => 'P01',
                'sport_category_id' => $pickleball->id,
                'branch' => 'Sports Complex',
                'location' => 'Outdoor Court Area',
                'min_players' => 2,
                'max_players' => 4,
                'status' => 'closed',
                'opening_time' => '08:00:00',
                'closing_time' => '20:00:00',
                'booking_interval' => 30,
                'minimum_booking_duration' => 30,
                'maximum_booking_duration' => 120,
                'base_price' => 250.00,
                'currency' => 'PHP',
                'description' => 'Pickleball court currently closed.',
                'is_active' => false,
            ],
        ];

        foreach ($courts as $court) {
            Court::updateOrCreate(
                [
                    'court_number' => $court['court_number'],
                ],
                $court
            );
        }
    }
}