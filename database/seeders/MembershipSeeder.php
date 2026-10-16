<?php

namespace Database\Seeders;

use App\Models\MembershipType;
use Illuminate\Database\Seeder;

class MembershipSeeder extends Seeder
{
    public function run(): void
    {
        $memberships = [
            [
                'code' => 'STANDARD',
                'slug' => 'standard',
                'name' => 'Standard',
                'description' => 'Standard membership for regular court access.',
                'price' => 500,
                'discount_type' => 'percentage',
                'discount_value' => 5,
                'duration_days' => 30,
                'benefits' => [
                    '5% booking discount',
                    'Standard court access',
                    'Member booking history',
                ],
                'access_rules' => [
                    'booking_advance_days' => 7,
                    'priority_booking' => false,
                    'premium_courts' => false,
                ],
                'is_active' => true,
            ],

            [
                'code' => 'PREMIUM',
                'slug' => 'premium',
                'name' => 'Premium',
                'description' => 'Premium membership with enhanced court access and discounts.',
                'price' => 1000,
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'duration_days' => 30,
                'benefits' => [
                    '10% booking discount',
                    'Priority court booking',
                    'Premium court access',
                    'Member booking history',
                ],
                'access_rules' => [
                    'booking_advance_days' => 14,
                    'priority_booking' => true,
                    'premium_courts' => true,
                ],
                'is_active' => true,
            ],

            [
                'code' => 'VIP',
                'slug' => 'vip',
                'name' => 'VIP',
                'description' => 'VIP membership with maximum benefits and court access.',
                'price' => 2000,
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'duration_days' => 30,
                'benefits' => [
                    '15% booking discount',
                    'Priority court booking',
                    'Premium court access',
                    'Extended booking window',
                    'Member booking history',
                ],
                'access_rules' => [
                    'booking_advance_days' => 30,
                    'priority_booking' => true,
                    'premium_courts' => true,
                ],
                'is_active' => true,
            ],
        ];

        foreach ($memberships as $membership) {
            MembershipType::updateOrCreate(
                ['code' => $membership['code']],
                $membership
            );
        }
    }
}