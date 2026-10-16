<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_rules', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            /*
             * general
             * event
             * tournament
             */
            $table->string('rule_type')->default('general');

            /*
             * Optional membership tier.
             */
            $table->foreignId('membership_tier_id')
                ->nullable()
                ->constrained('membership_tiers')
                ->nullOnDelete();

            /*
             * Optional sport restriction.
             */
            $table->foreignId('sport_category_id')
                ->nullable()
                ->constrained('sport_categories')
                ->nullOnDelete();

            /*
             * Optional court restriction.
             */
            $table->foreignId('court_id')
                ->nullable()
                ->constrained('courts')
                ->nullOnDelete();

            /*
             * Special event / tournament information.
             */
            $table->string('event_name')->nullable();

            $table->text('description')->nullable();

            /*
             * Event/tournament period.
             */
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();

            /*
             * If true, bookings are completely blocked
             * when this rule applies.
             */
            $table->boolean('booking_blocked')->default(false);

            /*
             * Maximum bookings for one member in one day.
             */
            $table->unsignedInteger('max_bookings_per_day')->nullable();

            /*
             * Maximum total booked minutes for one member
             * in one day.
             */
            $table->unsignedInteger('max_minutes_per_day')->nullable();

            /*
             * Maximum number of future bookings a member
             * may have.
             */
            $table->unsignedInteger('max_future_bookings')->nullable();

            /*
             * How many days ahead a member can book.
             *
             * Example:
             * 30 = member can book up to 30 days ahead.
             */
            $table->unsignedInteger('advance_booking_days')->nullable();

            /*
             * Optional time-of-day restriction.
             *
             * Example:
             * 18:00 - 21:00
             */
            $table->time('allowed_start_time')->nullable();
            $table->time('allowed_end_time')->nullable();

            /*
             * Optional days of week.
             *
             * 0 = Sunday
             * 1 = Monday
             * ...
             * 6 = Saturday
             *
             * Stored as JSON:
             * [1,2,3,4,5]
             */
            $table->json('allowed_days')->nullable();

            /*
             * Rule priority.
             *
             * Higher priority rules are evaluated first.
             */
            $table->unsignedInteger('priority')->default(0);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index([
                'rule_type',
                'is_active',
                'priority',
            ]);

            $table->index([
                'membership_tier_id',
                'sport_category_id',
                'court_id',
            ]);

            $table->index([
                'starts_at',
                'ends_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_rules');
    }
};