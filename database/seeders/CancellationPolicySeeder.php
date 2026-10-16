<?php

namespace Database\Seeders;

use App\Models\CancellationPolicy;
use Illuminate\Database\Seeder;

class CancellationPolicySeeder extends Seeder
{
    public function run(): void
    {
        /*
         * More than 48 hours:
         * Full refund.
         */
        CancellationPolicy::updateOrCreate(
            [
                'name' => 'Customer Cancellation - Full Refund',
            ],
            [
                'cancellation_type' => 'customer',
                'minimum_hours_before_booking' => 48,
                'maximum_hours_before_booking' => null,
                'refund_percentage' => 100,
                'description' =>
                    'Customer cancellations made 48 hours or more before the booking are eligible for a full refund.',
                'priority' => 20,
                'is_active' => true,
            ]
        );

        /*
         * 24-48 hours:
         * 50% refund.
         *
         * This is an optional partial-refund example.
         */
        CancellationPolicy::updateOrCreate(
            [
                'name' => 'Customer Cancellation - Partial Refund',
            ],
            [
                'cancellation_type' => 'customer',
                'minimum_hours_before_booking' => 24,
                'maximum_hours_before_booking' => 48,
                'refund_percentage' => 50,
                'description' =>
                    'Customer cancellations made between 24 and 48 hours before the booking receive a 50% refund.',
                'priority' => 20,
                'is_active' => true,
            ]
        );

        /*
         * Less than 24 hours:
         * No refund.
         */
        CancellationPolicy::updateOrCreate(
            [
                'name' => 'Customer Cancellation - Within 24 Hours',
            ],
            [
                'cancellation_type' => 'customer',
                'minimum_hours_before_booking' => 0,
                'maximum_hours_before_booking' => 24,
                'refund_percentage' => 0,
                'description' =>
                    'Customer cancellations made within 24 hours of the booking are not eligible for a refund.',
                'priority' => 20,
                'is_active' => true,
            ]
        );

        /*
         * Court closure:
         * Full refund.
         */
        CancellationPolicy::updateOrCreate(
            [
                'name' => 'Court Closure - Full Refund',
            ],
            [
                'cancellation_type' => 'court_closure',
                'minimum_hours_before_booking' => 0,
                'maximum_hours_before_booking' => null,
                'refund_percentage' => 100,
                'description' =>
                    'Bookings cancelled because of court closure are eligible for a full refund.',
                'priority' => 100,
                'is_active' => true,
            ]
        );

        /*
         * Admin cancellation:
         * Full refund.
         */
        CancellationPolicy::updateOrCreate(
            [
                'name' => 'Admin Cancellation - Full Refund',
            ],
            [
                'cancellation_type' => 'admin',
                'minimum_hours_before_booking' => 0,
                'maximum_hours_before_booking' => null,
                'refund_percentage' => 100,
                'description' =>
                    'Bookings cancelled by an administrator are eligible for a full refund.',
                'priority' => 100,
                'is_active' => true,
            ]
        );

        /*
         * No-show:
         * No refund.
         */
        CancellationPolicy::updateOrCreate(
            [
                'name' => 'No-Show - No Refund',
            ],
            [
                'cancellation_type' => 'no_show',
                'minimum_hours_before_booking' => 0,
                'maximum_hours_before_booking' => null,
                'refund_percentage' => 0,
                'description' =>
                    'Bookings marked as no-show are not eligible for a refund.',
                'priority' => 100,
                'is_active' => true,
            ]
        );
    }
}