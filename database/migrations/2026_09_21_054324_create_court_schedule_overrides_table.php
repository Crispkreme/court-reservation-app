<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('court_schedule_overrides', function (Blueprint $table) {
            $table->id();

            $table->foreignId('court_id')
                ->constrained('courts')
                ->cascadeOnDelete();

            /*
             * Specific date affected by the override.
             */
            $table->date('date');

            /*
             * NULL means the whole day.
             */
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            $table->enum('status', [
                'available',
                'blocked',
                'maintenance',
                'closed',
                'holiday',
            ])->default('blocked');

            $table->string('title')->nullable();

            $table->text('reason')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index([
                'court_id',
                'date',
            ]);

            $table->index([
                'date',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('court_schedule_overrides');
    }
};