<?php

namespace Database\Seeders;

use App\Models\FailureException;
use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class FailureExceptionSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->first();
        $booking = Booking::query()->first();
        $court = Court::query()->first();

        $records = [
            [
                'failure_type' => 'booking',
                'failure_stage' => 'availability',
                'booking_id' => $booking?->id,
                'user_id' => $user?->id,
                'court_id' => $court?->id,
                'reference' => 'BOOK-FAIL-001',
                'reason' => 'Court became unavailable while completing the booking.',
                'technical_details' => 'Availability check failed during final reservation transaction.',
                'error_code' => 'COURT_UNAVAILABLE',
                'is_recoverable' => true,
                'retry_count' => 0,
                'max_retries' => 3,
                'status' => 'open',
                'failed_at' => Carbon::now()->subHours(2),
            ],

            [
                'failure_type' => 'payment',
                'failure_stage' => 'payment',
                'booking_id' => $booking?->id,
                'user_id' => $user?->id,
                'court_id' => $court?->id,
                'reference' => 'PAY-FAIL-001',
                'reason' => 'Payment transaction was declined.',
                'technical_details' => 'Payment provider returned a declined transaction response.',
                'error_code' => 'PAYMENT_DECLINED',
                'gateway' => 'Demo Gateway',
                'gateway_reference' => 'GW-DEMO-10001',
                'is_recoverable' => true,
                'retry_count' => 1,
                'max_retries' => 3,
                'status' => 'failed',
                'failed_at' => Carbon::now()->subHours(5),
            ],

            [
                'failure_type' => 'payment_gateway_timeout',
                'failure_stage' => 'payment_gateway',
                'booking_id' => $booking?->id,
                'user_id' => $user?->id,
                'court_id' => $court?->id,
                'reference' => 'GW-TIMEOUT-001',
                'reason' => 'Payment gateway did not respond within the configured timeout.',
                'technical_details' => 'Gateway response exceeded 30 second timeout.',
                'error_code' => 'GATEWAY_TIMEOUT',
                'gateway' => 'Demo Gateway',
                'gateway_reference' => 'GW-TIMEOUT-10002',
                'is_recoverable' => true,
                'retry_count' => 0,
                'max_retries' => 3,
                'status' => 'open',
                'failed_at' => Carbon::now()->subDay(),
            ],

            [
                'failure_type' => 'refund',
                'failure_stage' => 'refund',
                'booking_id' => $booking?->id,
                'user_id' => $user?->id,
                'court_id' => $court?->id,
                'reference' => 'REFUND-FAIL-001',
                'reason' => 'Refund request failed at the payment gateway.',
                'technical_details' => 'Gateway rejected the refund request.',
                'error_code' => 'REFUND_REJECTED',
                'gateway' => 'Demo Gateway',
                'gateway_reference' => 'REF-10003',
                'is_recoverable' => true,
                'retry_count' => 1,
                'max_retries' => 3,
                'status' => 'retrying',
                'failed_at' => Carbon::now()->subDays(2),
            ],

            [
                'failure_type' => 'notification',
                'failure_stage' => 'notification',
                'booking_id' => $booking?->id,
                'user_id' => $user?->id,
                'court_id' => $court?->id,
                'reference' => 'NOTIFY-FAIL-001',
                'reason' => 'Booking confirmation notification could not be delivered.',
                'technical_details' => 'Notification provider returned a delivery failure.',
                'error_code' => 'NOTIFICATION_DELIVERY_FAILED',
                'is_recoverable' => true,
                'retry_count' => 2,
                'max_retries' => 3,
                'status' => 'open',
                'failed_at' => Carbon::now()->subDays(3),
            ],

            [
                'failure_type' => 'waitlist_assignment',
                'failure_stage' => 'waitlist',
                'booking_id' => $booking?->id,
                'user_id' => $user?->id,
                'court_id' => $court?->id,
                'reference' => 'WAITLIST-FAIL-001',
                'reason' => 'The next waitlist member could not be assigned to the available slot.',
                'technical_details' => 'Assignment failed because the slot was no longer available.',
                'error_code' => 'WAITLIST_ASSIGNMENT_FAILED',
                'is_recoverable' => true,
                'retry_count' => 0,
                'max_retries' => 3,
                'status' => 'open',
                'failed_at' => Carbon::now()->subDays(4),
            ],
        ];

        foreach ($records as $record) {
            $record['failure_date'] = Carbon::parse(
                $record['failed_at']
            )->toDateString();

            $record['failure_time'] = Carbon::parse(
                $record['failed_at']
            )->format('H:i');

            FailureException::create($record);
        }
    }
}