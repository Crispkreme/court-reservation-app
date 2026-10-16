<?php

namespace Database\Seeders;

use App\Models\SportCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SportCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Basketball',
                'description' => 'Basketball courts for recreational and competitive games.',
                'is_active' => true,
            ],
            [
                'name' => 'Badminton',
                'description' => 'Indoor badminton courts.',
                'is_active' => true,
            ],
            [
                'name' => 'Tennis',
                'description' => 'Tennis courts for singles and doubles matches.',
                'is_active' => true,
            ],
            [
                'name' => 'Volleyball',
                'description' => 'Volleyball courts for recreational and competitive games.',
                'is_active' => true,
            ],
            [
                'name' => 'Pickleball',
                'description' => 'Pickleball courts for recreational and competitive games.',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            SportCategory::updateOrCreate(
                [
                    'slug' => Str::slug($category['name']),
                ],
                [
                    'name' => $category['name'],
                    'slug' => Str::slug($category['name']),
                    'description' => $category['description'],
                    'is_active' => $category['is_active'],
                ]
            );
        }
    }
}