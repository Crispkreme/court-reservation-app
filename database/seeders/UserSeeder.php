<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'admin@courtreserve.test',
            ],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password123'),
            ]
        );

        User::updateOrCreate(
            [
                'email' => 'user@courtreserve.test',
            ],
            [
                'name' => 'Test Customer',
                'password' => Hash::make('password123'),
            ]
        );
    }
}