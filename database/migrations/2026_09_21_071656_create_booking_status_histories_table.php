<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_status_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->string('from_status', 30)
                ->nullable();

            $table->string('to_status', 30);

            $table->foreignId('changed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('reason')
                ->nullable();

            $table->text('notes')
                ->nullable();

            $table->json('metadata')
                ->nullable();

            $table->timestamp('changed_at');

            $table->timestamps();

            $table->index([
                'booking_id',
                'changed_at',
            ]);

            $table->index([
                'to_status',
                'changed_at',
            ]);

            $table->index([
                'changed_by',
                'changed_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_status_histories');
    }
};