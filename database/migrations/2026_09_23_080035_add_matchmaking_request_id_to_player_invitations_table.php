<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('player_invitations', function (Blueprint $table) {
            $table->foreignId('matchmaking_request_id')
                ->nullable()
                ->after('booking_id')
                ->constrained('matchmaking_requests')
                ->nullOnDelete();

            $table->index('matchmaking_request_id');
        });
    }

    public function down(): void
    {
        Schema::table('player_invitations', function (Blueprint $table) {
            $table->dropForeign([
                'matchmaking_request_id',
            ]);

            $table->dropIndex([
                'matchmaking_request_id',
            ]);

            $table->dropColumn('matchmaking_request_id');
        });
    }
};