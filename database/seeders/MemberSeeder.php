<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\Player;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $members = [
            [
                'member_number' => 'MEM-0001',
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'email' => 'juan@example.com',
                'phone' => '09171234567',
                'membership_start_date' => now()->startOfYear(),
                'membership_expiration_date' => now()->addYear(),
                'membership_status' => 'active',
            ],
            [
                'member_number' => 'MEM-0002',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'email' => 'maria@example.com',
                'phone' => '09181234567',
                'membership_start_date' => now()->startOfYear(),
                'membership_expiration_date' => now()->addYear(),
                'membership_status' => 'active',
            ],
        ];

        foreach ($members as $data) {
            $member = Member::create($data);

            Player::create([
                'member_id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'email' => $member->email,
                'phone' => $member->phone,
                'player_type' => 'RECREATIONAL',
                'skill_level' => 'INTERMEDIATE',
                'is_active' => true,
            ]);
        }
    }
}