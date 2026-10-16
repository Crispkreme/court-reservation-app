<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('court_utilizations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('court_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('utilization_date');

            $table->unsignedInteger('available_minutes')->default(0);

            $table->unsignedInteger('booked_minutes')->default(0);

            $table->unsignedInteger('maintenance_minutes')->default(0);

            $table->unsignedInteger('blocked_minutes')->default(0);

            $table->unsignedInteger('booking_count')->default(0);

            $table->decimal('utilization_percentage', 5, 2)->default(0);

            $table->timestamps();

            $table->unique([
                'court_id',
                'utilization_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('court_utilizations');
    }
};