<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outstanding_payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('transaction_id')
                ->nullable()
                ->constrained('transactions')
                ->nullOnDelete();

            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->date('due_date');

            $table->decimal('original_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('outstanding_amount', 12, 2);

            $table->string('status')->default('outstanding');

            $table->string('follow_up_status')
                ->default('pending');

            $table->timestamp('last_follow_up_at')
                ->nullable();

            $table->timestamp('next_follow_up_at')
                ->nullable();

            $table->text('follow_up_notes')
                ->nullable();

            $table->timestamp('resolved_at')
                ->nullable();

            $table->timestamps();

            $table->index('due_date');
            $table->index('status');
            $table->index('follow_up_status');
            $table->index(['user_id', 'due_date']);
            $table->index(['booking_id', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outstanding_payments');
    }
};