<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matchmaking_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('requested_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('sport_category_id')
                ->constrained('sport_categories')
                ->cascadeOnDelete();

            $table->date('preferred_date');

            $table->time('preferred_start_time');

            $table->time('preferred_end_time');

            /*
             * Number of additional players required.
             */
            $table->unsignedSmallInteger('required_players');

            /*
             * Optional skill matching.
             *
             * Examples:
             * beginner
             * intermediate
             * advanced
             * any
             */
            $table->string('skill_level')->nullable();

            /*
             * Optional location preference.
             */
            $table->string('location')->nullable();

            /*
             * Optional availability information.
             *
             * Example:
             * {
             *     "days": ["monday", "wednesday"],
             *     "start_time": "18:00",
             *     "end_time": "21:00"
             * }
             */
            $table->json('availability')->nullable();

            $table->string('status')->default('OPEN');

            $table->text('notes')->nullable();

            $table->timestamp('closed_at')->nullable();

            $table->timestamps();

            $table->index([
                'sport_category_id',
                'preferred_date',
                'status',
            ]);

            $table->index([
                'booking_id',
                'status',
            ]);

            $table->index([
                'requested_by',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matchmaking_requests');
    }
};