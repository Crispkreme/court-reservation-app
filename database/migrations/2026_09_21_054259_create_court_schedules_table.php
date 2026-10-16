<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('court_schedules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('court_id')
                ->constrained('courts')
                ->cascadeOnDelete();

            /*
             * 0 = Sunday
             * 1 = Monday
             * ...
             * 6 = Saturday
             */
            $table->unsignedTinyInteger('day_of_week');

            $table->time('start_time');
            $table->time('end_time');

            /*
             * Controls whether customers can book during
             * this schedule.
             */
            $table->enum('status', [
                'available',
                'blocked',
                'maintenance',
                'closed',
            ])->default('available');

            /*
             * Optional validity period for recurring schedules.
             *
             * Example:
             * start_date = 2026-01-01
             * end_date   = 2026-12-31
             */
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->boolean('is_active')->default(true);

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index([
                'court_id',
                'day_of_week',
                'is_active',
            ]);

            $table->index([
                'start_date',
                'end_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('court_schedules');
    }
};