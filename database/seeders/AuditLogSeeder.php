<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->first();

        if (!$user) {
            return;
        }

        $logs = [
            [
                'module' => 'booking',
                'action' => 'created',
                'description' =>
                    'Booking was created.',
                'reason' => null,
                'old_values' => null,
                'new_values' => [
                    'status' => 'pending',
                    'duration_minutes' => 60,
                    'players_count' => 2,
                ],
            ],

            [
                'module' => 'booking',
                'action' => 'updated',
                'description' =>
                    'Booking status changed.',
                'reason' =>
                    'Payment confirmed.',
                'old_values' => [
                    'status' => 'pending',
                ],
                'new_values' => [
                    'status' => 'confirmed',
                ],
            ],

            [
                'module' => 'cancellation',
                'action' => 'cancelled',
                'description' =>
                    'Booking was cancelled.',
                'reason' =>
                    'Customer requested cancellation.',
                'old_values' => [
                    'status' => 'confirmed',
                ],
                'new_values' => [
                    'status' => 'cancelled',
                ],
            ],

            [
                'module' => 'rescheduling',
                'action' => 'rescheduled',
                'description' =>
                    'Booking was rescheduled.',
                'reason' =>
                    'Customer requested new schedule.',
                'old_values' => [
                    'booking_date' => '2026-09-27',
                    'start_time' => '18:00',
                ],
                'new_values' => [
                    'booking_date' => '2026-09-28',
                    'start_time' => '19:00',
                ],
            ],

            [
                'module' => 'payment',
                'action' => 'paid',
                'description' =>
                    'Payment was completed.',
                'reason' => null,
                'old_values' => [
                    'status' => 'pending',
                ],
                'new_values' => [
                    'status' => 'paid',
                    'amount' => 500,
                ],
            ],

            [
                'module' => 'refund',
                'action' => 'refunded',
                'description' =>
                    'Payment refund was processed.',
                'reason' =>
                    'Court closure.',
                'old_values' => [
                    'refunded_amount' => 0,
                ],
                'new_values' => [
                    'refunded_amount' => 500,
                ],
            ],

            [
                'module' => 'administration',
                'action' => 'updated',
                'description' =>
                    'Administrative booking override.',
                'reason' =>
                    'Administrator override.',
                'old_values' => [
                    'status' => 'pending',
                ],
                'new_values' => [
                    'status' => 'confirmed',
                ],
            ],

            [
                'module' => 'court_schedule',
                'action' => 'updated',
                'description' =>
                    'Court schedule was changed.',
                'reason' =>
                    'Operating hours update.',
                'old_values' => [
                    'start_time' => '08:00',
                    'end_time' => '22:00',
                ],
                'new_values' => [
                    'start_time' => '07:00',
                    'end_time' => '23:00',
                ],
            ],

            [
                'module' => 'court_blocking',
                'action' => 'blocked',
                'description' =>
                    'Court was blocked.',
                'reason' =>
                    'Maintenance.',
                'old_values' => [
                    'status' => 'available',
                ],
                'new_values' => [
                    'status' => 'blocked',
                ],
            ],

            [
                'module' => 'membership',
                'action' => 'updated',
                'description' =>
                    'Membership was renewed.',
                'reason' =>
                    'Membership renewal.',
                'old_values' => [
                    'status' => 'expired',
                ],
                'new_values' => [
                    'status' => 'active',
                ],
            ],
        ];

        foreach ($logs as $log) {
            AuditLog::create([
                'user_id' =>
                    $user->id,

                'module' =>
                    $log['module'],

                'action' =>
                    $log['action'],

                'description' =>
                    $log['description'],

                'reason' =>
                    $log['reason'],

                'old_values' =>
                    $log['old_values'],

                'new_values' =>
                    $log['new_values'],

                'ip_address' =>
                    '127.0.0.1',

                'user_agent' =>
                    'Seeder',

                'created_at' =>
                    now()->subMinutes(
                        rand(1, 300)
                    ),
            ]);
        }
    }
}