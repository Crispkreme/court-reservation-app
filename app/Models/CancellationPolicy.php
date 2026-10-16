<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CancellationPolicy extends Model
{
    protected $fillable = [
        'name',
        'cancellation_type',
        'minimum_hours_before_booking',
        'maximum_hours_before_booking',
        'refund_percentage',
        'description',
        'priority',
        'is_active',
    ];

    protected $casts = [
        'minimum_hours_before_booking' => 'integer',
        'maximum_hours_before_booking' => 'integer',
        'refund_percentage' => 'decimal:2',
        'priority' => 'integer',
        'is_active' => 'boolean',
    ];

    public function cancellations(): HasMany
    {
        return $this->hasMany(
            BookingCancellation::class,
            'cancellation_policy_id'
        );
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}