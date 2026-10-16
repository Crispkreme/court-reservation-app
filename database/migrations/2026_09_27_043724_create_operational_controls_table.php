<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operational_controls', function (Blueprint $table) {
            $table->id();

            /*
             * Main operational action.
             *
             * manual_booking
             * court_block
             * temporary_closure
             * maintenance
             * tournament_event
             * booking_window
             * manual_cancellation
             * manual_reschedule
             * manual_refund
             * rule_override
             */
            $table->string('control_type');

            /*
             * Optional affected court.
             */
            $table->foreignId('court_id')
                ->nullable()
                ->constrained('courts')
                ->nullOnDelete();

            /*
             * Optional affected booking.
             */
            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            /*
             * User who requested/performed the operation.
             */
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Administrator who authorized the operation.
             */
            $table->foreignId('authorized_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Operational status.
             */
            $table->string('status')->default('active');

            /*
             * Optional date/time restriction.
             */
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();

            /*
             * Booking window.
             *
             * Example:
             * minimum_advance_hours = 2
             * maximum_advance_days = 30
             */
            $table->unsignedInteger('minimum_advance_hours')->nullable();
            $table->unsignedInteger('maximum_advance_days')->nullable();

            /*
             * Rescheduling information.
             */
            $table->date('new_booking_date')->nullable();
            $table->time('new_start_time')->nullable();
            $table->unsignedInteger('new_duration_minutes')->nullable();

            /*
             * Refund information.
             */
            $table->decimal('refund_amount', 12, 2)->nullable();
            $table->string('refund_reference')->nullable();

            /*
             * Rule override values.
             *
             * Example:
             * {
             *   "daily_booking_limit": 5,
             *   "max_duration_minutes": 240,
             *   "advance_days": 60
             * }
             */
            $table->json('override_rules')->nullable();

            /*
             * Roles allowed to use this control.
             *
             * Example:
             * ["admin", "manager", "operations"]
             */
            $table->json('allowed_roles')->nullable();

            $table->text('reason')->nullable();
            $table->text('notes')->nullable();

            /*
             * Additional audit information.
             */
            $table->json('metadata')->nullable();

            $table->timestamp('performed_at')->nullable();

            $table->timestamps();

            $table->index('control_type');
            $table->index('status');
            $table->index(['starts_at', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operational_controls');
    }
};