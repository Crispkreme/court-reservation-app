<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waitlists', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('court_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('sport_category_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('booking_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->date('booking_date');

            $table->time('start_time');

            $table->time('end_time');

            $table->unsignedInteger('duration_minutes');

            /*
             * Position at the time the user joined.
             */
            $table->unsignedInteger('position');

            /*
             * waiting
             * notified
             * claimed
             * fulfilled
             * expired
             * cancelled
             */
            $table->string('status', 30)
                ->default('waiting')
                ->index();

            /*
             * Number of minutes the promoted user has
             * to claim the slot.
             */
            $table->unsignedInteger('claim_window_minutes')
                ->default(10);

            $table->timestamp('promoted_at')
                ->nullable();

            $table->timestamp('claim_expires_at')
                ->nullable();

            $table->timestamp('claimed_at')
                ->nullable();

            $table->timestamp('fulfilled_at')
                ->nullable();

            $table->timestamp('cancelled_at')
                ->nullable();

            $table->timestamp('expired_at')
                ->nullable();

            $table->text('cancellation_reason')
                ->nullable();

            $table->text('expiration_reason')
                ->nullable();

            /*
             * Prevent duplicate active waitlist entries
             * for the same user/session.
             */
            $table->string('session_key')->index();

            $table->timestamps();

            $table->index([
                'court_id',
                'booking_date',
                'start_time',
                'end_time',
            ]);

            $table->index([
                'status',
                'booking_date',
                'start_time',
            ]);

            $table->index([
                'court_id',
                'booking_date',
                'position',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlists');
    }
};