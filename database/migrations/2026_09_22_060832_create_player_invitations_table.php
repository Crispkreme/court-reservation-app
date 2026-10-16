<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_invitations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('invited_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('player_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('name');
            $table->string('email')
                ->nullable();

            $table->string('token')
                ->unique();

            $table->enum('status', [
                'pending',
                'accepted',
                'declined',
                'expired',
                'cancelled',
            ])->default('pending');

            $table->timestamp('expires_at')
                ->nullable();

            $table->timestamp('responded_at')
                ->nullable();

            $table->timestamps();

            $table->index([
                'booking_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_invitations');
    }
};