<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('failure_exceptions', function (Blueprint $table) {
            $table->id();

            /*
             * Failure classification
             */
            $table->string('failure_type');
            // booking
            // payment
            // payment_gateway_timeout
            // refund
            // notification
            // waitlist_assignment

            $table->string('failure_stage')->nullable();
            // validation
            // availability
            // reservation
            // payment
            // payment_gateway
            // refund
            // notification
            // waitlist
            // system
            // database
            // external_service

            /*
             * References
             */
            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('court_id')
                ->nullable()
                ->constrained('courts')
                ->nullOnDelete();

            /*
             * Failure details
             */
            $table->string('reference')->nullable();

            $table->text('reason');

            $table->text('technical_details')->nullable();

            $table->string('error_code')->nullable();

            $table->string('gateway')->nullable();

            $table->string('gateway_reference')->nullable();

            /*
             * Original event information
             */
            $table->date('failure_date')->nullable();

            $table->time('failure_time')->nullable();

            $table->timestamp('failed_at')->nullable();

            /*
             * Recoverability / resolution
             */
            $table->boolean('is_recoverable')->default(false);

            $table->unsignedInteger('retry_count')->default(0);

            $table->unsignedInteger('max_retries')->default(3);

            $table->string('status')->default('open');
            // open
            // retrying
            // resolved
            // ignored
            // failed

            $table->timestamp('last_retry_at')->nullable();

            $table->timestamp('resolved_at')->nullable();

            $table->foreignId('resolved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('resolution_notes')->nullable();

            /*
             * Metadata
             */
            $table->json('context')->nullable();

            $table->timestamps();

            $table->index('failure_type');
            $table->index('failure_stage');
            $table->index('status');
            $table->index('failure_date');
            $table->index('failed_at');
            $table->index(['failure_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failure_exceptions');
    }
};