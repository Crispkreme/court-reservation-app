<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_holds', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('sport_category_id')
                ->constrained('sport_categories')
                ->cascadeOnDelete();

            $table->foreignId('court_id')
                ->constrained('courts')
                ->cascadeOnDelete();

            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            /*
             * Unique identifier for the customer's checkout session.
             */
            $table->uuid('hold_token')
                ->unique();

            /*
             * Used to identify the exact held slot.
             *
             * Example:
             * court-1|2026-09-21|14:00:00|15:00:00
             *
             * This is nullable because once a hold expires,
             * we release the slot key so it can be held again.
             */
            $table->string('active_slot_key')
                ->nullable()
                ->unique();

            $table->date('booking_date');

            $table->time('start_time');

            $table->time('end_time');

            $table->unsignedInteger('duration_minutes');

            $table->unsignedInteger('players_count')
                ->default(1);

            /*
             * Hold status:
             *
             * ACTIVE
             * CONVERTED
             * EXPIRED
             * FAILED
             */
            $table->string('status', 30)
                ->default('ACTIVE');

            /*
             * How long the customer gets to complete checkout.
             */
            $table->unsignedInteger('hold_duration_minutes')
                ->default(10);

            $table->timestamp('held_at');

            $table->timestamp('expires_at');

            /*
             * Payment / checkout information.
             */
            $table->string('payment_reference')
                ->nullable();

            $table->string('failure_reason')
                ->nullable();

            $table->timestamp('failed_at')
                ->nullable();

            $table->timestamp('expired_at')
                ->nullable();

            $table->timestamp('converted_at')
                ->nullable();

            /*
             * Customer information is captured at hold time.
             * This means the checkout attempt can still be audited
             * even when payment fails.
             */
            $table->string('customer_name')
                ->nullable();

            $table->string('customer_email')
                ->nullable();

            $table->string('customer_phone')
                ->nullable();

            $table->text('notes')
                ->nullable();

            /*
             * Stores additional checkout information.
             */
            $table->json('metadata')
                ->nullable();

            $table->timestamps();

            $table->index([
                'court_id',
                'booking_date',
                'start_time',
                'end_time',
            ]);

            $table->index([
                'status',
                'expires_at',
            ]);

            $table->index([
                'user_id',
                'status',
            ]);

            $table->index([
                'booking_date',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_holds');
    }
};