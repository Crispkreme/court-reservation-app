<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_refunds', function (Blueprint $table) {
            $table->id();

            $table->foreignId('payment_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('refund_reference')
                ->unique();

            $table->string('gateway_reference')
                ->nullable()
                ->index();

            $table->decimal('amount', 12, 2);

            $table->string('currency', 3)
                ->default('USD');

            $table->string('status', 30)
                ->default('PENDING');

            $table->string('reason')
                ->nullable();

            $table->text('notes')
                ->nullable();

            $table->timestamp('processed_at')
                ->nullable();

            $table->json('gateway_response')
                ->nullable();

            $table->timestamps();

            $table->index([
                'payment_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_refunds');
    }
};