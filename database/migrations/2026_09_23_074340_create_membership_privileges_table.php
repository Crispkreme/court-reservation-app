<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_privileges', function (Blueprint $table) {
            $table->id();

            /*
             * Membership tier.
             */
            $table->foreignId('membership_type_id')
                ->unique()
                ->constrained('membership_types')
                ->cascadeOnDelete();

            /*
             * Booking privileges.
             */
            $table->boolean('priority_booking')
                ->default(false);

            $table->unsignedSmallInteger('booking_advance_days')
                ->default(30);

            $table->boolean('premium_courts')
                ->default(false);

            /*
             * Tier-specific booking limits.
             */
            $table->unsignedSmallInteger('daily_booking_limit')
                ->nullable();

            $table->unsignedSmallInteger('max_duration_minutes')
                ->nullable();

            $table->unsignedSmallInteger('max_players')
                ->nullable();

            /*
             * Cancellation privileges.
             *
             * Number of hours before booking when
             * cancellation is permitted.
             */
            $table->unsignedSmallInteger('cancellation_window_hours')
                ->nullable();

            $table->boolean('free_cancellation')
                ->default(false);

            /*
             * Rescheduling privileges.
             *
             * Number of hours before booking when
             * rescheduling is permitted.
             */
            $table->unsignedSmallInteger('reschedule_window_hours')
                ->nullable();

            $table->boolean('free_rescheduling')
                ->default(false);

            /*
             * Administrator notes.
             */
            $table->text('notes')
                ->nullable();

            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_privileges');
    }
};