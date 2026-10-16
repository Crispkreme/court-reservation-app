<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->string('transaction_id')->unique();

            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->decimal('amount', 12, 2)->default(0);

            $table->string('currency', 10)->default('PHP');

            $table->string('payment_method')->nullable();

            $table->string('gateway')->nullable();

            $table->string('gateway_reference')->nullable();

            $table->enum('payment_status', [
                'pending',
                'paid',
                'failed',
                'cancelled',
                'refunded',
                'partially_refunded',
            ])->default('pending');

            $table->decimal('refund_amount', 12, 2)->default(0);

            $table->enum('refund_status', [
                'none',
                'pending',
                'processed',
                'failed',
                'cancelled',
            ])->default('none');

            $table->timestamp('transaction_date')->nullable();

            $table->timestamp('refunded_at')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index('transaction_id');
            $table->index('booking_id');
            $table->index('user_id');
            $table->index('payment_status');
            $table->index('refund_status');
            $table->index('transaction_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};