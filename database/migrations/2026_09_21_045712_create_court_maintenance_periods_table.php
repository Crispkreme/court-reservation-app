<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('court_maintenance_periods', function (Blueprint $table) {
            $table->id();

            $table->foreignId('court_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('maintenance_date');

            $table->time('start_time');
            $table->time('end_time');

            $table->string('reason')->nullable();

            $table->text('notes')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index([
                'court_id',
                'maintenance_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('court_maintenance_periods');
    }
};