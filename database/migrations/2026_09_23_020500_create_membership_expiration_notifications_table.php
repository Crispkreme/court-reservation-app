<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_expiration_notifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('membership_id')
                ->constrained('memberships')
                ->cascadeOnDelete();

            $table->foreignId('member_id')
                ->constrained('members')
                ->cascadeOnDelete();

            $table->unsignedInteger('days_before_expiration');

            $table->timestamp('sent_at');

            $table->timestamps();

            $table->unique([
                'membership_id',
                'days_before_expiration',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_expiration_notifications');
    }
};