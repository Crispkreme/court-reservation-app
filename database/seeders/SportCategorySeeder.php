<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SportCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Basketball',
                'description' => 'Indoor and outdoor basketball courts for recreational and competitive games.',
                'status' => 'active',
            ],
            [
                'name' => 'Badminton',
                'description' => 'Indoor badminton courts for singles and doubles matches.',
                'status' => 'active',
            ],
            [
                'name' => 'Volleyball',
                'description' => 'Indoor and outdoor volleyball courts for team matches.',
                'status' => 'active',
            ],
            [
                'name' => 'Tennis',
                'description' => 'Tennis courts for singles and doubles matches.',
                'status' => 'active',
            ],
            [
                'name' => 'Futsal',
                'description' => 'Indoor and outdoor futsal courts for five-a-side football matches.',
                'status' => 'active',
            ],
            [
                'name' => 'Pickleball',
                'description' => 'Pickleball courts for singles and doubles games.',
                'status' => 'active',
            ],
            [
                'name' => 'Table Tennis',
                'description' => 'Table tennis facilities for recreational and competitive matches.',
                'status' => 'active',
            ],
            [
                'name' => 'Squash',
                'description' => 'Indoor squash courts for singles and doubles games.',
                'status' => 'active',
            ],
            [
                'name' => 'Padel',
                'description' => 'Enclosed padel courts for doubles and recreational matches.',
                'status' => 'active',
            ],
            [
                'name' => 'Football',
                'description' => 'Football fields and pitches for recreational and competitive matches.',
                'status' => 'active',
            ],
        ];

        foreach ($categories as $category) {
            DB::table('sport_categories')->updateOrInsert(
                ['name' => $category['name']],
                [
                    'description' => $category['description'],
                    'status' => $category['status'],
                    'updated_at' => now(),
                ] + [
                    'created_at' => now(),
                ]
            );
        }
    }
}