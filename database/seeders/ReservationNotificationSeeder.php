<?php

namespace Database\Seeders;

use App\Models\ReservationNotification;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ReservationNotificationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()
            ->limit(3)
            ->get();

        if ($users->isEmpty()) {
            return;
        }

        $notifications = [
            [
                'type' => 'booking_confirmation',
                'title' => 'Booking Confirmed',
                'message' => 'Your court booking has been confirmed successfully.',
                'channel' => 'in_app',
                'status' => 'delivered',
                'priority' => 'normal',
            ],
            [
                'type' => 'booking_reminder',
                'title' => 'Upcoming Court Booking',
                'message' => 'Reminder: your court booking is scheduled soon.',
                'channel' => 'push',
                'status' => 'pending',
                'priority' => 'high',
            ],
            [
                'type' => 'booking_cancellation',
                'title' => 'Booking Cancelled',
                'message' => 'Your court booking has been cancelled.',
                'channel' => 'email',
                'status' => 'sent',
                'priority' => 'high',
            ],
            [
                'type' => 'booking_rescheduling',
                'title' => 'Booking Rescheduled',
                'message' => 'Your court booking schedule has been changed.',
                'channel' => 'in_app',
                'status' => 'delivered',
                'priority' => 'normal',
            ],
            [
                'type' => 'payment_success',
                'title' => 'Payment Successful',
                'message' => 'Your payment has been received successfully.',
                'channel' => 'in_app',
                'status' => 'delivered',
                'priority' => 'normal',
            ],
            [
                'type' => 'payment_failure',
                'title' => 'Payment Failed',
                'message' => 'Your payment could not be processed. Please try again.',
                'channel' => 'email',
                'status' => 'failed',
                'priority' => 'high',
                'failure_reason' => 'Example payment gateway failure.',
            ],
            [
                'type' => 'refund_processed',
                'title' => 'Refund Processed',
                'message' => 'Your refund has been processed successfully.',
                'channel' => 'in_app',
                'status' => 'delivered',
                'priority' => 'normal',
            ],
            [
                'type' => 'waitlist_availability',
                'title' => 'Court Slot Available',
                'message' => 'A court slot you were waiting for is now available.',
                'channel' => 'push',
                'status' => 'sent',
                'priority' => 'high',
            ],
            [
                'type' => 'waitlist_promotion',
                'title' => 'Waitlist Promotion',
                'message' => 'You have been promoted from the waitlist.',
                'channel' => 'in_app',
                'status' => 'delivered',
                'priority' => 'high',
            ],
            [
                'type' => 'claim_expiration',
                'title' => 'Claim Expiring Soon',
                'message' => 'Your waitlist claim response window is about to expire.',
                'channel' => 'sms',
                'status' => 'pending',
                'priority' => 'urgent',
            ],
            [
                'type' => 'membership_expiration',
                'title' => 'Membership Expiring',
                'message' => 'Your membership will expire soon. Renew to continue receiving member benefits.',
                'channel' => 'email',
                'status' => 'queued',
                'priority' => 'high',
            ],
            [
                'type' => 'court_closure',
                'title' => 'Court Closure Notice',
                'message' => 'A court has been temporarily closed due to operational requirements.',
                'channel' => 'in_app',
                'status' => 'delivered',
                'priority' => 'urgent',
            ],
            [
                'type' => 'operational_closure',
                'title' => 'Operational Notice',
                'message' => 'Court operations have been temporarily adjusted.',
                'channel' => 'push',
                'status' => 'pending',
                'priority' => 'high',
            ],
        ];

        foreach ($notifications as $index => $data) {
            $user = $users[$index % $users->count()];

            ReservationNotification::create([
                'user_id' => $user->id,
                'type' => $data['type'],
                'title' => $data['title'],
                'message' => $data['message'],
                'channel' => $data['channel'],
                'status' => $data['status'],
                'priority' => $data['priority'],

                'data' => [
                    'source' => 'seeder',
                    'reference' => 'DEMO-' . ($index + 1),
                ],

                'scheduled_at' => now()->subMinutes($index * 10),
                'sent_at' => in_array($data['status'], [
                    'sent',
                    'delivered',
                    'read',
                ]) ? now()->subMinutes($index * 5) : null,

                'delivered_at' => in_array($data['status'], [
                    'delivered',
                    'read',
                ]) ? now()->subMinutes($index * 3) : null,

                'read_at' => $index % 4 === 0
                    ? now()->subMinutes($index)
                    : null,

                'failed_at' => $data['status'] === 'failed'
                    ? now()->subMinutes(10)
                    : null,

                'failure_reason' => $data['failure_reason'] ?? null,
            ]);
        }
    }
}