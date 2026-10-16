<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->unique()
                ->constrained()
                ->nullOnDelete();

            $table->string('member_number')
                ->unique();

            $table->string('first_name');
            $table->string('last_name');

            $table->string('middle_name')
                ->nullable();

            $table->string('email')
                ->nullable()
                ->index();

            $table->string('phone')
                ->nullable();

            $table->date('date_of_birth')
                ->nullable();

            $table->string('gender')
                ->nullable();

            $table->text('address')
                ->nullable();

            $table->date('membership_start_date')
                ->nullable();

            $table->date('membership_expiration_date')
                ->nullable();

            $table->enum('membership_status', [
                'active',
                'expired',
                'suspended',
                'inactive',
            ])->default('active');

            $table->text('notes')
                ->nullable();

            $table->timestamps();

            $table->index([
                'membership_status',
                'membership_expiration_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};