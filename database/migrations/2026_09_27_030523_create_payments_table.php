<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('payment_reference')
                ->unique();

            $table->string('payment_method');

            $table->string('gateway')
                ->nullable();

            $table->string('gateway_reference')
                ->nullable()
                ->index();

            $table->decimal('amount', 12, 2)
                ->default(0);

            $table->string('currency', 3)
                ->default('USD');

            $table->string('status')
                ->default('PENDING')
                ->index();

            $table->decimal('refunded_amount', 12, 2)
                ->default(0);

            /*
             * Payment lifecycle timestamps.
             */
            $table->timestamp('paid_at')
                ->nullable();

            $table->timestamp('failed_at')
                ->nullable();

            $table->timestamp('refunded_at')
                ->nullable();

            $table->timestamp('confirmed_at')
                ->nullable();

            $table->text('failure_reason')
                ->nullable();

            /*
             * PayPal / gateway response.
             */
            $table->json('gateway_response')
                ->nullable();

            /*
             * Additional payment information.
             */
            $table->json('metadata')
                ->nullable();

            /*
             * Used for public customer payment authorization.
             */
            $table->string('public_token', 64)
                ->nullable()
                ->unique();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};