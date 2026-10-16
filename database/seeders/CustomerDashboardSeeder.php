<?php

namespace Database\Seeders;

use App\Models\CustomerDashboardSetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerDashboardSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()
            ->orderBy('id')
            ->limit(20)
            ->get();

        foreach ($users as $user) {
            CustomerDashboardSetting::updateOrCreate(
                [
                    'user_id' => $user->id,
                ],
                [
                    'show_upcoming_bookings' => true,
                    'show_today_bookings' => true,
                    'show_quick_book' => true,
                    'show_available_courts' => true,
                    'show_sports' => true,
                    'show_membership' => true,
                    'show_payment_balance' => true,
                    'show_notifications' => true,
                    'show_booking_history' => true,
                    'show_transaction_history' => true,

                    'default_view' => 'dashboard',
                    'default_booking_filter' => 'all',

                    'widget_order' => [
                        'upcoming_bookings',
                        'today_bookings',
                        'quick_book',
                        'available_courts',
                        'sports',
                        'membership',
                        'payment_balance',
                        'notifications',
                        'booking_history',
                        'transaction_history',
                    ],
                ]
            );
        }

        $this->command?->info(
            'Customer dashboard settings seeded successfully.'
        );
    }
}