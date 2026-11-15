<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed CourtBook users.
     */
    public function run(): void
    {
        $password = Hash::make('Test@12345');
        $users = [
            // ADMINISTRATOR
            [
                'name' => 'CourtBook Administrator',
                'email' => 'admin@courtbook.test',
                'phone' => null,
                'role' => 'admin',
                'status' => 'active',
            ],

            // MEMBERS / PLAYERS
            [
                'name' => 'Juan Dela Cruz',
                'email' => 'juan@courtbook.test',
                'phone' => '09123456789',
                'role' => 'member',
                'status' => 'active',
            ],
            [
                'name' => 'Maria Santos',
                'email' => 'maria@courtbook.test',
                'phone' => '09123456780',
                'role' => 'member',
                'status' => 'active',
            ],
            [
                'name' => 'John Reyes',
                'email' => 'john@courtbook.test',
                'phone' => '09123456781',
                'role' => 'member',
                'status' => 'active',
            ],
            [
                'name' => 'Anna Garcia',
                'email' => 'anna@courtbook.test',
                'phone' => '09123456782',
                'role' => 'member',
                'status' => 'active',
            ],
            [
                'name' => 'Daniel Lopez',
                'email' => 'daniel@courtbook.test',
                'phone' => '09123456783',
                'role' => 'member',
                'status' => 'active',
            ],
            [
                'name' => 'Jennifer Cruz',
                'email' => 'jennifer@courtbook.test',
                'phone' => '09123456784',
                'role' => 'member',
                'status' => 'active',
            ],
            [
                'name' => 'Mark Fernandez',
                'email' => 'mark@courtbook.test',
                'phone' => '09123456785',
                'role' => 'member',
                'status' => 'active',
            ],
            [
                'name' => 'Sarah Mendoza',
                'email' => 'sarah@courtbook.test',
                'phone' => '09123456786',
                'role' => 'member',
                'status' => 'active',
            ],
            [
                'name' => 'Kevin Ramos',
                'email' => 'kevin@courtbook.test',
                'phone' => '09123456787',
                'role' => 'member',
                'status' => 'inactive',
            ],
            [
                'name' => 'Aisha Mohammed',
                'email' => 'aisha@courtbook.test',
                'phone' => '09123456788',
                'role' => 'member',
                'status' => 'active',
            ],
        ];

        foreach ($users as $user) {
            $existingUser = User::where(
                'email',
                $user['email']
            )->first();

            if ($existingUser) {
                $existingUser->forceFill([
                    'name' => $user['name'],
                    'phone' => $user['phone'],
                    'role' => $user['role'],
                    'status' => $user['status'],
                ])->save();
            } else {
                User::create([
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'phone' => $user['phone'],
                    'password' => $password,
                ])->forceFill([
                    'role' => $user['role'],
                    'status' => $user['status'],
                ])->save();
            }
        }
    }
}
