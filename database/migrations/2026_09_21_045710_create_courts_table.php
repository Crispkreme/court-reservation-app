<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sport_category_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('court_number')->nullable();

            $table->string('branch');
            $table->string('location')->nullable();

            /*
             * Capacity
             */
            $table->unsignedInteger('min_players')->default(1);
            $table->unsignedInteger('max_players')->default(10);

            /*
             * Court status
             */
            $table->enum('status', [
                'available',
                'maintenance',
                'closed',
                'temporarily_blocked',
            ])->default('available');

            /*
             * Operating hours
             */
            $table->time('opening_time');
            $table->time('closing_time');

            /*
             * Booking configuration
             *
             * Example:
             * booking_interval = 30
             * minimum_booking_duration = 30
             * maximum_booking_duration = 120
             */
            $table->unsignedInteger('booking_interval')->default(30);

            $table->unsignedInteger('minimum_booking_duration')->default(30);

            $table->unsignedInteger('maximum_booking_duration')->default(120);

            /*
             * Base pricing
             */
            $table->decimal('base_price', 10, 2)->default(0);

            $table->string('currency', 3)->default('PHP');

            $table->text('description')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index([
                'sport_category_id',
                'status',
            ]);

            $table->index('branch');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courts');
    }
};