<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\OutstandingPayment;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class OutstandingPaymentSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()
            ->orderBy('id')
            ->get();

        $bookings = Booking::query()
            ->orderBy('id')
            ->get();

        $transactions = Transaction::query()
            ->orderBy('id')
            ->get();

        if ($users->isEmpty()) {
            $this->command?->warn(
                'OutstandingPaymentSeeder skipped: no users found.'
            );

            return;
        }

        $records = [
            [
                'days_ago' => 3,
                'original' => 500,
                'paid' => 0,
                'status' => 'outstanding',
                'follow_up' => 'pending',
                'notes' => 'Initial payment reminder pending.',
            ],

            [
                'days_ago' => 7,
                'original' => 850,
                'paid' => 250,
                'status' => 'partially_paid',
                'follow_up' => 'contacted',
                'notes' => 'Customer contacted regarding remaining balance.',
            ],

            [
                'days_ago' => 15,
                'original' => 1200,
                'paid' => 500,
                'status' => 'partially_paid',
                'follow_up' => 'promised',
                'notes' => 'Customer promised payment within the week.',
            ],

            [
                'days_ago' => 35,
                'original' => 1500,
                'paid' => 0,
                'status' => 'outstanding',
                'follow_up' => 'contacted',
                'notes' => 'Second payment reminder sent.',
            ],

            [
                'days_ago' => 55,
                'original' => 2200,
                'paid' => 700,
                'status' => 'partially_paid',
                'follow_up' => 'escalated',
                'notes' => 'Outstanding balance escalated for follow-up.',
            ],

            [
                'days_ago' => 75,
                'original' => 3200,
                'paid' => 0,
                'status' => 'outstanding',
                'follow_up' => 'escalated',
                'notes' => 'Account requires management review.',
            ],

            [
                'days_ago' => 95,
                'original' => 4500,
                'paid' => 1000,
                'status' => 'partially_paid',
                'follow_up' => 'escalated',
                'notes' => 'Long overdue outstanding balance.',
            ],

            [
                'days_ago' => 120,
                'original' => 6000,
                'paid' => 0,
                'status' => 'outstanding',
                'follow_up' => 'escalated',
                'notes' => 'Severely overdue account.',
            ],
        ];

        foreach ($records as $index => $record) {
            $user = $users[$index % $users->count()];
            $booking = $bookings->isNotEmpty()
                ? $bookings[$index % $bookings->count()]
                : null;

            $transaction = $transactions->isNotEmpty()
                ? $transactions[$index % $transactions->count()]
                : null;

            $paid = min(
                (float) $record['paid'],
                (float) $record['original']
            );

            $outstanding = max(
                (float) $record['original'] - $paid,
                0
            );

            OutstandingPayment::updateOrCreate(
                [
                    'transaction_id' => $transaction?->id,
                    'booking_id' => $booking?->id,
                    'user_id' => $user->id,
                    'due_date' => Carbon::today()
                        ->subDays($record['days_ago'])
                        ->toDateString(),
                ],
                [
                    'original_amount' => $record['original'],
                    'paid_amount' => $paid,
                    'outstanding_amount' => $outstanding,
                    'status' => $record['status'],
                    'follow_up_status' => $record['follow_up'],
                    'last_follow_up_at' =>
                        $record['follow_up'] !== 'pending'
                            ? now()->subDays(1)
                            : null,
                    'next_follow_up_at' =>
                        $record['follow_up'] !== 'resolved'
                            ? now()->addDays(3)
                            : null,
                    'follow_up_notes' => $record['notes'],
                    'resolved_at' =>
                        $record['status'] === 'paid'
                            ? now()
                            : null,
                ]
            );
        }

        $this->command?->info(
            'Outstanding payment records seeded successfully.'
        );
    }
}