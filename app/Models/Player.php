<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    protected $fillable = [
        'member_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'player_type',
        'is_active',
        'skill_level',
        'location',
        'availability',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'availability' => 'array',
    ];

    protected $appends = [
        'full_name',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function bookingPlayers(): HasMany
    {
        return $this->hasMany(BookingPlayer::class);
    }

    public function bookings(): BelongsToMany
    {
        return $this->belongsToMany(
            Booking::class,
            'booking_players'
        )->withPivot([
            'participant_status',
            'invited_at',
            'responded_at',
            'checked_in_at',
            'notes',
        ])->withTimestamps();
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(PlayerInvitation::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }
}