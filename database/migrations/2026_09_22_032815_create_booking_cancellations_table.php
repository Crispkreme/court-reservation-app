<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_cancellations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->unique()
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('cancellation_policy_id')
                ->nullable()
                ->constrained('cancellation_policies')
                ->nullOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * customer
             * admin
             * court_closure
             * no_show
             */
            $table->string('cancellation_type');

            $table->text('cancellation_reason')->nullable();

            $table->timestamp('cancelled_at');

            /*
             * Number of hours between cancellation
             * and scheduled booking start.
             */
            $table->decimal('hours_before_booking', 8, 2)
                ->nullable();

            /*
             * Booking amount at the time of cancellation.
             * Stored permanently so historical refunds
             * are not affected if booking data changes.
             */
            $table->decimal('booking_amount', 12, 2)
                ->default(0);

            /*
             * Percentage determined by the applicable policy.
             */
            $table->decimal('refund_percentage', 5, 2)
                ->default(0);

            /*
             * Actual amount the customer is eligible to receive.
             */
            $table->decimal('eligible_refund_amount', 12, 2)
                ->default(0);

            /*
             * NOT_APPLICABLE
             * PENDING
             * PROCESSING
             * REFUNDED
             * FAILED
             */
            $table->string('refund_status')
                ->default('NOT_APPLICABLE');

            /*
             * Payment/refund provider transaction reference.
             */
            $table->string('refund_transaction_reference')
                ->nullable();

            $table->text('refund_notes')->nullable();

            $table->timestamps();

            $table->index('cancellation_type');
            $table->index('refund_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_cancellations');
    }
};