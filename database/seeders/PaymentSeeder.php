<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $bookings = Booking::query()
            ->orderBy('id')
            ->get();

        if ($bookings->isEmpty()) {
            $this->command?->warn(
                'No bookings found. Please run BookingSeeder before PaymentSeeder.'
            );

            return;
        }

        $admin = User::query()
            ->where('is_admin', true)
            ->first();

        $paymentMethods = [
            Payment::METHOD_PAYPAL,
            Payment::METHOD_CARD,
            Payment::METHOD_E_WALLET,
            Payment::METHOD_CASH,
            Payment::METHOD_BANK_TRANSFER,
            Payment::METHOD_MANUAL,
        ];

        foreach ($bookings as $index => $booking) {
            // Prevent duplicate payments when the seeder is run again.
            if (Payment::where('booking_id', $booking->id)->exists()) {
                continue;
            }

            $amount = (float) (
                $booking->final_amount
                ?? $booking->total_amount
                ?? $booking->amount
                ?? $booking->price
                ?? 0
            );

            $method = $paymentMethods[$index % count($paymentMethods)];

            $status = match ($index % 5) {
                0 => Payment::STATUS_PAID,
                1 => Payment::STATUS_PENDING,
                2 => Payment::STATUS_FAILED,
                3 => Payment::STATUS_REFUNDED,
                default => Payment::STATUS_PARTIALLY_REFUNDED,
            };

            // Make sure refunded payments have a sensible refund amount.
            $refundedAmount = 0;

            if ($status === Payment::STATUS_REFUNDED) {
                $refundedAmount = $amount;
            }

            if ($status === Payment::STATUS_PARTIALLY_REFUNDED) {
                $refundedAmount = $amount > 0
                    ? round($amount * 0.50, 2)
                    : 0;
            }

            $payment = Payment::create([
                'booking_id' => $booking->id,

                'user_id' => $booking->user_id
                    ?? $admin?->id,

                'payment_reference' =>
                    'PAY-' . strtoupper(Str::random(12)),

                'payment_method' => $method,

                'gateway' => $method === Payment::METHOD_PAYPAL
                    ? 'PAYPAL'
                    : null,

                'gateway_reference' => $method === Payment::METHOD_PAYPAL
                    ? 'SANDBOX-' . strtoupper(Str::random(16))
                    : null,

                'amount' => $amount,

                'currency' => config(
                    'services.paypal.currency',
                    'USD'
                ),

                'status' => $status,

                'refunded_amount' => $refundedAmount,

                'paid_at' => in_array($status, [
                    Payment::STATUS_PAID,
                    Payment::STATUS_REFUNDED,
                    Payment::STATUS_PARTIALLY_REFUNDED,
                ])
                    ? now()->subDays(rand(1, 10))
                    : null,

                'failed_at' => $status === Payment::STATUS_FAILED
                    ? now()->subDays(rand(1, 5))
                    : null,

                'refunded_at' => in_array($status, [
                    Payment::STATUS_REFUNDED,
                    Payment::STATUS_PARTIALLY_REFUNDED,
                ])
                    ? now()->subDays(rand(1, 3))
                    : null,

                'confirmed_at' => in_array($status, [
                    Payment::STATUS_PAID,
                    Payment::STATUS_REFUNDED,
                    Payment::STATUS_PARTIALLY_REFUNDED,
                ])
                    ? now()
                    : null,

                'failure_reason' => $status === Payment::STATUS_FAILED
                    ? 'Sandbox payment failed during testing.'
                    : null,

                'gateway_response' => $method === Payment::METHOD_PAYPAL
                    ? [
                        'environment' => 'sandbox',
                        'provider' => 'PayPal',
                        'reference' => 'SANDBOX',
                    ]
                    : null,

                'metadata' => [
                    'seeded' => true,
                    'source' => 'PaymentSeeder',
                    'booking_id' => $booking->id,
                ],
            ]);

            $this->command?->info(
                "Created payment {$payment->payment_reference} " .
                "for booking #{$booking->id}."
            );
        }
    }
}