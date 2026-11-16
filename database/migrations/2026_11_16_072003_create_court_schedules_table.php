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
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->time('opening_time')->nullable();
            $table->time('closing_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(
                ['court_id', 'date'],
                'court_schedules_court_date_unique'
            );

            $table->index(
                ['date', 'status'],
                'court_schedules_date_status_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('court_schedules');
    }
};
