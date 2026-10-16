<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    protected $fillable = [
        'user_id',
        'member_number',
        'first_name',
        'last_name',
        'middle_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'membership_start_date',
        'membership_expiration_date',
        'membership_status',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'membership_start_date' => 'date',
        'membership_expiration_date' => 'date',
    ];

    protected $appends = [
        'full_name',
        'is_membership_active',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function player(): HasOne
    {
        return $this->hasOne(Player::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim(
            "{$this->first_name} {$this->middle_name} {$this->last_name}"
        );
    }

    public function getIsMembershipActiveAttribute(): bool
    {
        return $this->membership_status === 'active'
            && (
                !$this->membership_expiration_date
                || $this->membership_expiration_date->isFuture()
                || $this->membership_expiration_date->isToday()
            );
    }

    public function bookings()
    {
        return $this->hasManyThrough(
            Booking::class,
            Player::class,
            'member_id',
            'id',
            'id',
            'id'
        );
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    public function activeMembership(): HasOne
    {
        return $this->hasOne(Membership::class)
            ->where('status', 'active')
            ->latestOfMany('start_date');
    }
}