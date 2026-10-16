<?php

namespace Database\Factories;

use App\Models\BookingHold;
use App\Models\Court;
use App\Models\SportCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BookingHold>
 */
class BookingHoldFactory extends Factory
{
    protected $model = BookingHold::class;

    public function definition(): array
    {
        $bookingDate = fake()
            ->dateTimeBetween('+1 day', '+30 days')
            ->format('Y-m-d');

        $startTime = '14:00';
        $endTime = '15:00';

        $holdDuration = BookingHold::DEFAULT_HOLD_DURATION;

        $heldAt = now();
        $expiresAt = $heldAt->copy()->addMinutes($holdDuration);

        return [
            'user_id' => User::factory(),

            'sport_category_id' => SportCategory::factory(),

            'court_id' => Court::factory(),

            'booking_id' => null,

            'hold_token' => Str::uuid()->toString(),

            'active_slot_key' => sprintf(
                '%s:%s:%s',
                fake()->numberBetween(1, 999),
                $bookingDate,
                str_replace(':', '', $startTime)
            ),

            'booking_date' => $bookingDate,

            'start_time' => $startTime,

            'end_time' => $endTime,

            'duration_minutes' => 60,

            'players_count' => 1,

            'status' => BookingHold::STATUS_ACTIVE,

            'hold_duration_minutes' => $holdDuration,

            'held_at' => $heldAt,

            'expires_at' => $expiresAt,

            'payment_reference' => null,

            'failure_reason' => null,

            'failed_at' => null,

            'expired_at' => null,

            'converted_at' => null,

            'customer_name' => fake()->name(),

            'customer_email' => fake()->safeEmail(),

            'customer_phone' => fake()->phoneNumber(),

            'notes' => null,

            'metadata' => null,
        ];
    }
}