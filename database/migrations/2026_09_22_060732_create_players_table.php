
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();

            $table->foreignId('member_id')
                ->nullable()
                ->unique()
                ->constrained()
                ->nullOnDelete();

            $table->string('first_name', 100);
            $table->string('last_name', 100);

            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();

            $table->enum('player_type', [
                'RECREATIONAL',
                'COMPETITIVE',
                'PROFESSIONAL',
            ])->default('RECREATIONAL');

            $table->enum('skill_level', [
                'BEGINNER',
                'INTERMEDIATE',
                'ADVANCED',
                'EXPERT',
            ])->nullable();

            $table->boolean('is_active')->default(true);

            $table->string('location')->nullable();
            $table->json('availability')->nullable();

            $table->timestamps();

            $table->index(['player_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
