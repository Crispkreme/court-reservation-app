<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('court_id')
                ->constrained('courts')
                ->restrictOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->dateTime('start_at');
            $table->dateTime('end_at');

            $table->unsignedInteger('duration_minutes');

            $table->decimal('total_price', 10, 2);

            $table->enum('status', [
                'pending',
                'confirmed',
                'completed',
                'cancelled',
            ])->default('pending');

            $table->timestamps();

            $table->index(
                ['court_id', 'start_at', 'end_at'],
                'bookings_court_time_idx'
            );

            $table->index(
                ['start_at', 'end_at'],
                'bookings_calendar_time_idx'
            );

            $table->index(
                ['court_id', 'status', 'start_at'],
                'bookings_court_status_time_idx'
            );

            $table->index(
                ['user_id', 'status'],
                'bookings_user_status_idx'
            );

            $table->index(
                ['status', 'start_at'],
                'bookings_status_time_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
