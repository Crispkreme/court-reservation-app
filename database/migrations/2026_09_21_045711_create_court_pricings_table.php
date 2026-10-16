<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('court_pricings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('court_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
             * Pricing type
             */
            $table->enum('pricing_type', [
                'hourly',
                'per_booking',
            ])->default('hourly');

            $table->decimal('price', 10, 2);

            /*
             * Optional schedule-specific pricing
             */
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            /*
             * Optional day-specific pricing
             */
            $table->unsignedTinyInteger('day_of_week')->nullable();

            /*
             * 0 = Sunday
             * 1 = Monday
             * ...
             * 6 = Saturday
             */

            $table->date('effective_from')->nullable();
            $table->date('effective_until')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index([
                'court_id',
                'is_active',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('court_pricings');
    }
};