<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_dashboard_settings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            $table->boolean('show_daily_summary')->default(true);
            $table->boolean('show_sport_summary')->default(true);
            $table->boolean('show_court_utilization')->default(true);
            $table->boolean('show_revenue')->default(true);
            $table->boolean('show_booking_status')->default(true);
            $table->boolean('show_outstanding_payments')->default(true);
            $table->boolean('show_failed_transactions')->default(true);
            $table->boolean('show_waitlist')->default(true);
            $table->boolean('show_memberships')->default(true);
            $table->boolean('show_upcoming_sessions')->default(true);
            $table->boolean('show_court_status')->default(true);

            $table->string('default_date_range')->default('today');

            $table->json('widget_order')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_dashboard_settings');
    }
};