<?php

namespace Database\Seeders;

use App\Models\BookingRule;
use App\Models\MembershipTier;
use Illuminate\Database\Seeder;

class BookingRuleSeeder extends Seeder
{
    public function run(): void
    {
        /*
         * ---------------------------------------------------------
         * STANDARD
         * ---------------------------------------------------------
         */

        $standard = MembershipTier::where(
            'code',
            'STANDARD'
        )->firstOrFail();

        BookingRule::updateOrCreate(
            [
                'name' => 'Standard Member Booking Limits',
            ],
            [
                'rule_type' => 'general',

                'membership_tier_id' => $standard->id,

                'max_bookings_per_day' => 3,

                'max_minutes_per_day' => 180,

                'max_future_bookings' => 5,

                'advance_booking_days' => 30,

                'priority' => 20,

                'is_active' => true,
            ]
        );

        /*
         * ---------------------------------------------------------
         * PREMIUM
         * ---------------------------------------------------------
         */

        $premium = MembershipTier::where(
            'code',
            'PREMIUM'
        )->firstOrFail();

        BookingRule::updateOrCreate(
            [
                'name' => 'Premium Member Booking Limits',
            ],
            [
                'rule_type' => 'general',

                'membership_tier_id' => $premium->id,

                'max_bookings_per_day' => 5,

                'max_minutes_per_day' => 300,

                'max_future_bookings' => 10,

                'advance_booking_days' => 60,

                'priority' => 20,

                'is_active' => true,
            ]
        );

        /*
         * ---------------------------------------------------------
         * VIP
         * ---------------------------------------------------------
         */

        $vip = MembershipTier::where(
            'code',
            'VIP'
        )->firstOrFail();

        BookingRule::updateOrCreate(
            [
                'name' => 'VIP Member Booking Limits',
            ],
            [
                'rule_type' => 'general',

                'membership_tier_id' => $vip->id,

                'max_bookings_per_day' => 8,

                'max_minutes_per_day' => 480,

                'max_future_bookings' => 15,

                'advance_booking_days' => 90,

                'priority' => 20,

                'is_active' => true,
            ]
        );

        /*
         * ---------------------------------------------------------
         * GENERAL TIME RESTRICTION
         * ---------------------------------------------------------
         */

        BookingRule::updateOrCreate(
            [
                'name' => 'General Court Operating Hours',
            ],
            [
                'rule_type' => 'general',

                'membership_tier_id' => null,

                'allowed_start_time' => '06:00',

                'allowed_end_time' => '22:00',

                'priority' => 10,

                'is_active' => true,
            ]
        );

        /*
         * ---------------------------------------------------------
         * TOURNAMENT
         * ---------------------------------------------------------
         */

        BookingRule::updateOrCreate(
            [
                'name' => 'Tournament Court Restriction',
            ],
            [
                'rule_type' => 'tournament',

                'event_name' => 'Tournament Court Reservation',

                'starts_at' => now()
                    ->addDays(30)
                    ->setTime(8, 0),

                'ends_at' => now()
                    ->addDays(30)
                    ->setTime(18, 0),

                'booking_blocked' => true,

                'priority' => 100,

                'is_active' => true,
            ]
        );
    }
}