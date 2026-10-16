<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingRule extends Model
{
    protected $fillable = [
        'name',
        'rule_type',
        'membership_tier_id',
        'sport_category_id',
        'court_id',
        'event_name',
        'description',
        'starts_at',
        'ends_at',
        'booking_blocked',
        'max_bookings_per_day',
        'max_minutes_per_day',
        'max_future_bookings',
        'advance_booking_days',
        'allowed_start_time',
        'allowed_end_time',
        'allowed_days',
        'priority',
        'is_active',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'booking_blocked' => 'boolean',
        'is_active' => 'boolean',
        'allowed_days' => 'array',
    ];

    public function membershipTier(): BelongsTo
    {
        return $this->belongsTo(MembershipTier::class);
    }

    public function sportCategory(): BelongsTo
    {
        return $this->belongsTo(SportCategory::class);
    }

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeGeneral(Builder $query): Builder
    {
        return $query->where('rule_type', 'general');
    }

    public function scopeEvents(Builder $query): Builder
    {
        return $query->whereIn('rule_type', [
            'event',
            'tournament',
        ]);
    }
}