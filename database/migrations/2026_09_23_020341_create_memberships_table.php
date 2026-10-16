<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memberships', function (Blueprint $table) {
            $table->id();

            /*
             * Member who owns the membership.
             */
            $table->foreignId('member_id')
                ->constrained('members')
                ->cascadeOnDelete();

            /*
             * Membership type/level.
             */
            $table->foreignId('membership_type_id')
                ->constrained('membership_types')
                ->restrictOnDelete();

            /*
             * Membership validity period.
             */
            $table->date('start_date');
            $table->date('expiration_date');

            /*
             * Membership lifecycle status.
             */
            $table->enum('status', [
                'pending',
                'active',
                'expired',
                'suspended',
                'cancelled',
            ])->default('pending');

            /*
             * Store the membership type price at the time
             * the membership was purchased.
             *
             * This prevents historical memberships from
             * changing when the membership type price changes.
             */
            $table->decimal('base_price', 12, 2)
                ->default(0);

            /*
             * Discount applied to this specific membership.
             */
            $table->enum('discount_type', [
                'none',
                'percentage',
                'fixed',
            ])->default('none');

            $table->decimal('discount_value', 12, 2)
                ->default(0);

            /*
             * Actual amount paid for this membership after
             * discounts have been applied.
             */
            $table->decimal('final_price', 12, 2)
                ->default(0);

            /*
             * Links a renewed membership to the previous
             * membership.
             */
            $table->foreignId('renewed_from_id')
                ->nullable()
                ->constrained('memberships')
                ->nullOnDelete();

            /*
             * Additional membership notes.
             */
            $table->text('notes')
                ->nullable();

            /*
             * Tracks whether an expiration notification
             * has already been sent.
             */
            $table->timestamp('expiration_notification_sent_at')
                ->nullable();

            $table->timestamps();

            /*
             * Useful for retrieving a member's memberships
             * by status.
             */
            $table->index([
                'member_id',
                'status',
            ]);

            /*
             * Useful for expiration notification jobs
             * and expiration-related queries.
             */
            $table->index([
                'expiration_date',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};