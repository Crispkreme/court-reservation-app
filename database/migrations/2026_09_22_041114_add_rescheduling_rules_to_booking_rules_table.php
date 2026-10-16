<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_rules', function (Blueprint $table) {
            $table->boolean('rescheduling_enabled')
                ->default(true)
                ->after('id');

            $table->unsignedInteger('rescheduling_cutoff_hours')
                ->default(24)
                ->after('rescheduling_enabled');

            $table->boolean('customer_rescheduling_enabled')
                ->default(true)
                ->after('rescheduling_cutoff_hours');

            $table->boolean('administrator_rescheduling_enabled')
                ->default(true)
                ->after('customer_rescheduling_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('booking_rules', function (Blueprint $table) {
            $table->dropColumn([
                'rescheduling_enabled',
                'rescheduling_cutoff_hours',
                'customer_rescheduling_enabled',
                'administrator_rescheduling_enabled',
            ]);
        });
    }
};