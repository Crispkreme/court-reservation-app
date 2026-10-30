
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('players', 'skill_level')) {
            Schema::table('players', function (Blueprint $table) {
                $table->string('skill_level')->nullable();
                $table->index('skill_level');
            });
        }

        if (!Schema::hasColumn('players', 'location')) {
            Schema::table('players', function (Blueprint $table) {
                $table->string('location')->nullable();
                $table->index('location');
            });
        }

        if (!Schema::hasColumn('players', 'availability')) {
            Schema::table('players', function (Blueprint $table) {
                $table->json('availability')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            if (Schema::hasColumn('players', 'availability')) {
                $table->dropColumn('availability');
            }

            if (Schema::hasColumn('players', 'location')) {
                $table->dropIndex(['location']);
                $table->dropColumn('location');
            }

            if (Schema::hasColumn('players', 'skill_level')) {
                $table->dropIndex(['skill_level']);
                $table->dropColumn('skill_level');
            }
        });
    }
};