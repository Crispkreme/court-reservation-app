<?php

namespace Database\Seeders;

use App\Models\AdminDashboardSetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminDashboardSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()
            ->orderBy('id')
            ->limit(20)
            ->get();

        foreach ($users as $user) {
            AdminDashboardSetting::updateOrCreate(
                [
                    'user_id' => $user->id,
                ],
                [
                    'show_daily_summary' => true,
                    'show_sport_summary' => true,
                    'show_court_utilization' => true,
                    'show_revenue' => true,
                    'show_booking_status' => true,
                    'show_outstanding_payments' => true,
                    'show_failed_transactions' => true,
                    'show_waitlist' => true,
                    'show_memberships' => true,
                    'show_upcoming_sessions' => true,
                    'show_court_status' => true,

                    'default_date_range' => 'today',

                    'widget_order' => [
                        'daily_summary',
                        'sport_summary',
                        'court_utilization',
                        'revenue',
                        'booking_status',
                        'outstanding_payments',
                        'failed_transactions',
                        'waitlist',
                        'memberships',
                        'upcoming_sessions',
                        'court_status',
                    ],
                ]
            );
        }

        $this->command?->info(
            'Admin dashboard settings seeded successfully.'
        );
    }
}