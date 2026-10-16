<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Membership extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'membership_type_id',
        'start_date',
        'expiration_date',
        'status',
        'base_price',
        'discount_type',
        'discount_value',
        'final_price',
        'renewed_from_id',
        'notes',
        'expiration_notification_sent_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'expiration_date' => 'date',
        'base_price' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'final_price' => 'decimal:2',
        'expiration_notification_sent_at' => 'datetime',
    ];

    protected $appends = [
        'is_expired',
        'days_remaining',
    ];

    /**
     * Member who owns this membership.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Membership type/level.
     */
    public function membershipType(): BelongsTo
    {
        return $this->belongsTo(
            MembershipType::class,
            'membership_type_id'
        );
    }

    /**
     * Membership this membership was renewed from.
     */
    public function renewedFrom(): BelongsTo
    {
        return $this->belongsTo(
            Membership::class,
            'renewed_from_id'
        );
    }

    /**
     * Memberships created as renewals of this membership.
     */
    public function renewals(): HasMany
    {
        return $this->hasMany(
            Membership::class,
            'renewed_from_id'
        );
    }

    /**
     * Determine whether the membership is currently active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active'
            && $this->expiration_date
            && !$this->expiration_date->isBefore(today());
    }

    /**
     * Determine whether the membership has expired.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expiration_date
            ? $this->expiration_date->isBefore(today())
            : false;
    }

    /**
     * Get the number of days remaining.
     */
    public function getDaysRemainingAttribute(): int
    {
        if (!$this->expiration_date) {
            return 0;
        }

        if ($this->expiration_date->isBefore(today())) {
            return 0;
        }

        return today()->diffInDays(
            $this->expiration_date
        );
    }

    /**
     * Get the number of days until expiration.
     *
     * Can return a negative value for expired memberships.
     */
    public function daysUntilExpiration(): int
    {
        if (!$this->expiration_date) {
            return 0;
        }

        return now()
            ->startOfDay()
            ->diffInDays(
                Carbon::parse($this->expiration_date)->startOfDay(),
                false
            );
    }
}