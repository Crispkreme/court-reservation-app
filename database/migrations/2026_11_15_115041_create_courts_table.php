
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

            // Sport Category
            $table->foreignId('sport_category_id')
                ->constrained('sport_categories')
                ->restrictOnDelete();

            // Court Information
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('location', 255);

            // Court Type
            $table->enum('court_type', [
                'indoor',
                'outdoor',
            ]);

            // Player Capacity
            $table->unsignedInteger('min_players');
            $table->unsignedInteger('max_players');

            /*
            |--------------------------------------------------------------------------
            | Booking Configuration
            |--------------------------------------------------------------------------
            */

            // Booking Interval: 15, 30, or 60 minutes
            $table->unsignedSmallInteger(
                'booking_interval_minutes'
            )->default(30);

            // Minimum Booking Duration: 60 minutes
            $table->unsignedSmallInteger(
                'min_booking_minutes'
            )->default(60);

            // Maximum Booking Duration: 180 minutes
            $table->unsignedSmallInteger(
                'max_booking_minutes'
            )->default(180);

            /*
            |--------------------------------------------------------------------------
            | Court-Specific Pricing
            |--------------------------------------------------------------------------
            */

            // Each court has its own hourly rate in PHP
            $table->decimal(
                'price_per_hour',
                10,
                2
            )->default(0.00);

            /*
            |--------------------------------------------------------------------------
            | Operating Hours
            |--------------------------------------------------------------------------
            */

            $table->time('opening_time');
            $table->time('closing_time');

            /*
            |--------------------------------------------------------------------------
            | Court Status
            |--------------------------------------------------------------------------
            */

            $table->enum('status', [
                'available',
                'maintenance',
                'closed',
                'temporarily_blocked',
            ])->default('available');

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('court_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courts');
    }
};
