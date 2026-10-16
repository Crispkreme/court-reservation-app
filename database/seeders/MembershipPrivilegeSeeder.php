<?php

namespace Database\Seeders;

use App\Models\MembershipPrivilege;
use App\Models\MembershipType;
use Illuminate\Database\Seeder;

class MembershipPrivilegeSeeder extends Seeder
{
    public function run(): void
    {
        $privileges = [
            'STANDARD' => [
                'priority_booking' => false,
                'booking_advance_days' => 7,
                'premium_courts' => false,
                'daily_booking_limit' => 3,
                'max_duration_minutes' => 90,
                'max_players' => null,
                'cancellation_window_hours' => 24,
                'free_cancellation' => true,
                'reschedule_window_hours' => 24,
                'free_rescheduling' => true,
                'notes' =>
                    'Standard membership privileges.',
                'is_active' => true,
            ],

            'PREMIUM' => [
                'priority_booking' => true,
                'booking_advance_days' => 14,
                'premium_courts' => true,
                'daily_booking_limit' => 5,
                'max_duration_minutes' => 120,
                'max_players' => null,
                'cancellation_window_hours' => 12,
                'free_cancellation' => true,
                'reschedule_window_hours' => 12,
                'free_rescheduling' => true,
                'notes' =>
                    'Premium membership privileges.',
                'is_active' => true,
            ],

            'VIP' => [
                'priority_booking' => true,
                'booking_advance_days' => 30,
                'premium_courts' => true,
                'daily_booking_limit' => 10,
                'max_duration_minutes' => 180,
                'max_players' => null,
                'cancellation_window_hours' => 6,
                'free_cancellation' => true,
                'reschedule_window_hours' => 6,
                'free_rescheduling' => true,
                'notes' =>
                    'VIP membership privileges.',
                'is_active' => true,
            ],
        ];

        foreach ($privileges as $code => $data) {
            $membershipType = MembershipType::query()
                ->where('code', $code)
                ->first();

            if (! $membershipType) {
                continue;
            }

            MembershipPrivilege::updateOrCreate(
                [
                    'membership_type_id' =>
                        $membershipType->id,
                ],
                $data
            );
        }
    }
}