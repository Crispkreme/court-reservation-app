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

            $table->string('first_name');
            $table->string('last_name');

            $table->string('email')
                ->nullable();

            $table->string('phone')
                ->nullable();

            $table->enum('player_type', [
                'member',
                'guest',
            ])->default('guest');

            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();

            $table->index(['player_type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};