<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waitlist_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('waitlist_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            /*
             * joined
             * promoted
             * claimed
             * fulfilled
             * expired
             * cancelled
             * position_changed
             * notification_sent
             */
            $table->string('action', 50);

            $table->string('from_status', 30)
                ->nullable();

            $table->string('to_status', 30)
                ->nullable();

            $table->unsignedInteger('position')
                ->nullable();

            $table->text('description')
                ->nullable();

            $table->json('metadata')
                ->nullable();

            $table->timestamps();

            $table->index([
                'waitlist_id',
                'created_at',
            ]);

            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlist_histories');
    }
};