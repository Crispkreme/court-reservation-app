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

            /*
             * Customer
             *
             * Nullable so public/guest booking can be supported.
             */
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            /*
             * Sport and court
             */
            $table->foreignId('sport_category_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('court_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
             * Booking reference
             */
            $table->string('booking_reference')
                ->unique();

            /*
             * Reservation date/time
             */
            $table->date('booking_date');

            $table->time('start_time');

            $table->time('end_time');

            /*
             * Duration in minutes.
             *
             * Examples:
             * 30
             * 60
             * 90
             */
            $table->unsignedSmallInteger('duration_minutes');

            /*
             * Number of players
             */
            $table->unsignedSmallInteger('players_count');

            /*
             * Price
             */
            $table->decimal('unit_price', 10, 2)
                ->default(0);

            $table->decimal('total_amount', 10, 2)
                ->default(0);

            /*
             * Booking source
             *
             * ONLINE
             * PUBLIC
             * ADMIN
             */
            $table->string('booking_source')
                ->default('ONLINE');

            /*
             * Booking status
             */
            $table->string('status')
                ->default('PENDING');

            /*
             * Membership information.
             *
             * These are nullable because public users
             * may not have memberships.
             */
            $table->string('membership_type')
                ->nullable();

            $table->boolean('membership_required')
                ->default(false);

            /*
             * Optional customer information for
             * public/guest reservations.
             */
            $table->string('customer_name')
                ->nullable();

            $table->string('customer_email')
                ->nullable();

            $table->string('customer_phone')
                ->nullable();

            /*
             * Notes
             */
            $table->text('notes')
                ->nullable();

            /*
             * Confirmation
             */
            $table->timestamp('confirmed_at')
                ->nullable();

            /*
             * Cancellation
             */
            $table->timestamp('cancelled_at')
                ->nullable();

            $table->text('cancellation_reason')
                ->nullable();

            $table->timestamps();

            /*
             * Indexes used heavily by the availability engine.
             */
            $table->index([
                'court_id',
                'booking_date',
                'start_time',
                'end_time',
            ]);

            $table->index([
                'user_id',
                'booking_date',
            ]);

            $table->index([
                'status',
                'booking_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};