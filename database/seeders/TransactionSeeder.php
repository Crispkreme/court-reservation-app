<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::query()
            ->orderBy('id')
            ->get();

        $bookings = Booking::query()
            ->orderBy('id')
            ->get();

        if ($users->isEmpty()) {
            $this->command?->warn(
                'TransactionSeeder skipped: no users found.'
            );

            return;
        }

        if ($bookings->isEmpty()) {
            $this->command?->warn(
                'TransactionSeeder skipped: no bookings found.'
            );

            return;
        }

        $paymentMethods = [
            'card',
            'paypal',
            'e_wallet',
            'cash',
            'bank_transfer',
        ];

        $gateways = [
            'PayPal',
            'GCash',
            'Maya',
            'Stripe',
            'Manual',
        ];

        $statuses = [
            'paid',
            'paid',
            'paid',
            'pending',
            'failed',
            'refunded',
            'partially_refunded',
        ];

        foreach ($bookings->take(10) as $index => $booking) {
            $user = $users->firstWhere(
                'id',
                $booking->user_id
            ) ?? $users->first();

            $amount = fake()->randomFloat(
                2,
                300,
                2500
            );

            $status = $statuses[$index % count($statuses)];

            $refundAmount = 0;
            $refundStatus = 'none';
            $refundedAt = null;

            if ($status === 'refunded') {
                $refundAmount = $amount;
                $refundStatus = 'processed';
                $refundedAt = now()->subDays(
                    fake()->numberBetween(1, 10)
                );
            }

            if ($status === 'partially_refunded') {
                $refundAmount = round(
                    $amount * 0.5,
                    2
                );

                $refundStatus = 'processed';

                $refundedAt = now()->subDays(
                    fake()->numberBetween(1, 10)
                );
            }

            Transaction::updateOrCreate(
                [
                    'booking_id' => $booking->id,
                ],
                [
                    'transaction_id' =>
                        'TXN-' . strtoupper(Str::random(12)),

                    'user_id' => $user?->id,

                    'amount' => $amount,

                    'currency' => 'PHP',

                    'payment_method' =>
                        $paymentMethods[
                            $index % count($paymentMethods)
                        ],

                    'gateway' =>
                        $gateways[
                            $index % count($gateways)
                        ],

                    'gateway_reference' =>
                        'GW-' . strtoupper(Str::random(14)),

                    'payment_status' => $status,

                    'refund_amount' => $refundAmount,

                    'refund_status' => $refundStatus,

                    'transaction_date' =>
                        now()->subDays(
                            fake()->numberBetween(0, 30)
                        ),

                    'refunded_at' => $refundedAt,

                    'notes' => null,
                ]
            );
        }

        $this->command?->info(
            'Transaction history seeded successfully.'
        );
    }
}