<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // Who performed the action
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // What type of record was changed
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();

            // General audit classification
            $table->string('module')->index();

            // Examples:
            // created, updated, deleted, cancelled,
            // rescheduled, refunded, blocked, unblocked
            $table->string('action')->index();

            // Optional human-readable description
            $table->text('description')->nullable();

            // Before and after values
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            // Optional reason/notes
            $table->text('reason')->nullable();

            // Request information
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamp('created_at')->useCurrent();

            $table->index([
                'auditable_type',
                'auditable_id',
            ]);

            $table->index([
                'module',
                'action',
            ]);

            $table->index([
                'user_id',
                'created_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};