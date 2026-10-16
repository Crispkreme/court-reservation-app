<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->string('skill_level')
                ->nullable()
                ->after('email');

            $table->string('location')
                ->nullable()
                ->after('skill_level');

            $table->json('availability')
                ->nullable()
                ->after('location');

            $table->index('skill_level');
            $table->index('location');
        });
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropIndex([
                'skill_level',
            ]);

            $table->dropIndex([
                'location',
            ]);

            $table->dropColumn([
                'skill_level',
                'location',
                'availability',
            ]);
        });
    }
};