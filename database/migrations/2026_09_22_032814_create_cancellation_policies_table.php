<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cancellation_policies', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            /*
             * Applies to:
             * null = all cancellation types
             * customer
             * admin
             * court_closure
             * no_show
             */
            $table->string('cancellation_type')->nullable();

            /*
             * Minimum number of hours before booking.
             *
             * Example:
             * 24 means the rule applies from 24 hours onward.
             */
            $table->unsignedInteger('minimum_hours_before_booking');

            /*
             * Maximum number of hours before booking.
             *
             * NULL = no upper limit.
             *
             * Example:
             * 48 means 24-48 hours.
             */
            $table->unsignedInteger('maximum_hours_before_booking')
                ->nullable();

            /*
             * 0   = no refund
             * 50  = 50% refund
             * 100 = full refund
             */
            $table->decimal('refund_percentage', 5, 2)
                ->default(0);

            $table->text('description')->nullable();

            $table->unsignedInteger('priority')->default(0);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index([
                'cancellation_type',
                'minimum_hours_before_booking',
            ]);

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cancellation_policies');
    }
};