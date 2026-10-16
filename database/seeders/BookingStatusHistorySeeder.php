<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingStatusHistory;
use Illuminate\Database\Seeder;

class BookingStatusHistorySeeder extends Seeder
{
    public function run(): void
    {
        $booking = Booking::query()
            ->latest('id')
            ->first();

        if (!$booking) {
            $this->command->warn(
                'No booking found. Booking status history seeder skipped.'
            );

            return;
        }

        BookingStatusHistory::where(
            'booking_id',
            $booking->id
        )->delete();

        $now = now();

        $history = [
            [
                'booking_id' => $booking->id,
                'from_status' => null,
                'to_status' => BookingStatusHistory::STATUS_DRAFT,
                'changed_by' => $booking->user_id,
                'reason' => 'Booking created as draft.',
                'notes' => 'Initial booking lifecycle state.',
                'metadata' => [
                    'source' => 'SEEDER',
                ],
                'changed_at' => $now->copy()->subMinutes(50),
            ],
            [
                'booking_id' => $booking->id,
                'from_status' => BookingStatusHistory::STATUS_DRAFT,
                'to_status' => BookingStatusHistory::STATUS_PENDING_PAYMENT,
                'changed_by' => $booking->user_id,
                'reason' => 'Payment initiated.',
                'notes' => 'Customer proceeded to payment.',
                'metadata' => [
                    'source' => 'SEEDER',
                ],
                'changed_at' => $now->copy()->subMinutes(40),
            ],
            [
                'booking_id' => $booking->id,
                'from_status' => BookingStatusHistory::STATUS_PENDING_PAYMENT,
                'to_status' => BookingStatusHistory::STATUS_CONFIRMED,
                'changed_by' => $booking->user_id,
                'reason' => 'Payment completed.',
                'notes' => 'Booking payment was successfully completed.',
                'metadata' => [
                    'source' => 'SEEDER',
                    'payment_status' => 'PAID',
                ],
                'changed_at' => $now->copy()->subMinutes(30),
            ],
        ];

        foreach ($history as $record) {
            BookingStatusHistory::create($record);
        }

        $booking->update([
            'status' => BookingStatusHistory::STATUS_CONFIRMED,
            'confirmed_at' => $now->copy()->subMinutes(30),
        ]);

        $this->command->info(
            "Booking status history created for booking #{$booking->id}."
        );
    }
}