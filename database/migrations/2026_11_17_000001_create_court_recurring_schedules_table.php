<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('court_recurring_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('court_id')
                ->constrained('courts')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week');
            $table->time('opening_time')->nullable();
            $table->time('closing_time')->nullable();
            $table->string('status')->default('open');
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index([
                'court_id',
                'day_of_week',
                'is_active',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('court_recurring_schedules');
    }
};
