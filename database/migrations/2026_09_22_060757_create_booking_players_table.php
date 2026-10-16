<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_players', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('player_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('participant_status', [
                'invited',
                'confirmed',
                'declined',
                'cancelled',
                'attended',
                'no_show',
            ])->default('confirmed');

            $table->timestamp('invited_at')
                ->nullable();

            $table->timestamp('responded_at')
                ->nullable();

            $table->timestamp('checked_in_at')
                ->nullable();

            $table->text('notes')
                ->nullable();

            $table->timestamps();

            $table->unique([
                'booking_id',
                'player_id',
            ]);

            $table->index([
                'booking_id',
                'participant_status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_players');
    }
};