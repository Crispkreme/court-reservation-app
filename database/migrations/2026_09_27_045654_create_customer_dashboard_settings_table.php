<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_dashboard_settings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            $table->boolean('show_upcoming_bookings')->default(true);
            $table->boolean('show_today_bookings')->default(true);
            $table->boolean('show_quick_book')->default(true);
            $table->boolean('show_available_courts')->default(true);
            $table->boolean('show_sports')->default(true);
            $table->boolean('show_membership')->default(true);
            $table->boolean('show_payment_balance')->default(true);
            $table->boolean('show_notifications')->default(true);
            $table->boolean('show_booking_history')->default(true);
            $table->boolean('show_transaction_history')->default(true);

            $table->string('default_view')->default('dashboard');
            $table->string('default_booking_filter')->default('all');

            $table->json('widget_order')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_dashboard_settings');
    }
};