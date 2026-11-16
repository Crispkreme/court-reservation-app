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

            $table->date('date');

            // Null means use the court's default hours.
            $table->time('opening_time')->nullable();
            $table->time('closing_time')->nullable();

            // open or closed
            $table->string('status', 20)->default('open');

            $table->text('notes')->nullable();

            $table->timestamps();

            // One daily schedule per court.
            $table->unique(['court_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('court_schedules');
    }
};
