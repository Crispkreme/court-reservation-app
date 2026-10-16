<?php

namespace Database\Seeders;

use App\Models\MembershipTier;
use Illuminate\Database\Seeder;

class MembershipTierSeeder extends Seeder
{
    public function run(): void
    {
        MembershipTier::updateOrCreate(
            ['code' => 'STANDARD'],
            [
                'name' => 'Standard',
                'description' => 'Standard membership.',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        MembershipTier::updateOrCreate(
            ['code' => 'PREMIUM'],
            [
                'name' => 'Premium',
                'description' => 'Premium membership with extended booking privileges.',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        MembershipTier::updateOrCreate(
            ['code' => 'VIP'],
            [
                'name' => 'VIP',
                'description' => 'VIP membership with the highest booking privileges.',
                'is_active' => true,
                'sort_order' => 3,
            ]
        );
    }
}