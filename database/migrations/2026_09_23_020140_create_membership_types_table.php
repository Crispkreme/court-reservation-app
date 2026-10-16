<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_types', function (Blueprint $table) {
            $table->id();

            /*
             * Membership type name.
             */
            $table->string('name');

            /*
             * URL/application-friendly identifier.
             */
            $table->string('slug')
                ->unique();

            /*
             * Short unique identifier for internal/business use.
             * Example: BASIC, PREMIUM, VIP.
             */
            $table->string('code')
                ->unique();

            /*
             * Membership description.
             */
            $table->text('description')
                ->nullable();

            /*
             * Base membership price.
             */
            $table->decimal('price', 12, 2)
                ->default(0);

            /*
             * Default discount configuration for this
             * membership type.
             */
            $table->enum('discount_type', [
                'none',
                'percentage',
                'fixed',
            ])->default('none');

            $table->decimal('discount_value', 12, 2)
                ->default(0);

            /*
             * Membership duration in days.
             */
            $table->unsignedInteger('duration_days')
                ->default(30);

            /*
             * Membership benefits and access rules.
             */
            $table->json('benefits')
                ->nullable();

            $table->json('access_rules')
                ->nullable();

            /*
             * Whether this membership type can currently
             * be offered to members.
             */
            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();

            /*
             * Useful when retrieving active membership types.
             */
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_types');
    }
};