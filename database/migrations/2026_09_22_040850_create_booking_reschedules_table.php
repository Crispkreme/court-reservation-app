<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_reschedules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('requested_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->string('requested_by_type')->default('customer');
            // customer | administrator

            $table->date('original_booking_date');
            $table->time('original_start_time');
            $table->time('original_end_time');

            $table->foreignId('original_court_id')
                ->nullable()
                ->constrained('courts')
                ->nullOnDelete();

            $table->date('new_booking_date');
            $table->time('new_start_time');
            $table->time('new_end_time');

            $table->foreignId('new_court_id')
                ->nullable()
                ->constrained('courts')
                ->nullOnDelete();

            $table->decimal('original_price', 10, 2);
            $table->decimal('new_price', 10, 2);

            $table->decimal('price_difference', 10, 2)
                ->default(0);

            $table->enum('price_adjustment_type', [
                'none',
                'additional_payment',
                'refund',
            ])->default('none');

            $table->string('payment_status')->default('not_required');
            // not_required | pending | paid | refunded

            $table->text('reason')->nullable();

            $table->string('status')->default('completed');
            // pending | completed | cancelled

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_reschedules');
    }
};