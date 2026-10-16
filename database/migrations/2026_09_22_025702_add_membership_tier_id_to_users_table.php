<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('membership_tier_id')
                ->nullable()
                ->after('id')
                ->constrained('membership_tiers')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign([
                'membership_tier_id',
            ]);

            $table->dropColumn('membership_tier_id');
        });
    }
};